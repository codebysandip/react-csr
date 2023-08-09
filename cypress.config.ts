import { devServer } from "@cypress/webpack-dev-server";
import { defineConfig } from "cypress";
import { createRequire } from "module";
import webpackDevConfig from "./config/webpack.dev.js";
const require = createRequire(import.meta.url);
const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const defaults = webpackPreprocessor.defaultOptions;
const getConfig = () => {
  const baseEnv = { IS_LOCAL: "true", IS_SERVER: "false", ENV: "cypress" };
  const webpackClientConfig: any = webpackDevConfig(baseEnv, {});
  webpackClientConfig.entry.client = webpackClientConfig.entry.client[0];
  webpackClientConfig.plugins = webpackClientConfig.plugins.filter(
    // eslint-disable-next-line @typescript-eslint/ban-types
    (p: Object) => p.constructor.name !== "MetaInfoPlugin",
  );
  webpackClientConfig.devServer = {};
  return webpackClientConfig;
};
const PORT = parseInt(process.env.PORT || "5000");
const baseUrl = `http://localhost:${PORT}`;
export default defineConfig({
  e2e: {
    baseUrl,
    video: false,
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      defaults.webpackOptions = getConfig();
      on("file:preprocessor", webpackPreprocessor(defaults));
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
  component: {
    video: false,
    devServer: (devServerConfig) => {
      return devServer({
        ...devServerConfig,
        framework: "react",
        webpackConfig: getConfig(),
      });
    },
    viewportWidth: 1280,
    setupNodeEvents(on, config) {
      require("@bahmutov/cypress-code-coverage/plugin")(on, config);
      return config;
    },
  },
  env: {
    codeCoverage: {
      url: `${baseUrl}/__coverage__`,
    },
    LONG_EXPIRY_JWT_TOKEN:
      /* cSpell:disable-next-line */
      "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE5MTU4NjQ4MDgsImlhdCI6MTY2MzQ5MDQwOCwidXNlcm5hbWUiOiJyZWFjdC1zc3IifQ.vI_bBNvpUZpcgFpz6dcbHnXxQwvLhxB-lRNzuoRC3Qw",
    EXPIRED_JWT_TOKEN:
      /* cSpell:disable-next-line */
      "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NjM0MDQwMDgsInVzZXIiOiJyZWFjdC1zc3IiLCJpYXQiOjE2NjM0OTA0MDh9.B02YyTsPhsIDwQi_OCKejMwgfMQkzrFB7hZ3_WU0Pcg",
  },
});
