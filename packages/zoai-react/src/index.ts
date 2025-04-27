import { useState } from "react";

export const createZoai = () => {
  return () => {
    const [state, setState] = useState<string>("");

    return {
      state,
      setState,
    };
  };
};
