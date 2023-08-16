import express from "express";
import { join } from "path";

import bodyParser from "body-parser";
import chalk from "chalk";
import helmet from "helmet";
import { API_URL, PUBLIC_FOLDER } from "../const";
import { proxyMiddleware } from "./middlewares/proxy-middleware";
import { StaticRoute } from "./middlewares/static-files.middleware";


/**
 * exported this function from here because we are using the same in scripts/build.ts  
 * for local development server also
 */
export function startNodeServer(middlewares: any[] = []) {
  // page components can use metaJson to load page css on before loading of client Js
  // this will enable fix the issue of CLS. Without css page will render without styling

  const app = express();

  middlewares.forEach(middleware => {
    app.use(middleware)
  })

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.get("*.(css|js|svg|jpg|jpeg|png|woff|woff2)", StaticRoute);

  // Tell express for public folder
  app.use(express.static(join(process.cwd(), PUBLIC_FOLDER)));

  /* istanbul ignore if */
  if (!API_URL) {
    throw new Error(
      `Please add env/${process.env.ENV}.env file if not available. Add API_BASE_URL in .env file`,
    );
  }

  // proxy to api to tackle cors problem
  app.all("/api/*", proxyMiddleware(API_URL));

  console.log(chalk.yellow("/api/* request will proxy to ", API_URL));

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
          "img-src": "'self' data: https://fakestoreapi.com",
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: "cross-origin",
      },
    }),
  );

  // Serve index.html for all request
  app.get("/*", (_, res) => {
    res.sendFile(join(process.cwd(), PUBLIC_FOLDER, "index.html"));
  });
  const PORT = parseInt(process.env.PORT || "5200");

  const startServer = () => {
    app.listen(PORT, () => {
      console.log(`App listening on port: ${PORT}`);
    });
  };
  startServer();
  return app;
}
