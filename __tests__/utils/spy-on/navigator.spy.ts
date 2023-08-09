import { jest } from "@jest/globals";

export const navigatorOnline = (status: boolean) => {
  jest.spyOn(navigator, "onLine", "get").mockReturnValue(status);
};
