// import * as toolkitRaw from "@reduxjs/toolkit";
// const { createSlice, configureStore, combineReducers } = ((toolkitRaw as any).default ??
//   toolkitRaw) as typeof toolkitRaw;

// export { combineReducers, configureStore, createSlice };

import {
  combineReducers as combineReducersWeb,
  configureStore as configureStoreWeb,
  createSlice as createSliceWeb,
} from "@reduxjs/toolkit";

const configureStoreFn: typeof configureStoreWeb = configureStoreWeb;
const combineReducersFn: typeof combineReducersWeb = combineReducersWeb;
const createSliceFn: typeof createSliceWeb = createSliceWeb;

export {
  combineReducersFn as combineReducers,
  configureStoreFn as configureStore,
  createSliceFn as createSlice,
};
