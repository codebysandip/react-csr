import { ApiResponse } from "core/services/http-client.js";
import { RootState } from "src/redux/create-store.js";
import { HttpClient } from "../services/http-client.js";
import { ContextDataWithStore } from "./context-with-store.model.js";
import { ContextData } from "./context.model.js";
import { IRedirect } from "./page-data.js";

export interface GetState {
  (): RootState;
}

export type ThunkApi = typeof HttpClient;

export type PromiseApiResponseWithRedirect = Promise<
  ApiResponse<any> | IRedirect | ApiResponse<any>[]
>;
export type GetInitialPropsReturnBase =
  | PromiseApiResponseWithRedirect
  | PromiseApiResponseWithRedirect[];
/**
 * type of getInitialProps
 */
export type GetInitialProps = (ctx: ContextData) => GetInitialPropsReturnBase | IRedirect;

/**
 * type of getInitialProps when redux used
 */
export type GetInitialPropsWithStore = (
  ctx: ContextDataWithStore,
) => GetInitialPropsReturnBase | IRedirect;
