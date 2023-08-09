import { createContextServer } from "core/functions/create-context.js";
import { getRoute } from "core/functions/get-route.js";
import { processRequest as processRequestServer } from "core/functions/process-request";
import { PageData } from "core/models/page-data.js";
import { Request, Response } from "express";
import { matchPath } from "react-router";
import { ROUTE_404 } from "src/const.js";
import { Empty } from "src/core/components/empty/empty.component.js";
import { getHtml } from "src/ssr/template.js";
import { sendResponse } from "../functions/send-response.js";

/**
 * Process all get requests
 * @param staticPageCache node-cache object
 * @returns void
 */
export const processRequest = () => {
  return (req: Request, resp: Response) => {
    // match route from React routes
    const route = getRoute(req.path);
    if (!route) {
      resp.redirect(ROUTE_404);
      return;
    }
    req.params = (matchPath(route.path, req.path)?.params as Record<string, string>) || {};
    if (route.static || !route.isSSR) {
      const html = staticPageCache.get(req.url) as string;
      if (html) {
        console.log("static page!!", req.url);
        sendResponse(html, resp, req);
        return;
      }
    }

    const ctx = createContextServer(req, resp);
    if (!route.isSSR || req.query.cypress) {
      ctx.ssrData = {};
      const html = getHtml(
        {
          default: Empty,
        },
        ctx,
        req.url,
        false,
      );
      sendResponse(html, resp, req);
      return;
    }
    // get component asynchronously
    route
      .component()
      .then(async (module) => {
        /**
         * Send HTML back to client
         * @param url Request url path
         * @param pageData PageData of page
         * @param isError is error page
         */
        const sendHtml = (url: string, pageData?: PageData, isError = false) => {
          // redirect to error path in case of error
          /* istanbul ignore if */
          if (isError) {
            resp.redirect(url);
            return;
          }
          /* istanbul ignore if */
          if (!pageData) {
            pageData = {};
          }
          ctx.ssrData = pageData;

          const html = getHtml(module, ctx, url, route.isSSR);
          if (route.static || !route.isSSR) {
            staticPageCache.set(req.url, html);
          }
          sendResponse(html, resp, req);
        };

        processRequestServer(module, ctx, true).then((data) => {
          if (resp.headersSent) {
            return;
          }
          sendHtml(data.isError ? data.redirect.path : req.url, data.pageData, data.isError);
        });
      })
      .catch(
        /* istanbul ignore next */ (err) => {
          console.error(`Error in fetching page component for ${route.path}. Error: ${err}`);
          throw err;
        },
      );
  };
};
