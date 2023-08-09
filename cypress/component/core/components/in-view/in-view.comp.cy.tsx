import { InView, LazyComp } from "core/components/in-view/in-view.comp.js";

function TestComp(comp: Promise<LazyComp>) {
  return (
    <div>
      <div className="min-vh-100 mb-4"></div>
      <div>
        <InView>
          {(inView) => {
            return !inView ? (
              <div data-test-id="skeleton">
                <h1>Skeleton</h1>
              </div>
            ) : (
              comp
            );
          }}
        </InView>
      </div>
    </div>
  );
}
describe("In View Component", () => {
  it("Should render skeleton When not in view", () => {
    cy.mount(
      TestComp(import(/* webpackChunkName: "test-component" */ "./test-comp-for-in-view.js")),
    );
    cy.dataCy("skeleton").should("exist");
    cy.dataCy("test-component").should("not.exist");
  });

  it("Should render In view wrapped component when user will scroll", () => {
    cy.mount(
      TestComp(import(/* webpackChunkName: "test-component" */ "./test-comp-for-in-view.js")),
    );
    cy.scrollTo("bottom");
    cy.dataCy("test-component").should("exist");
  });

  it("Should render In view wrapped component with correct data", () => {
    cy.mount(
      TestComp(
        import(/* webpackChunkName: "test-component" */ "./test-comp-for-in-view-load-data.js"),
      ),
    );
    cy.scrollTo("bottom");
    cy.dataCy("test-component").should("exist");
    cy.dataCy("test-component-count").should("contain.text", 5);
  });

  it("Should not render component when loadData will not return promise", () => {
    cy.mount(
      TestComp(import(/* webpackChunkName: "test-component" */ "./test-comp-for-in-view-error.js")),
    );
    cy.scrollTo("bottom");
    cy.dataCy("test-component").should("not.exist");
  });

  it("Should not render component when loadData will throw error", () => {
    cy.mount(
      TestComp(
        import(
          /* webpackChunkName: "test-component" */ "./test-comp-for-in-view-error-load-data.js"
        ),
      ),
    );
    cy.scrollTo("bottom");
    cy.dataCy("skeleton").should("not.exist");
    cy.dataCy("test-component").should("not.exist");
  });
});
