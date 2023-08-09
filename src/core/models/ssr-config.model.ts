import { ApiResponse } from "core/services/http-client.js";
import { GetInitialPropsReturnBase } from "./common.model.js";
import { ContextData } from "./context.model.js";
import { PageRedirect } from "./page-data.js";
import { CompModule } from "./route.model.js";

export interface SSRConfig {
  /**
   * Implement this function react-ssr.config.ts to create store
   * ReactSsr internally call this function before calling getInitialProps
   * create store in this function and add reference of store in context
   * ReactSsr send module object to enable lazy loading of reducer
   * @link https://redux.js.org/usage/code-splitting
   */
  configureStore?: (module: CompModule, ctx: ContextData) => void;
  /**
   * Implement this function to execute common code and fetch dynamic header/footer
   * ReactSsr internally call this function before calling getInitialProps.
   * This function get call on server as well as client so if you need to execute any code
   * on server only then
   * @example
   * if (process.env.IS_SERVER) {
   *  // put code here to execute only on server like dynamic header
   * }
   * @returns If you are calling/(dispatching action for) api make sure to return {@link Promise<ApiResponse<any>>}
   * ReactSsr will check ApiResponse.status for success
   */
  preInitialProps?: PreInitialProps;
  /**
   * Implement this function to modify ssrData
   * ReactSsr set ssr data on window object with key __SSRDATA__
   * Widely used this function when you implement store (store.getState())
   * ReactSsr will call this function if implemented
   * @returns any data to set __SSRDATA__
   */
  getSsrData?: (ctx: ContextData) => any;
  /**
   * Validate response of api and return redirect path in case of error
   * ReactSsr call this function after getting api response
   * Note: this function will call only for page api
   * This function will call on both client and server
   * client will navigate to returned path if path available
   * @param response ApiResponse
   * @returns redirect path
   */
  validateApiResponse: (response: ApiResponse<any>, ctx: ContextData) => PageRedirect;
}
export type PreInitialProps = (
  ctx: ContextData,
  moduleObj: CompModule,
  isFirstRendering: boolean,
) => GetInitialPropsReturnBase | void;
