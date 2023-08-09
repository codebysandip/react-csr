export function getDevServerConfig() {
  return {
    contentBase: "./build/public",
    compress: false,
    historyApiFallback: true,
    hot: true,
  };
}
