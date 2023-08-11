import nodeExternals from "webpack-node-externals";
import { getPath, isLocalFn } from "./functions/helper-functions.js";

export default function (env, args) {
  /** Is Build running for local development */
  const isLocal = isLocalFn(env);

  const config = {
    target: "node",
    mode: "development",
    entry: {
      server: "./src/node/index.ts",
    },
    output: {
      filename: "server.mjs",
      path: getPath("build"),
      chunkFilename: "[name].chunk.js",
      chunkFormat: "module",
    },
    experiments: {
      topLevelAwait: true,
      outputModule: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "swc-loader",
              options: {
                parseMap: false,
                jsc: {
                  parser: {
                    syntax: "typescript",
                    dynamicImports: true,
                  },
                },
                isModule: true,
                sourceMaps: isLocal,
                inlineSourcesContent: isLocal,
                module: {
                  type: "es6",
                  lazy: true,
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    externals: [
      nodeExternals({
        importType: function (moduleName) {
          return moduleName;
        },
      }),
    ],
    plugins: [],
    externalsPresets: { node: true },
  };
  return config;
}
