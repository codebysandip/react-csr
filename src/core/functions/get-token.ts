import { ApiResponse } from "core/services/http-client.js";
import { AuthResponse, JwtToken, TokenData } from "examples/auth/auth.model.js";
import { Request, Response } from "express";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "src/const.js";
import { CookieService } from "../services/cookie.service.js";

function getToken(key: string, req?: Request) {
  if (process.env.IS_SERVER && !req) {
    throw new Error("req can't be undefined in SSR");
  }
  const accessToken = CookieService.get(key, req);
  if (!accessToken) {
    return null;
  }
  const tokenData = decodeToken<JwtToken>(accessToken);
  if (isValidJwtToken(tokenData)) {
    return {
      token: accessToken,
      tokenData,
    };
  }
  return null;
}
/**
 * get access token from cookie
 * @param req Node Request Object
 * @returns access token from cookie
 */
export function getAccessToken(req?: Request) {
  const tokenWithData = getToken(COOKIE_ACCESS_TOKEN, req);
  if (!tokenWithData) {
    return null;
  }
  return tokenWithData.token;
}

/**
 * decode JWT token
 * @param token JWT token
 * @returns decoded token of type T
 */
export function decodeToken<T>(token: string) {
  try {
    let tokenStr = "";
    if (process.env.IS_SERVER) {
      tokenStr = Buffer.from(token.split(".")[1], "base64").toString();
    } else {
      tokenStr = atob(token.split(".")[1]);
    }
    return JSON.parse(tokenStr) as T;
  } catch {
    throw new Error("Invalid Jwt token");
  }
}

export function isValidJwtToken(tokenData: JwtToken) {
  if ((tokenData.exp || 1) * 1000 > Date.now()) {
    return tokenData;
  }
  return null;
}
/**
 * get access token data from cookie
 * @param req Node Request Object
 * @returns decoded token of type T
 */
export function getAccessTokenData(req?: Request) {
  const tokenWithData = getToken(COOKIE_ACCESS_TOKEN, req);
  if (!tokenWithData) {
    return null;
  }
  return tokenWithData.tokenData as TokenData;
}

/**
 * get refresh token from cookie
 * @param req Node Request Object
 * @returns refresh token from cookie
 */
export function getRefreshToken(req?: Request) {
  const tokenWithData = getToken(COOKIE_REFRESH_TOKEN, req);
  if (!tokenWithData) {
    return null;
  }
  return tokenWithData.token;
}

/**
 * set access token and refresh token in cookie
 * with expiry time
 * @param accessToken Access Token
 * @param refreshToken Refresh Token
 * @param res Node Response Object
 */
export function setAccessAndRefreshToken(apiResponse: ApiResponse<AuthResponse>, res?: Response) {
  const accessTokenData = decodeToken<TokenData>(apiResponse.data.accessToken);
  const refreshTokenData = decodeToken<TokenData>(apiResponse.data.refreshToken);
  CookieService.set(
    COOKIE_ACCESS_TOKEN,
    apiResponse.data.accessToken,
    new Date(accessTokenData.exp ? accessTokenData.exp * 1000 : Date.now()),
    res,
  );
  CookieService.set(
    COOKIE_REFRESH_TOKEN,
    apiResponse.data.refreshToken,
    new Date(refreshTokenData?.exp ? refreshTokenData?.exp * 1000 : Date.now()),
    res,
  );
}
