import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState, HeaderData, RedirectTo } from "./app.model";
import { GetState, ThunkApi } from "./core/models/common.model";
import { AppDispatch } from "./redux/create-store";

const initialState: AppState = {};

export const fetchHeader = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    return api.get<HeaderData>("/api/header").then((apiResponse) => {
      if (apiResponse.isSuccess && apiResponse.data) {
        dispatch(fetchHeaderSuccess(apiResponse.data));
        apiResponse.data = {
          header: apiResponse.data,
        } as any;
      }
      return apiResponse;
    });
  };
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    fetchHeaderSuccess: (state, action: PayloadAction<HeaderData>) => {
      state.header = action.payload;
    },
    redirectTo: (state, action: PayloadAction<RedirectTo>) => {
      state.redirectTo = action.payload;
    },
  },
});

export const { fetchHeaderSuccess, redirectTo } = appSlice.actions;
export default appSlice.reducer;
