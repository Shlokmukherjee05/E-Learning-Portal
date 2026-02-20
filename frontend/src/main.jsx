import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

// Clear any corrupt localStorage on startup
try {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  if (u && (!u.name || !u.email || !u.role)) localStorage.clear();
} catch { localStorage.clear(); }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
  