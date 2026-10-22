import api from "./api";

// Listeners for auth state changes
const authListeners = new Set();

const notifyListeners = (user) => {
  authListeners.forEach((listener) => {
    try {
      listener(user);
    } catch (err) {
      console.error("Auth listener error:", err);
    }
  });
};

export const getToken = () => localStorage.getItem("token");

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => !!getToken();

// Subscribe to auth state changes (drop-in compatibility with onAuthStateChanged)
export const onAuthStateChanged = (authOrCallback, maybeCallback) => {
  // Support both onAuthStateChanged(callback) and Firebase modular onAuthStateChanged(auth, callback)
  const callback =
    typeof authOrCallback === "function" ? authOrCallback : maybeCallback;

  if (typeof callback !== "function") {
    return () => {};
  }

  authListeners.add(callback);

  // Immediately notify with current state
  const currentUser = getCurrentUser();
  if (currentUser) {
    // Provide a structure with uid/email for compatibility
    callback({
      uid: currentUser.id || currentUser._id,
      ...currentUser,
    });
  } else {
    callback(null);
  }

  // Return unsubscribe function
  return () => {
    authListeners.delete(callback);
  };
};

// ==========================================
// AUTH API CALLS
// ==========================================

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("token", token);
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    notifyListeners({
      uid: user.id || user._id,
      ...user,
    });
  }

  return response.data;
};

export const googleLogin = async (googleUserData) => {
  const response = await api.post("/auth/google", googleUserData);
  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("token", token);
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    notifyListeners({
      uid: user.id || user._id,
      ...user,
    });
  }

  return response.data;
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  notifyListeners(null);
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  if (response.data?.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    notifyListeners({
      uid: response.data.user.id || response.data.user._id,
      ...response.data.user,
    });
  }
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/auth/profile", profileData);
  if (response.data?.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    notifyListeners({
      uid: response.data.user.id || response.data.user._id,
      ...response.data.user,
    });
  }
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put("/auth/change-password", passwordData);
  return response.data;
};

export const changeEmail = async (emailData) => {
  const response = await api.put("/auth/change-email", emailData);
  if (response.data?.token) {
    localStorage.setItem("token", response.data.token);
  }
  if (response.data?.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    notifyListeners({
      uid: response.data.user.id || response.data.user._id,
      ...response.data.user,
    });
  }
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  return response.data;
};

// Fake `auth` object for 100% backward compatibility if imported as `auth.currentUser`
export const auth = {
  get currentUser() {
    const user = getCurrentUser();
    if (!user) return null;
    return {
      uid: user.id || user._id,
      ...user,
    };
  },
  onAuthStateChanged,
};
