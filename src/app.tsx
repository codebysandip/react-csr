import { Header } from "core/components/header/header";
import { useEffect, useState } from "react";
import { matchPath, useLocation } from "react-router";
import { Route, Routes } from "react-router-dom";
import { CsrHead } from "src/core/components/ssr-head/csr-head.comp";
import { NO_HEADER_PATHS } from "./const";
import LazyRoute from "./core/components/lazy-route/lazy-route.component";
import { Toaster } from "./core/components/toaster/toaster.comp";
import { useAppDispatch } from "./core/hook";
import { Routes as PageRoutes } from "./routes";

export function App(props: AppProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const checkHeader = () => {
    let isHeaderVisible = true;
    for (const path of NO_HEADER_PATHS) {
      if (matchPath(path, location.pathname)) {
        isHeaderVisible = false;
        break;
      }
    }
    return isHeaderVisible;
  };
  const [showHeader, setShowHeader] = useState(checkHeader());

  useEffect(() => {
    const isHeaderVisible = checkHeader();
    if (isHeaderVisible !== showHeader) {
      setShowHeader(isHeaderVisible);
    }
  }, [location.pathname]);

  useEffect(() => {
    // ignoring if statement for code coverage as we don't include PWA while testing cypress
    /* istanbul ignore if  */
    if ("serviceWorker" in navigator) {
      // listening onmessage event to receive message from service worker
      navigator.serviceWorker.onmessage = function (evt) {
        const message = JSON.parse(evt.data);

        const isRefresh = message.type === "refresh";

        // check for message type of refresh
        // we enabled api caching in service worker. First api service from cache if available then
        // service worker calls api to fetch response and saves in cache and also return back us via postMessage with type refresh
        if (isRefresh) {
          console.log("serviceWorker updated in background!!", message);
          if (message.extra) {
            dispatch({
              type: message.extra,
              payload: message.data,
            });
          }
        }
      };
    }
  }, []);

  return (
    <>
      {/* Use SsrHead component to set common Head tags */}
      <CsrHead />
      {/* Header and footer should not visible on error page if header/footer is dynamic.
      Why? because may be error page coming because of Header/Footer api */}
      {showHeader && <Header />}
      <div className="container mt-4 mb-4">
        <Routes>
          {PageRoutes.map((r, idx) => {
            return (
              <Route
                path={r.path}
                element={<LazyRoute moduleProvider={r.component} {...props} />}
                key={idx}
              />
            );
          })}
        </Routes>
      </div>
      <Toaster />
    </>
  );
}

export interface AppProps {
  pageProps?: any;
}
