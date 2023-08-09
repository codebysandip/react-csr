import { Reducer } from "@reduxjs/toolkit";

export interface IRoute {
  /**
   * React route path
   */
  path: string;
  /**
   * Lazy loaded component
   */
  component: CompModuleImport;

  /**
   * route which can access only after login
   */
  private?: boolean;
}

export type CompModule = {
  default: any;
  reducer?: { [key: string]: Reducer<any> };
};
export type CompModuleImport = () => Promise<CompModule>;
