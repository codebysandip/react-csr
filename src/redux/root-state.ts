import { AuthState } from "examples/auth/auth.redux";
import { HomeState } from "examples/home/home.redux";
import { AppState } from "src/app.redux";

export interface RootState {
  home: HomeState;
  auth: AuthState;
  app: AppState;
}
