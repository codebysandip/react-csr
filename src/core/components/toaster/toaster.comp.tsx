import { FunctionComponent, useEffect, useState } from "react";
import { Id, ToastContainerProps, ToastContent, ToastOptions } from "react-toastify";
import { TOAST } from "src/const.js";
import { Toaster as IToaster } from "src/core/models/toaster.model.js";

export function Toaster(props: ToastContainerProps) {
  const [lazyToast, setLazyToast] = useState<{
    default: FunctionComponent<ToastContainerProps>;
  } | null>(null);
  let toast: (content: ToastContent, options?: ToastOptions) => Id;
  const showToast = (toaster: IToaster) => {
    const { message, ...rest } = toaster;
    toast(message, rest);
  };

  useEffect(() => {
    window.addEventListener(TOAST, (e) => {
      /* istanbul ignore else */
      if (!lazyToast) {
        import(/* webpackChunkName: "toaster" */ "./toaster-lazy.com.js").then((module) => {
          setLazyToast(module);
          toast = module.toast;
          showToast(e.detail);
        });
      } else {
        showToast(e.detail);
      }
    });

    /* istanbul ignore next */
    return function () {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      window.removeEventListener(TOAST, () => {});
    };
  }, []);
  if (lazyToast) {
    return <lazyToast.default {...props} />;
  }
  return null;
}
