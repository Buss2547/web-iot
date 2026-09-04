import React from "react";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f1e9] text-[#1a1a1a]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
