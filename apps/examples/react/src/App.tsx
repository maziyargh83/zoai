import { Fragment, useState } from "react";
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
  const { t, getLocale } = useZoai();
  const locale = getLocale();

  return (
    <Fragment>
      <h1>
        {t("hello.fullName", {
          name: locale === "en" ? "Maziyar" : "مازیار",
          family: locale === "en" ? "Gholami" : "غلامی",
        })}
      </h1>

      <h1>
        {t("hello.howAreYou", {
          name: locale === "en" ? "Maziyar" : "مازیار",
        })}
      </h1>

      <h1>
        {t("greeting", {
          name: locale === "en" ? "Maziyar" : "مازیار",
        })}
      </h1>

      <h1>{t("test")}</h1>
    </Fragment>
  );
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
