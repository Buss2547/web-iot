import { createBrowserRouter } from "react-router";
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";
<<<<<<< HEAD
import ProtectedRoute from "../components/guards/ProtectedRoute";
import GuestRoute from "../components/guards/GuestRoute";
=======
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a

import LandingPage from "../pages/landing/LandingPage";
import DetectionPage from "../pages/detection/DetectionPage";
import TrainingPage from "../pages/training/TrainingPage";
import AddPersonPage from "../pages/add-person/AddPersonPage";
import AlertsPage from "../pages/alerts/AlertsPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

const router = createBrowserRouter([
  {
<<<<<<< HEAD
    // ต้อง Login ก่อนถึงจะเข้าหน้าเหล่านี้ได้ — ถ้ายังไม่ Login เด้งไป /login
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <LandingPage /> },
          { path: "/detection", element: <DetectionPage /> },
          { path: "/training", element: <TrainingPage /> },
          { path: "/add-person", element: <AddPersonPage /> },
          { path: "/alerts", element: <AlertsPage /> },
        ],
      },
    ],
  },
  {
    // ต้อง Logout ก่อนถึงจะเข้าหน้า Login/Signup ได้ — ถ้า Login อยู่แล้วเด้งไป /
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
        ],
      },
=======
    element: <MainLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/detection", element: <DetectionPage /> },
      { path: "/training", element: <TrainingPage /> },
      { path: "/add-person", element: <AddPersonPage /> },
      { path: "/alerts", element: <AlertsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
    ],
  },
]);

export default router;
