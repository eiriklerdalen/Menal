import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import LoginPage from "./pages/login/LoginPage";
import AppLayout from "./AppLayout";

import "./theme.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
                element={
                  <AppLayout
                    darkMode={ darkMode }
                    setDarkMode={ setDarkMode}
                  />
                }
      />
    </Routes>
  );
}

export default App