import { ROUTE_404 } from "src/const.js";

describe("Process request middleware", () => {
  it("should return 404 response when route not available", () => {
    cy.visit("/some/unknown/path");
    cy.url().should("contain", ROUTE_404);
  });
});
