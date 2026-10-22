import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    // Always read the latest token at request time
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 429 Too Many Requests is a rate limit, NEVER an authentication failure.
    // Do NOT clear tokens or modify user authentication state.
    if (error.response && error.response.status === 429) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const msg = (error.response.data?.message || "").toLowerCase();

      // Only auto-clear the token when the JWT itself is cryptographically
      // rejected ("jwt expired", "jwt malformed", "invalid signature", etc.)
      // Do NOT clear on generic "Authentication required." or DB connectivity issues.
      const isJwtCryptoFailure =
        msg.includes("jwt expired") ||
        msg.includes("jwt malformed") ||
        msg.includes("invalid signature") ||
        msg.includes("invalid token") ||
        (msg.includes("invalid") && msg.includes("expired") && msg.includes("token"));

      if (isJwtCryptoFailure) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;

