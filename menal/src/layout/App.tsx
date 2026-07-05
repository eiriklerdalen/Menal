import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import HomeRedirect from "./HomeRedirect";
import LoginPage from "../pages/login/LoginPage";
import AppLayout from "./AppLayout";

import "./theme.css";
import ProtectedRoute from "../ProtectedRoute";
import RegisterPage from "../pages/register/RegisterPage";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout
                      darkMode={ darkMode }
                      setDarkMode={ setDarkMode}
                    />
                  </ProtectedRoute>
                }
      />
    </Routes>
  );
}

export default App