import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import { SnackbarProvider } from "./contexts/SnackbarContext";

function App() {
  return (
    <Router>
      <SnackbarProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/editor/:id?"
                element={
                  <PrivateRoute>
                    <Editor />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </SnackbarProvider>
    </Router>
  );
}

export default App;
