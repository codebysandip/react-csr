import CompressionPlugin from "compression-webpack-plugin";
import { join } from "path";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { merge } from "webpack-merge";
import WorkboxPlugin from "workbox-webpack-plugin";
import { getDevServerConfig } from "./functions/get-devServer-config";
import { getPath, isLocalFn } from "./functions/helper-functions";
import commonConfig from "./webpack.common";

/**
 * Prod config for webpack. This build will use for production.
 * @param env  {[key:string]: string} environment key value pair provided when running webpack command
 * @param {*} args args
 * @returns prod env webpack config
 */
const prodConfig = (env, outFolder) => {
  const plugins = [];
  /**
   * Is Build running for local development
   */
  const isLocal = isLocalFn(env);

  // on github action don't compress to save build time
  if (process.env.GITHUB_ACTION !== "true") {
    plugins.push(
      new CompressionPlugin({
        filename: "[file].gz[query]",
        algorithm: "gzip",
        test: /\.(js|css|html|svg|woff|woff2|jpg)$/,
        // compressionOptions: { level: 11 },
        minRatio: Number.MAX_SAFE_INTEGER, // to compress all assets because we are serving files based on encoding support of browser
        deleteOriginalAssets: false,
      }),
      new CompressionPlugin({
        filename: "[file].br[query]",
        algorithm: "brotliCompress",
        test: /\.(js|css|html|svg|woff|woff2|jpg)$/,
        // compressionOptions: { level: 11 },
        minRatio: Number.MAX_SAFE_INTEGER,
        deleteOriginalAssets: false,
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
      }),
    );
    plugins.push(
      new WorkboxPlugin.InjectManifest({
        swSrc: getPath("src/service-worker.js"),
        swDest: join(outFolder, "service-worker.js"),
        mode: "production",
        maximumFileSizeToCacheInBytes: isLocal ? 10 * 1000 * 1000 : 500 * 1000,
        exclude: [/.*(.hot-update.)(m?js)$/, /\.map$/],
      }),
    );
  }
  const optimize = {
    minimize: false,
    mergeDuplicateChunks: true,
  };

  optimize.minimize = true;
  optimize.minimizer = [
    new TerserPlugin({
      test: /\.js(\?.*)?$/i,
      parallel: 2,
      terserOptions: {
        ie8: false,
        safari10: false,
        ecma: 2016,
        output: {
          comments: false,
        },
      },
      extractComments: false,
    }),
  ];
  const config = {
    mode: "production",
    plugins,
    optimization: optimize,
  };
  if (isLocalFn(env)) {
    config.devServer = getDevServerConfig();
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }
  return config;
};

const config = (env, args) => {
  const commonWebpackConfig = commonConfig(env, args, true);
  return merge(commonWebpackConfig, prodConfig(env, commonWebpackConfig.output.path));
};

export default config;
