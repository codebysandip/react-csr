import { jest } from "@jest/globals";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { COOKIE_ACCESS_TOKEN } from "src/const.js";
import { configureHttpClient } from "src/core/functions/configure-http-client.js";
import { CookieService } from "src/core/services/cookie.service.js";
import {
  ApiResponse,
  getDefaultApiResponseObj,
  HttpClient,
} from "src/core/services/http-client.js";
import { EXPIRED_JWT_TOKEN, LONG_EXPIRY_JWT_TOKEN } from "../../utils/const.js";
import { navigatorOnline } from "../../utils/spy-on/navigator.spy.js";

const mock = new MockAdapter(axios);
const request = {
  success: {
    url: "/api/test-api",
    responseBody: {
      message: "Success",
    },
  },
  badRequest: {
    url: "/api/400-response",
    responseBody: {},
  },
  badRequestWithResponse: {
    url: "/api/400-response-with-body",
    responseBody: {
      message: "This is test error message",
    },
  },
  withAuth: {
    url: "/api/with-auth",
    responseBody: {},
  },
  badRequestWithMultipleResponseMessage: {
    url: "/api/400-response-with-multiple-message",
    responseBody: {
      message: ["This is test error message", "This is another test error message"],
    },
  },
};

describe("HttpClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mock.reset();
    navigatorOnline(true);
    configureHttpClient();
    HttpClient.retryTime = 10;
    CookieService.delete(COOKIE_ACCESS_TOKEN);
  });

  afterEach(() => {
    configureHttpClient();
  });

  it("Should return ApiResponse.status 200 when success api response", async () => {
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.status).toEqual(200);
  });

  it("Should return ApiResponse.status 0 when internet not available", async () => {
    navigatorOnline(false);
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get(request.success.url);
    expect(apiResponse.status).toEqual(0);
  });

  it("Should return ApiResponse.status 400 when api will return 400 status and data should be undefined", async () => {
    mock.onGet(request.badRequest.url).replyOnce(400, request.badRequest.responseBody);
    const apiResponse = await HttpClient.get(request.badRequest.url);
    expect(apiResponse.status).toEqual(400);
    expect(apiResponse.data).toStrictEqual(undefined);
  });

  it("Should return response body in ApiResponse.data when HttpClientOptions.sendResponseWhenError true", async () => {
    mock
      .onGet(request.badRequestWithResponse.url)
      .replyOnce(400, request.badRequestWithResponse.responseBody);
    const apiResponse = await HttpClient.get(request.badRequestWithResponse.url, {
      sendResponseWhenError: true,
    });
    expect(apiResponse.status).toEqual(400);
    expect(apiResponse.data).toStrictEqual(request.badRequestWithResponse.responseBody);
  });

  it("Should set Authentication Header when HttpClientOptions.isAuth true", async () => {
    mock
      .onGet(request.badRequestWithResponse.url)
      .replyOnce(400, request.badRequestWithResponse.responseBody);
    window.document.cookie = `${COOKIE_ACCESS_TOKEN}=${LONG_EXPIRY_JWT_TOKEN}`;
    const apiResponse = await HttpClient.get(request.success.url, { isAuth: true });
    expect(apiResponse.response?.config.headers?.Authorization).toEqual(
      `Bearer ${LONG_EXPIRY_JWT_TOKEN}`,
    );
  });

  it("Should return 401 status response when HttpClient.handleRefreshTokenFlow undefined and 401 server response", async () => {
    mock.onGet(request.success.url).replyOnce(401, request.success.responseBody);
    CookieService.set(COOKIE_ACCESS_TOKEN, LONG_EXPIRY_JWT_TOKEN);
    HttpClient.handleRefreshTokenFlow = undefined;
    const apiResponse = await HttpClient.get(request.success.url, { isAuth: true });
    expect(apiResponse.status).toBe(401);
  });

  it("Should call HttpClient.handleRefreshTokenFlow token when 401 server response", async () => {
    mock.onGet(request.success.url).replyOnce(401, request.success.responseBody);
    window.document.cookie = `${COOKIE_ACCESS_TOKEN}=${EXPIRED_JWT_TOKEN}`;
    const mockFn = jest.fn<() => Promise<ApiResponse<unknown>>>();
    mockFn.mockReturnValueOnce(Promise.resolve(getDefaultApiResponseObj()));
    HttpClient.handleRefreshTokenFlow = mockFn;
    await HttpClient.get(request.success.url, { isAuth: true });
    expect(mockFn).toBeCalled();
  });

  it("Should throw error when HttpClient.handleRefreshTokenFlow will not return ApiResponse object", async () => {
    mock.onGet(request.success.url).replyOnce(401, request.success.responseBody);
    window.document.cookie = `${COOKIE_ACCESS_TOKEN}=${EXPIRED_JWT_TOKEN}`;
    const mockFn = jest.fn<() => Promise<unknown>>();

    HttpClient.handleRefreshTokenFlow = mockFn as any;
    mockFn.mockReturnValueOnce(Promise.resolve({}));
    expect.assertions(2);
    const apiResponse = await HttpClient.get(request.success.url, { isAuth: true });
    expect(apiResponse.message[0]).toBe(
      "handleRefreshTokenFlow should return object of ApiResponse",
    );
    mock.onGet(request.success.url).replyOnce(401, request.success.responseBody);
    // eslint-disable-next-line prefer-promise-reject-errors
    mockFn.mockReturnValueOnce(Promise.reject({}));
    const apiResponse1 = await HttpClient.get(request.success.url, { isAuth: true });
    expect(apiResponse1.message[0]).toBe(
      "handleRefreshTokenFlow should return object of ApiResponse",
    );
  });

  it("Should return message when api will return message", async () => {
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.message).toEqual([request.success.responseBody.message]);
  });

  it("Should return multiple error message when api will return", async () => {
    mock
      .onGet(request.badRequestWithMultipleResponseMessage.url)
      .replyOnce(400, request.badRequestWithMultipleResponseMessage.responseBody);
    const apiResponse = await HttpClient.get(request.badRequestWithMultipleResponseMessage.url);
    expect(apiResponse.status).toEqual(400);
    expect(JSON.stringify(apiResponse.message)).toStrictEqual(
      JSON.stringify(request.badRequestWithMultipleResponseMessage.responseBody.message),
    );
  });

  it("Should throw error when processMessage not configured", async () => {
    HttpClient.processMessage = undefined;
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.message[0]).toBe("Please set HttpClient.processMessage in your application");
  });

  it("Should throw error when getStatusCode not configured", async () => {
    HttpClient.getStatusCode = undefined;
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.message[0]).toBe("Please set HttpClient.getStatusCode in your application");
  });

  it("Should throw error when processData not configured", async () => {
    HttpClient.processData = undefined;
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.message[0]).toBe("Please set HttpClient.processData in your application");
  });

  it("Should throw error when getErrorCode not configured", async () => {
    HttpClient.getErrorCode = undefined;
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.message[0]).toBe("Please set HttpClient.getErrorCode in your application");
  });

  it("Should throw error when getAuthToken not configured", async () => {
    HttpClient.getAuthToken = undefined;
    expect.assertions(1);
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    try {
      await HttpClient.get<Record<string, any>>(request.success.url, {
        isAuth: true,
      });
    } catch (err) {
      expect((err as Error).message).toBe("Please set HttpClient.getAuthToken in your application");
    }
  });

  it("Should throw error when getAuthHeader not configured", async () => {
    HttpClient.getAuthHeader = undefined;
    expect.assertions(1);
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    window.document.cookie = `${COOKIE_ACCESS_TOKEN}=${LONG_EXPIRY_JWT_TOKEN}`;

    try {
      await HttpClient.get<Record<string, any>>(request.success.url, {
        isAuth: true,
      });
    } catch (err) {
      expect((err as Error).message).toBe(
        "Please set HttpClient.getAuthHeader in your application",
      );
    }
  });

  it("Should return 401 when isAuth true and token not available without sending request", async () => {
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url, {
      isAuth: true,
    });
    expect(apiResponse.status).toBe(401);
  });

  it("Should set doCache header when set in option", async () => {
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url, {
      doCache: true,
    });

    expect(apiResponse.response?.config.headers?.doCache).toBe(true);
  });

  it("Should set extra header when set in option", async () => {
    HttpClient.isServer = false;
    mock.onGet(request.success.url).replyOnce(200, request.success.responseBody);
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url, {
      extra: "test",
    });

    expect(apiResponse.response?.config.headers?.extra).toBe("test");
  });

  it("Should set cookie in node response obj when api will return set-cookie", async () => {
    HttpClient.isServer = true;
    mock
      .onGet(request.success.url)
      .replyOnce(200, request.success.responseBody, { "Set-Cookie": "test" });
    const mockSetHeader = jest.fn();
    await HttpClient.get<Record<string, any>>(request.success.url, {
      nodeRespObj: {
        setHeader: mockSetHeader as any,
      } as any,
      nodeReqObj: {} as any,
    });
    expect(mockSetHeader).toBeCalled();
  });

  it("Should return correct status when response status is 200 and actual status in response body", async () => {
    mock.onGet(request.success.url).replyOnce(200, { status: 400 });
    const apiResponse = await HttpClient.get<Record<string, any>>(request.success.url);
    expect(apiResponse.status).toBe(400);
  });
});
