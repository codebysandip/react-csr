import { ROUTE_500 } from "src/const.js";
import { ssrConfig } from "src/react-ssr.config.js";

import { ApiResponse } from "core/services/http-client.js";
import { GetInitialProps, PromiseApiResponseWithRedirect } from "../models/common.model.js";
import { ContextData } from "../models/context.model.js";
import { IRedirect, PageData, PageRedirect } from "../models/page-data.js";
import { CompModule } from "../models/route.model.js";
import { PreInitialProps } from "../models/ssr-config.model.js";

/**
 * processRequest process request on client as we well as server
 * It works in following order:
 * {@link ssrConfig.configureStore} (on server only) => {@link ssrConfig.preInitialProps} =>
 * getInitialProps => {@link ssrConfig.validateApiResponse} for every api call
 * processRequest returns {@link ProcessRequestResult.apiResponse} only in case of all success api response
 * @param module exports of page component
 * @param ctx {@link ContextData}
 * @param isFirstRendering flag to know it's first rendering, this flag passed to {@link ssrConfig.preInitialProps}
 * @returns ProcessRequestResult
 */
export function processRequest(module: CompModule, ctx: ContextData, isFirstRendering: boolean) {
  return new Promise<ProcessRequestResult>((resolve) => {
    const Component = module.default;
    if (!Component) {
      throw new Error("Page component must export component as default");
    }
    const getInitialProps = (Component.getInitialProps || module.getInitialProps) as
      | GetInitialProps
      | undefined;

    let headerFooterPromise: ReturnType<PreInitialProps>;
    if (ssrConfig.preInitialProps) {
      headerFooterPromise = ssrConfig.preInitialProps(ctx, module, isFirstRendering);
    }

    const promiseArr: PromiseApiResponseWithRedirect[] = [];
    // get page data
    if (getInitialProps) {
      // call page/route getInitialProps static method to get async data to render page
      // this data will pass as props to page/route component
      const initialProps: ReturnType<GetInitialProps> = getInitialProps(ctx);
      if ((initialProps as IRedirect).redirect) {
        resolve({
          redirect: (initialProps as IRedirect).redirect,
          isError: true,
        });
        return;
      }

      if (Array.isArray(initialProps)) {
        promiseArr.push(...initialProps);
      } else if (initialProps instanceof Promise) {
        promiseArr.push(initialProps);
      } else {
        throw new Error("getInitialProps must return Promise");
      }
    }
    if (Array.isArray(headerFooterPromise)) {
      promiseArr.push(...headerFooterPromise);
    } else if (headerFooterPromise instanceof Promise) {
      promiseArr.push(headerFooterPromise);
    }
    Promise.all(promiseArr)
      .then((result) => {
        let pageData: any = {};
        let redirect: PageRedirect = { path: "" };
        // check for every api response object for error
        for (const data of result) {
          const validate = (apiResponse: ApiResponse<any> | IRedirect) => {
            if ((apiResponse as IRedirect).redirect) {
              redirect = (apiResponse as IRedirect).redirect;
              return false;
            }
            const resp = apiResponse as ApiResponse<any>;
            const redirectObj = ssrConfig.validateApiResponse(resp, ctx);
            if (redirectObj.path) {
              redirect = redirectObj;
              return false;
            }
            if (typeof resp.data === "object") {
              pageData = {
                ...pageData,
                ...resp.data,
              };
              return true;
            }
            /* c8 ignore next */
            return false;
          };
          const dataToValidate = Array.isArray(data) ? data : [data];
          for (const apiResponse of dataToValidate) {
            if (!validate(apiResponse)) {
              break;
            }
          }
        }
        if (redirect.path) {
          resolve({
            redirect,
            isError: true,
          });
        } else {
          resolve({
            redirect: { path: "" },
            isError: false,
            pageData,
          });
        }
      })
      .catch((err) => {
        console.error(
          `Error in getInitialProps/preInitialProps of ${Component.constructor.name}.Error: ${err}`,
        );
        resolve({
          redirect: { path: ROUTE_500 },
          isError: true,
        });
      });
  });
}

export interface ProcessRequestResult {
  redirect: PageRedirect;
  isError: boolean;
  pageData?: PageData;
}
