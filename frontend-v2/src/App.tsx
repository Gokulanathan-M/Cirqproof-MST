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

function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-[#06070a] p-8 text-center text-white"><div><h1 className="text-3xl font-bold">Page not found</h1><p className="mt-2 text-slate-400">The requested route does not exist.</p></div></div>;
}

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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
