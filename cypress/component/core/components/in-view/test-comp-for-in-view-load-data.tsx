export default function TestComp(props: TestCompProps) {
  console.log("TestComp!!", props);
  return (
    <div data-test-id="test-component">
      <h1>Lazy Loaded Component</h1>
      <h2>
        Count: <span data-test-id="test-component-count">{props?.count}</span>
      </h2>
    </div>
  );
}

interface TestCompProps {
  count: number;
}
export function loadData() {
  return Promise.resolve({ count: 5 });
}
