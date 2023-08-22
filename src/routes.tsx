import { ROUTE_403, ROUTE_404, ROUTE_500, ROUTE_LOGIN } from "./const";
import { IRoute } from "./core/models/route.model";

/**
 * React routes of all pages.\
 * Always define webpackChunkName for import. This chunk name will use while creating build. This
 * will help developers to debug in production.
 */
export const Routes: IRoute[] = [
  {
    path: "/",
    component: () => import(/* webpackChunkName: "home" */ "examples/home/home.component"),
  },
  {
    path: "/product/detail/:id",
    component: () =>
      import(
        /* webpackChunkName: "product-detail" */ "examples/home/product-detail/product-detail.comp"
      ),
    private: true,
  },
  {
    path: ROUTE_LOGIN,
    component: () => import(/* webpackChunkName: "login" */ "examples/auth/login/login.comp"),
  },
  // Replace 404 component code with own code
  {
    path: ROUTE_404,
    component: () => import(/* webpackChunkName: "404" */ "src/pages/error/404/404.component"),
  },
  // Replace 500 component code with own code
  {
    path: ROUTE_500,
    component: () => import(/* webpackChunkName: "500" */ "src/pages/error/500/500.component"),
  },
  {
    path: ROUTE_403,
    component: () => import(/* webpackChunkName: "404" */ "src/pages/error/403/403.component"),
  },
];
