import { ContextDataContext } from "core/contexts/context-data.context.js";
import { ContextData } from "core/models/context.model.js";
import { useContext } from "react";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "src/redux/create-store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useContextData = () => useContext(ContextDataContext) as ContextData;
