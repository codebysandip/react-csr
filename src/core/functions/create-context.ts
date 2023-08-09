import { ContextData } from "core/models/context.model.js";
import { Request, Response } from "express";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Location, useLocation, useParams } from "react-router";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useSearchParams } from "react-router-dom";

/**
 * Create context data for server side rendering.
 * This context data will pass as first parameter in getInitialProps
 * @param req {@link Request}
 * @param resp {@link Response}
 * @returns ContextData {@link ContextData}
 */
export function createContextServer(req: Request, resp: Response) {
  if (!process.env.IS_SERVER) {
    throw new Error("createContextServer function can execute only on server!!");
  }
  const context: ContextData = {
    location: {
      pathname: req.path,
      hostname: req.hostname,
    },
    query: req.query,
    params: req.params,
    req,
    res: resp,
  };
  return context;
}

/**
 * Create context data for client side
 * This context data will pass as first parameter in getInitialProps
 * @param location {@link Location} object get from {@link useLocation}
 * @param searchParams {@link URLSearchParams} query string get from {@link useSearchParams}
 * @param params Path params get from {@link useParams}
 * @returns ContextData {@link ContextData}
 */
export function createContextClient(
  location: Location,
  searchParams: URLSearchParams,
  params: Record<string, string>,
) {
  if (process.env.IS_SERVER) {
    throw new Error("createContextClient function can execute only on client!!");
  }
  const query: Record<string, string> = {};
  for (const entry of searchParams.entries()) {
    query[entry[0]] = entry[1];
  }
  const context: ContextData = {
    location: {
      pathname: location.pathname,
      hostname: window.location.hostname,
    },
    query,
    params,
  };
  return context;
}
