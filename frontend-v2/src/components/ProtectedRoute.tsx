import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#06070a] text-white">Loading Auth...</div>;
  if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
