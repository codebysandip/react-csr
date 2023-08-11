import { SsrHead } from "core/components/ssr-head/ssr-head.comp";

export function Empty() {
  return <>{process.env.IS_SERVER && <SsrHead />}</>;
}
