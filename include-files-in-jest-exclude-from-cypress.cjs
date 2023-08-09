/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

const collectCoverageOnlyFromFolders = [
  "src/core/functions",
  "src/core/services",
  "src/redux",
  "src/ssr/functions",
];

const collectCoverageOnlyFrom= {};
const collectCoverageOnlyFromExcludeFiles = ["src/core/functions/get-route.ts"];

collectCoverageOnlyFromFolders.forEach((folder) => {
  fs.readdirSync(folder).forEach((file) => {
    const fullPath = path.join(folder, file);
    if (collectCoverageOnlyFromExcludeFiles.indexOf(fullPath) !== -1) {
      return;
    }
    collectCoverageOnlyFrom[fullPath] = true;
  });
});

module.exports = collectCoverageOnlyFrom;