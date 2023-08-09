import { jest } from "@jest/globals";
import { createSlice } from "src/redux/redux.imports.js";

describe("Create Redux Store", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("Should create store", async () => {
    const createStore = (await import("src/redux/create-store.js")).createStore;
    const store = createStore();
    expect(store).not.toBeUndefined();
  });

  it("Should create store with a provided lazy reducer", async () => {
    process.env.IS_SERVER = true;
    const createStore = (await import("src/redux/create-store.js")).createStore;
    const testSlice = createSlice({
      name: "test",
      initialState: {},
      reducers: {},
    });
    const store = createStore({ test: testSlice.reducer });
    expect((store.getState() as any).test).not.toBeUndefined();
  });

  it("Should lazy load reducer with replace reducer", async () => {
    const { createStore, replaceReducer } = await import("src/redux/create-store.js");
    const testSlice = createSlice({
      name: "test",
      initialState: {},
      reducers: {},
    });
    const store = createStore();
    replaceReducer(store, { test1: testSlice.reducer });
    expect((store.getState() as any).test1).not.toBeUndefined();
  });
});
