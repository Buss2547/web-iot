import api from "./api";

export const authService = {
  /**
   * Log in user with email and password
   */
  async login(email, password) {
    const response = await api.post("/auth/login", {
      email: email.trim(),
      password,
    });

    const { access_token, user } = response.data;
    if (access_token) {
      localStorage.setItem("access_token", access_token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  },

  /**
   * Register a new operator account
   */
  async signup({ name, email, password, role = "Operator" }) {
    const response = await api.post("/auth/signup", {
      full_name: name.trim(),
      email: email.trim(),
      password,
      role,
    });
    return response.data;
  },

  /**
   * Fetch profile of currently authenticated user
   */
  async getCurrentUser() {
    const response = await api.get("/auth/me");
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Log out user and clear stored credentials
   */
  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  /**
   * Retrieve cached user from localStorage
   */
  getStoredUser() {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve cached JWT token
   */
  getStoredToken() {
    return localStorage.getItem("access_token");
  },
};

export default authService;
