import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute — ป้องกันหน้าที่ต้อง Login ก่อนถึงจะเข้าได้
 * ถ้ายังไม่ได้ Login → เด้งไปหน้า /login
 * จดจำ URL เดิมไว้เพื่อให้ login เสร็จแล้วกลับมาหน้าเดิมได้
 */
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // รอตรวจสอบ session ให้เสร็จก่อน ไม่งั้นจะเด้งไป login ทั้งที่ยังไม่ได้เช็ค
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f1e9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#f5c9a8] border-t-[#e8b48a] rounded-full animate-spin" />
          <span className="text-sm text-[#6b6b6b] font-medium">
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // เก็บ path เดิมไว้ใน state เพื่อให้ login เสร็จแล้วกลับมาที่เดิมได้
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
