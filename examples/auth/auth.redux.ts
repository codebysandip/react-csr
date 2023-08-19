import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiResponse } from "core/services/http-client";
import { AuthResponse } from "examples/auth/auth.model";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "src/const";
import { getAccessTokenData } from "src/core/functions/get-token";
import { GetState, ThunkApi } from "src/core/models/common.model";
import { AppDispatch } from "src/redux/create-store";
import { LoginPayload, TokenData } from "./auth.model";

/**
 * Set access token and refresh token in cookie\
 * With expiry time
 *
 * @param accessToken Access Token
 * @param refreshToken Refresh Token
 */
export function setAccessAndRefreshToken(apiResponse: ApiResponse<AuthResponse>) {
  localStorage.setItem(ACCESS_TOKEN, apiResponse.data.accessToken);
  localStorage.setItem(REFRESH_TOKEN, apiResponse.data.refreshToken);
}

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
