import { useEffect, useState } from "react";
import { useStore } from "react-redux";
import { useLocation } from "react-router";
import { INTERNET_NOT_AVAILABLE, TOAST } from "src/const.js";
import { CompModule, CompModuleImport } from "src/core/models/route.model.js";
import { Toaster } from "src/core/models/toaster.model.js";
import { HttpClient, isOnline, retryPromise } from "src/core/services/http-client.js";
import { replaceReducer } from "src/redux/create-store.js";
import { Loader } from "../loader/loader.comp.js";

let locationPath = process.env.IS_SERVER ? "default" : location.pathname;

/**
 * Lazy Load Route Component
 * @param props {@link LazyProps}
 * @returns Route Component or Loading Component
 */
export default function LazyRoute(props: LazyProps) {
  /* istanbul ignore next */
  const [Comp, setComp] = useState<CompModule | null>(props.module || null);
  const location = useLocation();
  const store = useStore();

  if (props.module) {
    replaceReducer(store, props.module.reducer as any);
  }

  useEffect(() => {
    if (locationPath === location.pathname) {
      return;
    }
    locationPath = location.pathname;

    retryPromise(isOnline, 1000, HttpClient.maxRetryCount)
      .then(() => {
        props.moduleProvider().then((moduleObj) => {
          if (moduleObj.reducer) {
            replaceReducer(store, moduleObj.reducer as any);
          }
          setComp(moduleObj);
        });
      })
      .catch(() => {
        window.dispatchEvent(
          new CustomEvent<Toaster>(TOAST, {
            detail: {
              type: "error",
              message: INTERNET_NOT_AVAILABLE,
            },
          }),
        );
      });

    // show loader while lazy load component
    setComp(null);
  }, [location.pathname]);

  if (Comp) {
    return <Comp.default />;
  }
  return <Loader />;
}

export interface LazyProps {
  /**
   * Module to render
   * Module will come only when page will reload check [client.tsx](../../../client.tsx)
   */
  module?: CompModule;
  moduleProvider: CompModuleImport;
}
