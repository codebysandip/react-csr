import { TOAST } from "src/const.js";
import { Toaster } from "./toaster.model.js";

export function ToastEvent(options: Toaster) {
  return new CustomEvent<Toaster>(TOAST, { detail: options })
}
