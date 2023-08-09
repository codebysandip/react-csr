import * as toolkitRaw from "@reduxjs/toolkit";
const { createSlice, configureStore, combineReducers } = ((toolkitRaw as any).default ??
  toolkitRaw) as typeof toolkitRaw;

export { combineReducers, configureStore, createSlice };
