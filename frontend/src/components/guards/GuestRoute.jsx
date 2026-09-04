import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

/**
 * GuestRoute — ป้องกันหน้า Login/Signup สำหรับคนที่ Login แล้ว
 * ถ้า Login อยู่แล้ว → เด้งไปหน้าหลัก /
 * ต้อง Logout ก่อนถึงจะเข้าหน้า Login/Signup ได้
 */
export default function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  // รอตรวจสอบ session ให้เสร็จก่อน
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f7f1e9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#f5c9a8] border-t-[#e8b48a] rounded-full animate-spin" />
          <span className="text-sm text-[#6b6b6b] font-medium">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Login อยู่แล้ว → ไม่ให้เข้าหน้า Login/Signup → เด้งไปหน้าหลัก
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
