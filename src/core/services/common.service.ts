import { Response } from "express";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } from "src/const.js";
import { ToastEvent } from "../models/custom-events.client.js";
import { Toaster } from "../models/toaster.model.js";
import { CookieService } from "./cookie.service.js";

export class CommonService {
  public static toast(toaster: Toaster) {
    if (!process.env.IS_SERVER) {
      window.dispatchEvent(ToastEvent(toaster));
    }
  }

  public static logout(res?: Response) {
    CookieService.delete(COOKIE_ACCESS_TOKEN, res);
    CookieService.delete(COOKIE_REFRESH_TOKEN, res);
  }
}
