/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import tsconfigJson from "./tsconfig.json";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const collectCoverageOnlyFrom = require("./include-files-in-jest-exclude-from-cypress.cjs");

const jestConfig: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  collectCoverageOnlyFrom: {
    ...collectCoverageOnlyFrom,
  },

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage/jest",
  coverageReporters: ["lcov", "html", "json", "text"],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  coveragePathIgnorePatterns: ["/__tests__/.*", "/node_modules/.*", "/examples/.*"],

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // A set of global variables that need to be available in all test environments
  // globals: {
  //   "ts-jest": {
  //     useESM: true
  //   }
  // },

  // The maximum amount of workers used to run your __tests__. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  maxWorkers: "50%",

  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ["node_modules"],

  // An array of file extensions your modules use
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfigJson.compilerOptions.paths, { prefix: "<rootDir>/" }),
    /* cSpell:disable-next-line */
    ".+\\.(css|styl|less|sass|scss)$": "<rootDir>/__tests__/utils/config/style-mock.js",
  },

  // A preset that is used as a base for Jest's configuration
  // preset: "ts-jest/presets/default-esm-legacy",

  // A path to a custom resolver
  resolver: "ts-jest-resolver",

  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  rootDir: process.cwd(),

  // The paths to modules that run some code to configure or set up the testing environment before each test
  setupFiles: [
    "./__tests__/utils/set-up-env-jest.ts",
    "./__tests__/utils/set-up-window.ts",
    "./__tests__/utils/set-up-jest.ts",
  ],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: ["<rootDir>/__tests__/**/*.[jt]s?(x)"],

  // An array of regexp pattern strings that are matched against all test paths, matched __tests__ are skipped
  testPathIgnorePatterns: ["/__tests__/utils/.*", "/node_modules/"],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.tsx?$":
      // ["ts-jest", { useESM: true }],
      [
        "@swc/jest",
        {
          jsc: {
            parser: {
              syntax: "typescript",
              dynamicImports: true,
            },
            transform: {
              react: {
                runtime: "automatic",
              },
              hidden: {
                jest: true,
              },
            },
            target: "es2021",
          },
          isModule: true,
          module: {
            type: "es6",
          },
        },
      ],
    /* cSpell:disable-next-line */
    ".+\\.(png|jpg|ttf|woff|woff2|svg)$": "<rootDir>/__tests__/utils/config/asset-transformer.js",
  },
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ["/node_modules/"],

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them

  /* cSpell:disable-next-line */
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  verbose: false,
  silent: false,
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
export default jestConfig;
