import { NavigateOptions } from "react-router";

export interface HeaderLink {
  text: string;
  url: string;
}

export interface HeaderData {
  links: HeaderLink[];
}

export interface RedirectTo {
  path: string;
  options?: NavigateOptions;
}

export interface AppState {
  header?: HeaderData;
  redirectTo?: RedirectTo;
}
