import { AxiosError, AxiosResponse } from "axios";
import { AuthResponse } from "examples/auth/auth.model";
import { setAccessAndRefreshToken } from "examples/auth/auth.redux";
import { ACCESS_TOKEN, INTERNET_NOT_AVAILABLE, REFRESH_TOKEN, URL_REFRESH_TOKEN } from "src/const";
import {
  ApiResponse, getDefaultApiResponseObj, HttpClient,
  HttpClientOptions
} from "../services/http-client";

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

  /** To process message by your own replace this function code with your own code */
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
   * Replace this function body with your own code if api return different type of response While
   * replacing remember that this function will get called for success as well as error response
   *
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  HttpClient.getAuthToken = (_options) => {
    return localStorage.getItem(ACCESS_TOKEN) || "";
  };

  HttpClient.getAuthHeader = (token) => {
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  HttpClient.internetNotAvailableMsg = INTERNET_NOT_AVAILABLE;

  HttpClient.handleRefreshTokenFlow = (options: HttpClientOptions) => {
    /* c8 ignore start */
    localStorage.removeItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    const apiResponse = getDefaultApiResponseObj();
    if (!refreshToken) {
      apiResponse.status = 401;
      apiResponse.message = ["Refresh Token not available"];
      apiResponse.isSuccess = false;
      return Promise.resolve(apiResponse);
    }
    return HttpClient.post<AuthResponse>(URL_REFRESH_TOKEN, { refreshToken }).then((resp) => {
      if (resp.isSuccess && resp.data) {
        setAccessAndRefreshToken(resp as ApiResponse<AuthResponse>);
        return HttpClient.sendRequest(options.url || "/", options.method || "GET", options);
      }
      localStorage.removeItem(REFRESH_TOKEN);
      // if unable to generate token from refresh token then mark request as 401 unAuthorized
      apiResponse.status = 401;
      apiResponse.isSuccess = false;
      apiResponse.message = resp.message;
      return apiResponse;
    });
    /* c8 ignore stop */
  };

  HttpClient.setUrl = (url) => {
    const isLocal = JSON.parse(process.env.IS_LOCAL || "false") as boolean;
    const newUrl = `${isLocal ? url : process.env.API_BASE_URL + url}`;
    return newUrl;
  };

  HttpClient.retryTime = process.env.ENV === "cypress" ? 10 : 1000;
}
