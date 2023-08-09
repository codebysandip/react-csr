import { PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse } from "core/services/http-client.js";
import { AuthResponse } from "examples/auth/auth.model.js";
import { getAccessTokenData, setAccessAndRefreshToken } from "src/core/functions/get-token.js";
import { GetState, ThunkApi } from "src/core/models/common.model.js";
import { AppDispatch } from "src/redux/create-store.js";
import { createSlice } from "src/redux/redux.imports.js";
import { LoginPayload, TokenData } from "./auth.model.js";

export interface AuthState {
  isLoggedIn: boolean;
  user?: TokenData;
  login: {
    errorMessage: string;
  };
}

const initialState: AuthState = {
  isLoggedIn: false,
  login: {
    errorMessage: "",
  },
};

export const login = (payload: LoginPayload) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.post<AuthResponse>("/api/login", payload);
    if (apiResponse.data) {
      setAccessAndRefreshToken(apiResponse as ApiResponse<AuthResponse>);
      dispatch(
        loginSuccess({
          isLoggedIn: true,
          user: getAccessTokenData() as TokenData,
        }),
      );
    } else {
      dispatch(loginError(apiResponse.message[0]));
    }
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ isLoggedIn: boolean; user?: TokenData }>) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.user = action.payload.user;
    },
    loginError: (state, action: PayloadAction<string>) => {
      state.login.errorMessage = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = undefined;
    },
  },
});

export const { loginSuccess, logout, loginError } = authSlice.actions;
export default authSlice.reducer;
