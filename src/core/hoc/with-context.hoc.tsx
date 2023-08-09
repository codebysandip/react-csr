import { useContextData } from "../hook.js";
import { ContextDataWithStore } from "../models/context-with-store.model.js";

/**
 * withContextWithStore HOC extended with {@link withContext}
 * withContextWithStore adds store object in {@link ContextData}
 */
export function withContext<T>(Component: any) {
  function ComponentWithContextData(props: T) {
    const ctx = useContextData();

    return <Component {...props} ctx={ctx} />;
  }
  return ComponentWithContextData;
}

export interface WithContextProps {
  ctx: ContextDataWithStore;
}
