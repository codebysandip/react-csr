import { AxiosError, AxiosResponse } from "axios";
import { AuthResponse } from "examples/auth/auth.model.js";
import {
  API_URL,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  INTERNET_NOT_AVAILABLE,
  URL_REFRESH_TOKEN,
} from "src/const.js";
import { CommonService } from "../services/common.service.js";
import { CookieService } from "../services/cookie.service.js";
import {
  ApiResponse,
  getDefaultApiResponseObj,
  HttpClient,
  HttpClientOptions,
} from "../services/http-client.js";
import { setAccessAndRefreshToken } from "./get-token.js";

export function getAxiosResponseFromResponse(response: AxiosResponse<any> | AxiosError<any>) {
  let resp: AxiosResponse | undefined;
  if (!(response as AxiosError).isAxiosError) {
    resp = response as AxiosResponse<any>;
  } else {
    resp = (response as AxiosError<any>).response;
  }
  return resp;
}

export function configureHttpClient() {
  HttpClient.getStatusCode = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);
    return resp?.data.status || resp?.status || 0;
  };

  /**
   * To process message by your own replace this function code
   * with your own code
   */
  HttpClient.processMessage = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);

    const data: any = resp?.data;
    let message: string[] = [];
    const status: number = (data && data.statusCode) || resp?.status;

    if (status < 400) {
      const successMessage = data && data.message;
      if (typeof successMessage === "string") {
        message.push(successMessage);
      }
    } else {
      const errorMessage = data && data.message;
      if (typeof errorMessage === "string") {
        message.push(errorMessage);
      } else if (Array.isArray(errorMessage) && typeof errorMessage[0] === "string") {
        message = errorMessage;
      }
    }
    return message;
  };
  /**
   * Replace this function body with your own code if api return different type of response
   * While replacing remember that this function will get called for success as well as error response
   * @param response AjaxResponse<any> | AjaxError
   * @returns Api Response
   */
  HttpClient.processData = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);

    const data: any = resp?.data;
    // can check instanceOf to know response type
    // some api send data in response and data field contain actual data
    return data?.data || data;
  };

  HttpClient.getErrorCode = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);
    const data: any = resp?.data;
    return data?.errorCode || -1;
  };

  HttpClient.getStatusCode = (response: AxiosResponse<any> | AxiosError<any>) => {
    const resp = getAxiosResponseFromResponse(response);
    return resp?.data?.status || resp?.status || 0;
  };

  HttpClient.onResponse = (apiResponse, options) => {
    if (apiResponse.isError && apiResponse.message.length && options.showNotificationMessage) {
      CommonService.toast({
        type: "error",
        message: apiResponse.message[0],
      });
    }
  };

  HttpClient.getAuthToken = (options) => {
    return CookieService.get(COOKIE_ACCESS_TOKEN, options.nodeReqObj) || "";
  };

  HttpClient.getAuthHeader = (token) => {
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  HttpClient.internetNotAvailableMsg = INTERNET_NOT_AVAILABLE;

  HttpClient.handleRefreshTokenFlow = (options: HttpClientOptions) => {
    /* c8 ignore start */
    CookieService.delete(COOKIE_ACCESS_TOKEN, options.nodeRespObj);
    const refreshToken = CookieService.get(COOKIE_REFRESH_TOKEN, options.nodeReqObj);
    const apiResponse = getDefaultApiResponseObj();
    if (!refreshToken) {
      apiResponse.status = 401;
      apiResponse.message = ["Refresh Token not available"];
      return Promise.resolve(apiResponse);
    }
    return HttpClient.post<AuthResponse>(URL_REFRESH_TOKEN, { refreshToken }).then((resp) => {
      if (!resp.isError && resp.data) {
        setAccessAndRefreshToken(resp as ApiResponse<AuthResponse>, options.nodeRespObj);
        return HttpClient.sendRequest(options.url || "/", options.method || "GET", options);
      }
      CookieService.delete(COOKIE_REFRESH_TOKEN, options.nodeRespObj);
      // if unable to generate token from refresh token then mark request as 401 unAuthorized
      apiResponse.status = 401;
      apiResponse.isError = true;
      apiResponse.message = resp.message;
      return apiResponse;
    });
    /* c8 ignore stop */
  };

  HttpClient.setUrl = (url) => {
    return `${process.env.IS_SERVER ? API_URL : ""}${url}`;
  };

  HttpClient.retryTime = process.env.ENV === "cypress" ? 10 : 1000;
}
