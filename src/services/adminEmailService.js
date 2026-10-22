import api from "./api";

// Get current admin user from MongoDB (source of truth for admin email)
export const getAdminMe = async () => {
  const res = await api.get("/admin/email/me");
  return res.data;
};

// Get SMTP sender identity settings (admin)
export const getEmailSettings = async () => {
  const res = await api.get("/admin/email/settings");
  return res.data;
};

// Send verification test email (admin)
export const sendTestEmail = async (targetEmail) => {
  const res = await api.post("/admin/email/test", { targetEmail });
  return res.data;
};

// Request admin login email change — sends verification link to newEmail
export const requestEmailChange = async ({ newEmail, currentPassword }) => {
  const res = await api.post("/admin/email/request-change", { newEmail, currentPassword });
  return res.data;
};

// Verify admin login email change via token from verification link (public endpoint)
export const verifyEmailChange = async (token) => {
  const res = await api.get(`/admin/email/verify-change/${token}`);
  return res.data;
};
