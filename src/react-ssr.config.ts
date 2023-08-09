import { ApiResponse } from "core/services/http-client.js";
import { createStore, replaceReducer } from "src/redux/create-store";
import { loginSuccess, logout } from "../examples/auth/auth.redux.js";
import { fetchHeader } from "./app.redux.js";
import { PAGE_INVALID_RETURN_DATA, ROUTE_403, ROUTE_404, ROUTE_500, ROUTE_LOGIN } from "./const.js";
import { getRoute } from "./core/functions/get-route.js";
import { getAccessTokenData } from "./core/functions/get-token.js";
import { ContextDataWithStore } from "./core/models/context-with-store.model.js";
import { ContextData } from "./core/models/context.model.js";
import { CompModule } from "./core/models/route.model.js";
import { SSRConfig } from "./core/models/ssr-config.model.js";
import { CommonService } from "./core/services/common.service.js";

export const ssrConfig: SSRConfig = {
  configureStore: (module: CompModule, ctx: ContextData) => {
    const store = createStore(module.reducer);
    (ctx as ContextDataWithStore).store = store;
  },
  preInitialProps: (ctx: ContextData, moduleObj, isFirstRendering) => {
    // inject lazy loaded reducer into store
    if (moduleObj.reducer && (ctx as any).store) {
      replaceReducer((ctx as any).store, moduleObj.reducer);
    }

    const accessTokenData = getAccessTokenData(ctx.req);
    const store = (ctx as ContextDataWithStore).store;
    if (accessTokenData) {
      store.dispatch(
        loginSuccess({
          isLoggedIn: true,
          user: accessTokenData,
        }),
      );
    }
    const route = getRoute(ctx.location.pathname);
    // Route.isSSR will false then server will not send page data and header data
    // so on client side fetch data for header
    if ((process.env.IS_SERVER && route?.isSSR) || (!process.env.IS_SERVER && isFirstRendering)) {
      return store.dispatch(fetchHeader());
    }
  },
  getSsrData: (ctx: ContextData) => {
    return (ctx as ContextDataWithStore).store.getState();
  },
  validateApiResponse: (response: ApiResponse<any>, ctx: ContextData) => {
    /* istanbul ignore if */
    if (response.status === undefined) {
      throw new Error(PAGE_INVALID_RETURN_DATA);
    }
    if (response.status === 401 || response.status === 403) {
      if (response.status === 401) {
        (ctx as ContextDataWithStore).store.dispatch(logout());
        CommonService.logout(ctx.res);
        return { path: ROUTE_LOGIN };
      } else {
        return { path: ROUTE_403 };
      }
    } else if (response.status.toString().startsWith("5") || response.status === 0) {
      return { path: ROUTE_500 };
    } else if (response.status === 404) {
      return { path: ROUTE_404 };
    } else if (response.status === 600) {
      return { path: ROUTE_500 };
    } else {
      return { path: "" };
    }
  },
};
