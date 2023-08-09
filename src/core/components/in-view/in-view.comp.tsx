import React, { ReactNode, useEffect, useRef, useState } from "react";
import { withContext, WithContextProps } from "src/core/hoc/with-context.hoc.js";
import { ContextDataWithStore } from "src/core/models/context-with-store.model.js";

const InViewComp = (props: InViewProps & WithContextProps) => {
  const ref = useRef(null);
  const { children, extraProps, ...rest } = props;
  // state to check component inView
  const [intersected, setIntersected] = useState<boolean>(false);
  const [inView, setInView] = useState<boolean>(false);
  // skeleton component to render initially
  const [skeleton, setSkeleton] = useState<{ default: ReactNode }>({
    default: children(intersected) as React.ReactNode,
  });
  // lazy component to render when inView
  const [lazyComp, setLazyComp] = useState<LazyComp | null>(null);
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !intersected) {
          ref.current && observer.unobserve(ref.current);
          setIntersected(true);
          const compOrLazyComp = children(true);
          /* istanbul ignore else */
          if (compOrLazyComp && compOrLazyComp.constructor.name === "Promise") {
            (compOrLazyComp as Promise<LazyComp>).then((m) => {
              if (m.loadData && typeof m.loadData === "function") {
                /* istanbul ignore if */
                if (!props.ctx) {
                  return;
                }
                const loadDataPromise = m.loadData(props.ctx);
                if (loadDataPromise?.constructor?.name !== "Promise") {
                  console.error(
                    `loadData of component ${m.default.constructor.name} must return Promise`,
                  );
                  setInView(true);
                  setSkeleton({ default: null });
                  return;
                }
                loadDataPromise
                  .then((apiData) => {
                    setInView(true);
                    setLazyComp({ default: m.default });
                    /* istanbul ignore else */
                    if (typeof apiData === "object") {
                      setData(apiData);
                    } else {
                      console.warn(
                        `loadData must return object for component ${m.default.constructor.name}`,
                      );
                    }
                  })
                  .catch((err) => {
                    setInView(true);
                    setSkeleton({ default: null });
                    console.error(
                      `Error in load data of ${m.default.constructor.name}. Error: `,
                      err,
                    );
                  });
              } else {
                setInView(true);
                setLazyComp({ default: m.default });
              }
            });
          } else {
            setInView(true);
            setLazyComp({ default: compOrLazyComp as React.FC });
          }
        }
      },
      { ...rest },
    );
    ref.current && observer.observe(ref.current);
  }, []);

  const extra = extraProps || {};

  return (
    <div ref={ref} id="in-view" {...props.testIdAttribute}>
      {inView
        ? lazyComp && <lazyComp.default {...extra} {...data} />
        : skeleton && skeleton.default}
    </div>
  );
};

/**
 * InView component defers loading of component.
 * it works on [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
 * Initially InView will load Skeleton component provided by you(inView false)
 * When component(Skeleton) will be in view then InView will load actual component (inView true)
 */
export const InView = withContext<InViewProps>(InViewComp) as (
  props: InViewProps,
) => React.ReactElement;

InViewComp.defaultProps = {
  testIdAttribute: {},
};
export interface InViewProps extends IntersectionObserverInit {
  /**
   * children should be a function and must return [skeleton](https://www.npmjs.com/package/react-loading-skeleton) when not in view (inView false)
   * when inView true children function must return a **lazy loaded component via
   * import syntax**. if lazy loaded file will export **loadData as function** then
   * InView will first resolve loadData then will render component
   * Resolved data from loadData will send as props in lazy loaded component
   */
  children: (inView: boolean) => React.ReactNode | Promise<LazyComp> | React.FC<any>;
  /**
   * extra props is the props your component will need when loads
   */
  extraProps?: Record<string, any>;
  testIdAttribute?: Record<string, string>;
}

/**
 * Lazy Comp
 */
export interface LazyComp {
  default: React.ComponentType<any> | React.FC<any>;
  loadData?: (ctx: ContextDataWithStore) => Promise<Record<string, any>>;
}
