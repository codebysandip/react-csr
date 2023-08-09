import TestComp from "./test-comp-for-in-view.js";

export default TestComp;

export function loadData() {
  return Promise.reject(new Error("Test Error"));
}
