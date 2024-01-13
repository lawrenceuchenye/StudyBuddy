import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&family=Pacifico&family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto:wght@400;700&display=swap"
      rel="stylesheet"
    />

    <App />
  </React.StrictMode>,
);
