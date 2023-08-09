import { AuthState } from "examples/auth/auth.redux.js";
import { HomeState } from "examples/home/home.redux.js";
import { AppState } from "src/app.redux.js";

export interface RootState {
  home: HomeState;
  auth: AuthState;
  app: AppState;
}
