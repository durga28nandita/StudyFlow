import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// These two must stay LAST, in this order, so they override the component CSS
import "./styles/typography.css";
import "./styles/consistency.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);