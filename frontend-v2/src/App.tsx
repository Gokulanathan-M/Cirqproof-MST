import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Batches } from "./pages/Batches";
import { BatchDetail } from "./pages/BatchDetail";
import { Simulator } from "./pages/Simulator";
import { Blockchain } from "./pages/Blockchain";
import { Evidence } from "./pages/Evidence";
import { Challenges } from "./pages/Challenges";
import { Settlement } from "./pages/Settlement";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/batches/:id" element={<BatchDetail />} />
              <Route path="/evidence" element={<Evidence />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/settlement" element={<Settlement />} />
              <Route path="/blockchain" element={<Blockchain />} />
              <Route path="/simulator" element={<Simulator />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
