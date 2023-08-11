import {
  AnyAction,
  Dispatch,
  EnhancedStore,
  MiddlewareArray,
  ReducersMapObject,
  Store,
  ThunkDispatch,
} from "@reduxjs/toolkit";
import AuthReducer from "examples/auth/auth.redux";
import { ThunkMiddleware } from "redux-thunk";
import AppReducer from "src/app.redux";
import { HttpClient } from "src/core/services/http-client";
import { combineReducers, configureStore } from "./redux.imports.prod";
import { RootState as RootStateType } from "./root-state";

const reducer = {
  auth: AuthReducer,
  app: AppReducer,
};
/**
 * All reducers will always hold all the reducers loaded
 * on client side during lazy load reducers will load on page change
 * allReduces will hold all default reducers + lazy loaded reducers
 */
let allReducers: ReducersMapObject = {
  ...reducer,
};

export const replaceReducer = (store: Store, lazyReducers: ReducersMapObject) => {
  allReducers = {
    ...allReducers,
    ...lazyReducers,
  };
  // add new lazy loaded reducers to current store
  store.replaceReducer(combineReducers(allReducers));
};

export function createStore(lazyReducers: ReducersMapObject = {}): AppStore {
  const preloadedState = {};
  const store = configureStore({
    reducer: {
      ...allReducers,
      ...lazyReducers,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({
        thunk: {
          extraArgument: HttpClient,
        },
      });
    },
    preloadedState,
    devTools: process.env.IS_LOCAL,
  });
  return store as AppStore;
}

export type RootState = RootStateType;
export type AppDispatch = ThunkDispatch<any, typeof HttpClient, AnyAction> & Dispatch<AnyAction>;
export type AppStore = EnhancedStore<
  RootState,
  AnyAction,
  MiddlewareArray<[ThunkMiddleware<RootState, AnyAction, typeof HttpClient>]>
>;
