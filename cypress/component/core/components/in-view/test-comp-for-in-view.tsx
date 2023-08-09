export default function TestComp(props: TestCompProps) {
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
