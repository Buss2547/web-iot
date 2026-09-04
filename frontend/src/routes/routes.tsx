import { createBrowserRouter } from "react-router";
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";

import LandingPage from "../pages/landing/LandingPage";
import DetectionPage from "../pages/detection/DetectionPage";
import TrainingPage from "../pages/training/TrainingPage";
import AddPersonPage from "../pages/add-person/AddPersonPage";
import AlertsPage from "../pages/alerts/AlertsPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

const router = createBrowserRouter([
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
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
]);

export default router;
