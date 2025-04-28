import { useState } from "react";
import "./App.css";
import { useZoai } from "./zoai";

const Counter = () => {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>count is {count}</button>;
};

const LocaleSwitcher = () => {
  const { setLocale } = useZoai();
  return (
    <div>
      <button onClick={() => setLocale("fa")}>fa</button>
      <button onClick={() => setLocale("en")}>en</button>
    </div>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="card">{children}</div>
);
const Title = () => {
  const { t } = useZoai();

  return <h1>{t("hello.fullName")}</h1>;
};
function App() {
  return (
    <>
      <Title />
      <Card>
        <Counter />
        <LocaleSwitcher />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </Card>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
