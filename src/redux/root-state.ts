import { AuthState } from "examples/auth/auth.redux";
import { HomeState } from "examples/home/home.redux";
import { AppState } from "src/app.model";

export interface RootState {
  home: HomeState;
  auth: AuthState;
  app: AppState;
}
