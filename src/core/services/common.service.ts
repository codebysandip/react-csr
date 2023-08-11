import { ACCESS_TOKEN, REFRESH_TOKEN } from "src/const";
import { ToastEvent } from "../models/custom-events.client";
import { Toaster } from "../models/toaster.model";

export class CommonService {
  public static toast(toaster: Toaster) {
    if (!process.env.IS_SERVER) {
      window.dispatchEvent(ToastEvent(toaster));
    }
  }

  public static logout() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  }
}
