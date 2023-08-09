import { basename } from "path";

export default {
  process(_src, filename, _options) {
    return {
      code: `module.exports = ${JSON.stringify(basename(filename))};`,
    };
  },
};
