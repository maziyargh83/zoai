import { createLocalize } from "@zoai/core";
import { createZoai } from "@zoai/react";
const translation = createLocalize({
  en: {
    hello: {
      fullName: "Hello {{name}} {{family}}",
      howAreYou: "How are you {{name}}?",
    },
    greeting: "How are you {{name}}?",
    test: "test",
  },
  fa: {
    hello: {
      fullName: "سلام {{name}} {{family}}",
      howAreYou: "چطور {{name}}؟",
    },
    greeting: "خوبی {{name}}",
    test: "تست",
  },
} as const);
const useZoai = createZoai(translation);

export { useZoai };
