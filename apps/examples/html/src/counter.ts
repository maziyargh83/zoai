import { zoai } from "./utils/zoai";

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;

  const setCounter = (count: number) => {
    counter = count;

    element.innerHTML = zoai.t("test.test1", {
      name: "John",
      age: count.toString(),
    });
  };

  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
