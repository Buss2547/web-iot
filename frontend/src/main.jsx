import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
<<<<<<< HEAD
import { AuthProvider } from "./context/AuthContext";
=======
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
import router from "./routes/routes.tsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
<<<<<<< HEAD
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
=======
    <RouterProvider router={router} />
>>>>>>> e56e852f926bab241dfea2144d00ca88b574d79a
  </StrictMode>,
);
