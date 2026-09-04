import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors & normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized, optionally clear local session
    if (error.response && error.response.status === 401) {
      // Don't auto logout if the 401 was from the login endpoint itself
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to extract human-readable error message from Axios error
 */
export function getErrorMessage(error) {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || d.message).join(", ");
    }
    return JSON.stringify(detail);
  }
  if (error.message === "Network Error") {
    return "Cannot connect to server. Please ensure the backend is running at " + API_BASE_URL;
  }
  return error.message || "An unexpected error occurred.";
}

export default api;
