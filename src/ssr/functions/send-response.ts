/* istanbul ignore file */
import { Request, Response } from "express";
import { IS_CYPRESS, IS_DEV } from "src/const.js";
import zlib from "zlib";

/**
 * send response function will compress response and send back to client
 * @param response response HTML
 * @param res {@link Response}
 * @param req {@link Request}
 * @param contentType content type of response
 */
export function sendResponse(
  response: string | Buffer | Record<string, any>,
  res: Response,
  req: Request,
) {
  res.set("Content-Type", typeof response === "object" ? "application/json" : "text/html");
  if (IS_DEV || IS_CYPRESS) {
    res.send(response);
    return;
  }
  const input = typeof response === "object" ? JSON.stringify(response) : response;
  const acceptEncoding = req.headers["accept-encoding"] as string;
  if (/\bbr\b/.test(acceptEncoding)) {
    zlib.brotliCompress(input, (err: any, buffer) => {
      if (err) {
        res.send(response);
        return;
      }
      res.set("Content-Encoding", "br");
      res.send(buffer);
    });
  } else if (/\bdeflate\b/.test(acceptEncoding)) {
    zlib.deflate(input, (err: any, buffer) => {
      if (err) {
        res.send(response);
        return;
      }
      res.set("Content-Encoding", "deflate");
      res.send(buffer);
    });
  } else if (/\bgzip\b/.test(acceptEncoding)) {
    zlib.gzip(input, (err: any, buffer) => {
      if (err) {
        res.send(response);
        return;
      }
      res.set("Content-Encoding", "gzip");
      res.send(buffer);
    });
  } else {
    res.send(response);
  }
}
