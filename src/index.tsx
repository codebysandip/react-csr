import { CompModule } from "core/models/route.model.js";
import { Provider } from "react-redux";
import { App } from "./app.js";

import { configureHttpClient } from "./core/functions/configure-http-client.js";
import { ContextData } from "./core/models/context.model.js";
import { createStore } from "./redux/create-store.js";
import "./style.scss";

configureHttpClient();

export default function ReactSsrApp(props: ReactSsrAppProps) {
  const store = createStore();

  return (
    <Provider store={store}>
      {props.appComp ? props.appComp : <App module={props.module} />}
    </Provider>
  );
}

interface ReactSsrAppProps {
  module: CompModule;
  /**
   * ctx prop will have value only on SSR
   * on client side it will always be undefined
   */
  ctx?: ContextData;
  /**
   * appComp used here for cypress component testing
   */
  appComp?: React.ReactNode;
}
