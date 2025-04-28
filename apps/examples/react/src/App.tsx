import { useState } from "react";
import "./App.css";
import { useZoai } from "./zoai";

function App() {
  const [count, setCount] = useState(0);
  const { t, setLocale, getLocale } = useZoai();

  return (
    <>
      <h1>{t("hello")}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count} {getLocale()}
        </button>
        <button onClick={() => setLocale("fa")}>fa</button>
        <button onClick={() => setLocale("en")}>en</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
