import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import webpack from "webpack";
import { merge } from "webpack-merge";
import { getDevServerConfig } from "./functions/get-devServer-config.js";
import commonConfig from "./webpack.common.js";

/**
 * Dev config for webpack. This build should not use for production.
 * It's for local development only
 * @param {[key:string]: string} env environment key value pair provided when running webpack command
 * @param {*} args args
 * @returns dev env webpack config
 */
const devConfig = (env) => {
  const plugins = [];
  if (env.ENV === "development") {
    plugins.push(new ReactRefreshPlugin());
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }
  const config = {
    mode: "development",
    plugins,
    optimization: {
      minimize: false,
      splitChunks: false,
    },
    devtool: "inline-source-map",
  };
  config.devServer = getDevServerConfig();
  return config;
};

const config = (env, args) => {
  return merge(commonConfig(env, args), devConfig(env));
};
export default config;
