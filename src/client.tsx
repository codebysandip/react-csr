import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { getRoute } from "./core/functions/get-route.js";
import { CompModule } from "./core/models/route.model.js";
import ReactSsrApp from "./index.js";

const container = document.getElementById("root");
/* istanbul ignore if  */
if (!container) {
  throw new Error("root element not available!!");
}
const searchParams = new URLSearchParams(location.search);
/**
 * Find route for Routes by matching current current location of browser
 */
const route = getRoute(window.location.pathname);

const createBrowserRouter = (module: CompModule) => {
  // Don't change anything here
  // Add your code in src/index.tsx
  return (
    <BrowserRouter>
      <ReactSsrApp module={module} />
    </BrowserRouter>
  );
};
const hydrateApp = (module: CompModule) => {
  return hydrateRoot(container, createBrowserRouter(module));
};

// Hot module reload
// Don't delete below if condition. If you need to reload server type rs in same command window
// of npm start and hit enter. nodemon will restart server
// Below line will automatically get removed in production build
// ignoring here istanbul because we don'y run cypress in hot mode
/* istanbul ignore if  */
if (process.env.IS_LOCAL && (module as any).hot) {
  console.log("updating app via reload or hot reload!!");
  const root = createRoot(container);
  route?.component().then((module) => {
    root.render(createBrowserRouter(module));
  });
} else {
  /**
   * During hydration Client side HTML should match with virtual DOM.
   * Rendering is synchronous but lazy loading of component is asynchronous.
   * So while getting route component(asynchronous lazy loading), Hydration will complete
   * creation of virtual DOM synchronously. When React will compare virtual DOM with actual DOM
   * then route component HTML will not be there. In this case hydration will fail and React will re render
   * again on client side. Re rendering of full page will decrease the performance
   */
  route?.component().then((module) => {
    // if (route.isSSR && !searchParams.get("cypress")) {
    //   hydrateApp(module);
    // } else {
    const root = createRoot(container);
    root.render(createBrowserRouter(module));
    // }
  });
}
