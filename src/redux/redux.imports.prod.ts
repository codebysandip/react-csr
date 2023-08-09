import {
  configureStore as configureStoreWeb,
  combineReducers as combineReducersWeb,
  createSlice as createSliceWeb,
} from "@reduxjs/toolkit";

let configureStoreFn: typeof configureStoreWeb;
let combineReducersFn: typeof combineReducersWeb;
let createSliceFn: typeof createSliceWeb;

if (process.env.IS_SERVER) {
  // const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const toolkitRaw = require("@reduxjs/toolkit");
  const toolkit = toolkitRaw.default || toolkitRaw;
  const { configureStore, combineReducers, createSlice } = toolkit;
  configureStoreFn = configureStore;
  combineReducersFn = combineReducers;
  createSliceFn = createSlice;
} else {
  configureStoreFn = configureStoreWeb;
  combineReducersFn = combineReducersWeb;
  createSliceFn = createSliceWeb;
}

export { configureStoreFn as configureStore };
export { combineReducersFn as combineReducers };
export { createSliceFn as createSlice };