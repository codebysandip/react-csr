import { jest } from "@jest/globals";
import { ROUTE_500, ROUTE_LOGIN } from "src/const.js";
import { GetInitialProps } from "src/core/models/common.model.js";
import { CompModule } from "src/core/models/route.model.js";
import { getDefaultApiResponseObj } from "src/core/services/http-client.js";

describe("Process Request Common Function", () => {
  const OLD_ENV = process.env;
  const mockConfigureStore = jest.fn();
  const mockPreInitialProps = jest.fn();
  beforeEach(async () => {
    process.env = { ...OLD_ENV };
    const ssrConfig = (await import("src/react-ssr.config.js")).ssrConfig;
    jest.unstable_mockModule("src/react-ssr.config.js", () => {
      return {
        __esModule: true,
        ssrConfig: {
          ...ssrConfig,
          configureStore: mockConfigureStore,
          preInitialProps: mockPreInitialProps,
        },
      };
    });
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("Should throw error when Component doesn't export default", async () => {
    const module: CompModule = {
      default: null,
    };
    expect.assertions(1);
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    try {
      await processRequest(module, {} as any, true);
    } catch (e) {
      expect((e as Error).message).toBe("Page component must export component as default");
    }
  });

  it("Should call configureStore when SSR", async () => {
    process.env.IS_SERVER = true;

    expect.assertions(1);
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    try {
      const module: CompModule = {
        default: null,
      };

      await processRequest(module, {} as any, true);
    } catch (e) {
      expect(mockConfigureStore).toBeCalled();
    }
  });

  it("Should call preInitialProps when processRequest get called", async () => {
    process.env.IS_SERVER = true;

    expect.assertions(1);
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    const module: CompModule = {
      default: jest.fn(),
    };

    await processRequest(module, {} as any, true);
    expect(mockPreInitialProps).toBeCalled();
  });

  it("Should call throw error when getInitialProps doesn't return Promise or IRedirect", async () => {
    process.env.IS_SERVER = true;

    expect.assertions(1);
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    const mockGetInitialProps = jest.fn<any>();
    mockGetInitialProps.mockReturnValue("Test wrong value");
    const module: CompModule = {
      default: jest.fn(),
      getInitialProps: mockGetInitialProps,
    };
    try {
      await processRequest(module, {} as any, true);
    } catch (e) {
      expect((e as Error).message).toBe("getInitialProps must return Promise");
    }
  });

  it("Should return correct redirect path when getInitialProps return redirect path", async () => {
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    const mockGetInitialProps = jest.fn<GetInitialProps>();
    const module: CompModule = {
      default: jest.fn(),
      getInitialProps: mockGetInitialProps,
    };
    mockGetInitialProps.mockReturnValue({ redirect: { path: "test path" } });
    const result = await processRequest(module, {} as any, true);
    expect(result.redirect.path).toBe("test path");

    mockGetInitialProps.mockReturnValue(Promise.resolve({ redirect: { path: "test path" } }));
    const newResult = await processRequest(module, {} as any, true);
    expect(newResult.redirect.path).toBe("test path");
  });

  it("Should return redirect path 500 when getInitialProps/preInitialProps throw error", async () => {
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    const mockGetInitialProps = jest.fn<GetInitialProps>();
    const module: CompModule = {
      default: jest.fn(),
      getInitialProps: mockGetInitialProps,
    };
    mockGetInitialProps.mockReturnValue(Promise.resolve(getDefaultApiResponseObj()));
    mockPreInitialProps.mockReturnValue(Promise.reject(new Error("Test Error")));
    const result = await processRequest(module, {} as any, true);
    expect(result.redirect.path).toBe(ROUTE_500);
  });

  it("Should return redirect path when getInitialProps/preInitialProps will return error status", async () => {
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    const mockGetInitialProps = jest.fn<GetInitialProps>();
    const module: CompModule = {
      default: jest.fn(),
      getInitialProps: mockGetInitialProps,
    };
    const pageResp = getDefaultApiResponseObj();
    pageResp.status = 401;
    mockGetInitialProps.mockReturnValue(Promise.resolve(pageResp));
    mockPreInitialProps.mockReturnValue(Promise.resolve(getDefaultApiResponseObj()));
    const result = await processRequest(module, { store: { dispatch: jest.fn() } } as any, true);
    expect(result.redirect.path).toBe(ROUTE_LOGIN);
  });

  it("Should return correct data when getInitialProps/preInitialProps will success", async () => {
    const processRequest = (await import("core/functions/process-request.js")).processRequest;
    const mockGetInitialProps = jest.fn<GetInitialProps>();
    const module: CompModule = {
      default: jest.fn(),
      getInitialProps: mockGetInitialProps,
    };
    mockGetInitialProps.mockReturnValue(Promise.resolve(getDefaultApiResponseObj({ count: 5 })));
    mockPreInitialProps.mockReturnValue(
      Promise.resolve(getDefaultApiResponseObj({ header: { links: [] } })),
    );
    const result = await processRequest(module, {} as any, true);
    expect((result.pageData as any).count).toBe(5);
    expect((result.pageData as any).header).not.toBeUndefined();
  });
});
