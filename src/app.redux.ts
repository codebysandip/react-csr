import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { HeaderData } from "./app.model";
import { GetState, ThunkApi } from "./core/models/common.model";
import { AppDispatch } from "./redux/create-store";

export interface AppState {
  header?: HeaderData;
}

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
  },
});

export const { fetchHeaderSuccess } = appSlice.actions;
export default appSlice.reducer;
