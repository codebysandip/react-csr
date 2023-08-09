import { PayloadAction } from "@reduxjs/toolkit";
import { ROUTE_404 } from "src/const.js";
import { GetState, ThunkApi } from "src/core/models/common.model.js";
import { ContextData } from "src/core/models/context.model.js";
import { IRedirect } from "src/core/models/page-data.js";
import { AppDispatch } from "src/redux/create-store.js";
import { createSlice } from "src/redux/redux.imports.js";
import { HomeData, Product } from "./home.model.js";

export interface HomeState {
  pageData: HomeData;
  productById?: Product;
  topProducts: Product[];
}
const initialState: HomeState = {
  pageData: { products: [] },
  // product will always be available for component otherwise fetchProductById will redirect to 404
  productById: undefined,
  topProducts: [],
};

export const fetchProducts = () => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<HomeData>("/api/product", {
      extra: "home/productsPageDataLoaded",
    });
    dispatch(productsPageDataLoaded(apiResponse.data || { products: [] }));
    return apiResponse;
  };
};

export const fetchProductById = (id: number, ctx: ContextData) => {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Product>(`/api/product/${id}`, {
      isAuth: true,
      nodeReqObj: ctx.req,
      nodeRespObj: ctx.res,
    });
    dispatch(productByIdLoaded(apiResponse.data || undefined));
    if (!apiResponse.data && apiResponse.status !== 401) {
      return { redirect: { path: ROUTE_404 } } as IRedirect;
    }

    return apiResponse;
  };
};

export function fetchTopProducts() {
  return async (dispatch: AppDispatch, _getState: GetState, api: ThunkApi) => {
    const apiResponse = await api.get<Product[]>("/api/product/top-products");
    dispatch(topProductsLoaded(apiResponse.data || []));
    return apiResponse;
  };
}

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    productsPageDataLoaded: (state, action: PayloadAction<HomeData>) => {
      state.pageData = action.payload;
    },
    productByIdLoaded: (state, action: PayloadAction<Product | undefined>) => {
      state.productById = action.payload;
    },
    topProductsLoaded: (state, action: PayloadAction<Product[]>) => {
      state.topProducts = action.payload;
    },
  },
});

export const { productsPageDataLoaded, productByIdLoaded, topProductsLoaded } = homeSlice.actions;
export default homeSlice.reducer;
