// eslint-disable-next-line @typescript-eslint/no-var-requires
const collectCoverageOnlyFrom = require("./include-files-in-jest-exclude-from-cypress.cjs");

module.exports = {
  "all": true,
  "report-dir": "coverage/cypress",
  "reporter": [
    "lcov",
    "json",
    "html"
  ],
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
  ],
  "exclude": [
    "cypress",
    "src/**/*.model.ts",
    ...Object.keys(collectCoverageOnlyFrom)
  ],
  "excludeAfterRemap": true
}