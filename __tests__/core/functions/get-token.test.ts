import {
  decodeToken,
  getAccessToken,
  getAccessTokenData,
  getRefreshToken,
  setAccessAndRefreshToken,
} from "core/functions/get-token.js";
import { AuthResponse, TokenData } from "examples/auth/auth.model.js";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "src/const.js";
import { CookieService } from "src/core/services/cookie.service.js";
import { ApiResponse } from "src/core/services/http-client.js";
import { EXPIRED_JWT_TOKEN, LONG_EXPIRY_JWT_TOKEN } from "../../utils/const.js";

describe("Get Token", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    CookieService.delete(COOKIE_ACCESS_TOKEN);
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });
  it("Should get Access Token", () => {
    CookieService.set(COOKIE_ACCESS_TOKEN, LONG_EXPIRY_JWT_TOKEN);
    expect(getAccessToken()).toBe(LONG_EXPIRY_JWT_TOKEN);
  });

  it("Should throw exception when SSR and req object undefined", () => {
    process.env.IS_SERVER = true;
    expect(getAccessToken).toThrow();
  });

  it("Should return null when Access Token not available", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("Should return null when Access Token expired", () => {
    CookieService.set(COOKIE_ACCESS_TOKEN, EXPIRED_JWT_TOKEN);
    expect(getAccessToken()).toBeNull();
  });

  it("Should return token data from Access Token", () => {
    CookieService.set(COOKIE_ACCESS_TOKEN, LONG_EXPIRY_JWT_TOKEN);
    const tokenData = getAccessTokenData();
    expect(tokenData?.username).toBe("react-ssr");
  });

  it("Should throw error when invalid JWT token", () => {
    CookieService.set(COOKIE_ACCESS_TOKEN, "invalid jwt token");
    expect(getAccessToken).toThrow();
  });

  it("Should return refresh token", () => {
    CookieService.set(COOKIE_REFRESH_TOKEN, LONG_EXPIRY_JWT_TOKEN);
    const refreshToken = getRefreshToken();
    expect(refreshToken).toBe(LONG_EXPIRY_JWT_TOKEN);
  });

  it("Should return null when refresh token expired", () => {
    CookieService.set(COOKIE_REFRESH_TOKEN, EXPIRED_JWT_TOKEN);
    const refreshToken = getRefreshToken();
    expect(refreshToken).toBeNull();
  });

  it("Should return token data from Access Token", () => {
    CookieService.set(COOKIE_ACCESS_TOKEN, LONG_EXPIRY_JWT_TOKEN);
    const tokenData = getAccessTokenData();
    expect(tokenData?.username).toBe("react-ssr");
  });

  it("Should set Access Token and Refresh Token", () => {
    const authResponse: ApiResponse<AuthResponse> = {
      status: 200,
      data: { accessToken: LONG_EXPIRY_JWT_TOKEN, refreshToken: EXPIRED_JWT_TOKEN },
      errorCode: -1,
      message: [],
      isError: false,
    };
    setAccessAndRefreshToken(authResponse);

    expect(CookieService.get(COOKIE_ACCESS_TOKEN)).toBe(authResponse.data.accessToken);
  });

  it("Should decode token on SSR", () => {
    process.env.IS_SERVER = true;
    const tokenData = decodeToken<TokenData>(LONG_EXPIRY_JWT_TOKEN);
    expect(tokenData?.username).toBe("react-ssr");
  });

  it("Should return null when token not available", () => {
    expect(getAccessTokenData()).toBeNull();
  });
});
