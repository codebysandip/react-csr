import { AppStore } from "src/redux/create-store.js";
import { ContextData } from "core/models/context.model.js";

export interface ContextDataWithStore extends ContextData {
  /**
   * Redux store
   */
  store: AppStore;
}
