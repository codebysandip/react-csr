import { createContextClient, createContextServer } from "core/functions/create-context.js";
import { Request } from "express";

describe("Create Context for server and client", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });
  it("Should throw error when createContextServer called on client", () => {
    process.env.IS_SERVER = false;
    expect.assertions(1);
    try {
      createContextServer({} as any, {} as any);
    } catch (e) {
      expect((e as Error).message).toBe(
        "createContextServer function can execute only on server!!",
      );
    }
  });

  it("Should return contextData for server", () => {
    process.env.IS_SERVER = true;
    const url = new URL("http://localhost:5000");
    const req: Partial<Request> = {
      path: url.pathname,
      hostname: url.hostname,
      query: {},
      params: {},
    };
    const contextData = createContextServer(req as any, {} as any);
    expect(contextData.location.pathname).toBe(url.pathname);
  });

  it("Should throw error when createContextClient called on server", () => {
    process.env.IS_SERVER = true;
    expect.assertions(1);
    try {
      createContextClient({} as any, {} as any, {});
    } catch (e) {
      expect((e as Error).message).toBe(
        "createContextClient function can execute only on client!!",
      );
    }
  });

  it("Should return contextData for client", () => {
    const url = new URL("http://localhost:5000/?cypress=true");
    const contextData = createContextClient(
      {
        pathname: url.pathname,
        hash: "",
        key: "default",
        search: url.search,
        state: "",
      },
      new URLSearchParams(url.search),
      {},
    );
    expect(contextData.location.pathname).toBe(url.pathname);
  });
});
