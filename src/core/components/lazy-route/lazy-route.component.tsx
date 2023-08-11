import { useEffect, useState } from "react";
import { useStore } from "react-redux";
import { useLocation } from "react-router";
import { INTERNET_NOT_AVAILABLE, TOAST } from "src/const";
import { CompModule, CompModuleImport } from "src/core/models/route.model";
import { Toaster } from "src/core/models/toaster.model";
import { HttpClient, isOnline, retryPromise } from "src/core/services/http-client";
import { replaceReducer } from "src/redux/create-store";
import { Loader } from "../loader/loader.comp";

/**
 * Lazy Load Route Component
 * @param props {@link LazyProps}
 * @returns Route Component or Loading Component
 */
export default function LazyRoute(props: LazyProps) {
  /* istanbul ignore next */
  const [Comp, setComp] = useState<CompModule | null>(null);
  const location = useLocation();
  const store = useStore();

  useEffect(() => {
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
  moduleProvider: CompModuleImport;
}
