import { jest } from "@jest/globals";
import { createSlice } from "src/redux/redux.imports";

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

  it("Should lazy load reducer with replace reducer", async () => {
    const { createStore, replaceReducer } = await import("src/redux/create-store.js");
    const testSlice = createSlice({
      name: "test",
      initialState: {},
      reducers: {},
    });
    const store = createStore();
    expect((store.getState() as any).test).toBeUndefined();

    replaceReducer(store, { test: testSlice.reducer });
    expect((store.getState() as any).test).not.toBeUndefined();
  });
});
