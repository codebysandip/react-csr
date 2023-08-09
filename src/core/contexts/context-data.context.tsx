import React, { PropsWithChildren, useEffect } from "react";
import { matchPath } from "react-router";
import { useLocation } from "react-router-dom";
import { ContextData } from "src/core/models/context.model.js";
import { getRoute } from "../functions/get-route.js";
/**
 * Context for context data
 */
export const ContextDataContext = React.createContext<ContextData | null>(null);

/**
 * ContextProvider is provider of context {@link ContextDataContext}
 * ContextProvider takes {@link ContextData} value and later on
 * App can access {@link ContextData} via [context api](https://reactjs.org/docs/context.html)
 * @param props {@link ContextProviderProps}
 * @returns ContextDataContext.Provider
 */
export const ContextProvider = (props: ContextProviderProps) => {
  const location = useLocation();
  /**
   * Set params of context when page loads or location change
   * @returns void
   */
  const setParams = () => {
    const route = getRoute(location.pathname);
    if (!route) {
      return;
    }
    const matchedRoute = matchPath(route.path, location.pathname);
    props.ctx.params = (matchedRoute?.params as Record<string, string>) || {};
  };

  setParams();

  useEffect(() => {
    setParams();
  }, [location.pathname]);
  return (
    <ContextDataContext.Provider value={props.ctx}>{props.children}</ContextDataContext.Provider>
  );
};

export interface ContextProviderProps extends PropsWithChildren {
  ctx: ContextData;
}
