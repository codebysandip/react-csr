import { jest } from "@jest/globals";
import { join } from "node:path";
import { MetaJson } from "src/ssr/functions/get-webpack-build-meta-json.js";

describe("Meta Json", () => {
  const mockExistsSync = jest.fn();
  const mockReadFileSync = jest.fn();
  let getWebpackBuildMetaJson: () => MetaJson;
  const path = join(process.cwd(), "build/meta.json");

  beforeEach(async () => {
    const fs = await import("node:fs");
    jest.unstable_mockModule("node:fs", () => {
      return {
        __esModule: true,
        ...fs,
        existsSync: mockExistsSync,
        readFileSync: mockReadFileSync,
      };
    });
    getWebpackBuildMetaJson = (await import("src/ssr/functions/get-webpack-build-meta-json.js"))
      .getWebpackBuildMetaJson;
  });
  it("Should throw error when meta json not available", async () => {
    mockExistsSync.mockReturnValue(false);

    expect(getWebpackBuildMetaJson).toThrow(`meta.json not found at path: ${path}`);
  });

  it("Should throw error when empty meta.json file", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue("");
    expect(getWebpackBuildMetaJson).toThrow("Empty meta.json");
  });

  it("Should throw error when meta.json is not valid json", () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue("some invalid json");

    expect(getWebpackBuildMetaJson).toThrow(`Invalid meta.json at path ${path}`);
  });

  it("Should return correct meta.json", () => {
    const metaJson: MetaJson = { mainJs: "", mainStyle: "", chunkCss: {} };
    const metaJsonStr = JSON.stringify(metaJson);
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(metaJsonStr);
    const actualMetaJson = getWebpackBuildMetaJson();
    expect(actualMetaJson).toStrictEqual(metaJson);
  });
});
