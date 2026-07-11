import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Entry point for the Vite React front-end application.
// Mounts the root component (<App />) to the DOM element with ID "root" in strict mode.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
