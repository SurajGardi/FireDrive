import { Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Login from "./Components/Login"
import Register from "./Components/Register"
import Dashboard from "./Components/Dashboard" // 👈 make sure you created this

function App() {
  return (
    <>
      <Routes>
        {/* Default: "/" -> "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback */}
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>

      {/* Toast Notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  )
}

export default App
