import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import QuizApp from "../quiz-gdct.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QuizApp />
  </StrictMode>
);
