import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import webpack from "webpack";
import { merge } from "webpack-merge";
import commonConfig from "./webpack.common.js";

/**
 * Dev config for webpack. This build should not use for production. It's for local development only
 *
 * @param {[key:string]: string} env Environment key value pair provided when running webpack
 *   command
 * @param {any} args Args
 * @returns Dev env webpack config
 */
const devConfig = (env) => {
  const plugins = [];
  if (env.ENV === "development") {
    plugins.push(
      new ReactRefreshPlugin({
        include: "examples",
      }),
    );
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
  return config;
};

const config = (env, args) => {
  return merge(commonConfig(env, args), devConfig(env));
};
export default config;
