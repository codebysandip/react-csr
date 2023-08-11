import { Provider } from "react-redux";
import { App } from "./app";

import { configureHttpClient } from "./core/functions/configure-http-client";
import { createStore } from "./redux/create-store";
import "./style.scss";

configureHttpClient();

export default function ReactCsrApp(props: ReactCsrAppProps) {
  const store = createStore();

  return <Provider store={store}>{props.appComp ? props.appComp : <App />}</Provider>;
}

interface ReactCsrAppProps {
  /**
   * appComp used here for cypress component testing
   */
  appComp?: React.ReactNode;
}
