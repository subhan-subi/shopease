import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAdminMe, requestEmailChange, verifyEmailChange } from "../services/adminEmailService";

// ==============================================================
// AdminEmailSettings — Admin Login Email Change
// ==============================================================
export function AdminEmailSettings() {
  const navigate = useNavigate();

  // --------------- Email Change Form ---------------
  const [currentEmail, setCurrentEmail] = useState("");
  const [loadingMe, setLoadingMe] = useState(true);
  const [form, setForm] = useState({ newEmail: "", currentPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingChange, setPendingChange] = useState(false);
  const [pendingEmailAddress, setPendingEmailAddress] = useState("");

  // --------------- Verification via URL token ---------------
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // { success, message, newEmail }

  // Load current admin email directly from MongoDB
  const fetchCurrentAdmin = useCallback(async () => {
    try {
      setLoadingMe(true);
      const res = await getAdminMe();
      if (res?.success && res.admin) {
        setCurrentEmail(res.admin.email || "");
        if (res.admin.hasPendingEmailChange) {
          setPendingChange(true);
          setPendingEmailAddress(res.admin.pendingEmail || "");
        }
      }
    } catch {
      // Fallback to localStorage if network/auth fails
      try {
        const userData = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
        if (userData?.email) setCurrentEmail(userData.email);
      } catch (_) {}
    } finally {
      setLoadingMe(false);
    }
  }, []);

  const handleVerifyToken = useCallback(async (token) => {
    setVerifying(true);
    try {
      const res = await verifyEmailChange(token);
      setVerifyResult({ success: true, message: res.message, newEmail: res.newEmail });
      toast.success("Email address updated! Please log in again with your new email.");

      // Clear cached user if logged in under old email so they re-authenticate cleanly
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        if (stored?.email) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch (_) {}

      // Clear token from URL without reload
      window.history.replaceState({}, "", window.location.pathname);
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed. The link may have expired or is invalid.";
      setVerifyResult({ success: false, message: msg });
      toast.error(msg);
      window.history.replaceState({}, "", window.location.pathname);
    } finally {
      setVerifying(false);
    }
  }, []);

  // Fetch admin on mount if not in verification mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      handleVerifyToken(token);
    } else if (window.location.pathname.includes("verify-email-change")) {
      navigate("/Login");
    } else {
      fetchCurrentAdmin();
    }
  }, [fetchCurrentAdmin, handleVerifyToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { newEmail, currentPassword } = form;

    // Client-side validation
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      toast.error("Please enter a valid new email address.");
      return;
    }
    if (newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      toast.error("New email cannot be the same as your current email.");
      return;
    }
    if (!currentPassword || currentPassword.length < 1) {
      toast.error("Current password is required to verify your identity.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestEmailChange({ newEmail: newEmail.trim(), currentPassword });
      if (res.success) {
        setPendingChange(true);
        setPendingEmailAddress(newEmail.trim());
        setForm({ newEmail: "", currentPassword: "" });
        toast.success(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send verification email.";
      const code = err.response?.data?.errorCode;
      if (code === "EMAIL_SERVICE_NOT_CONFIGURED") {
        toast.error("Email service not configured. Set EMAIL_USER & EMAIL_PASSWORD in backend .env for SMTP.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // STYLES
  // ============================================================
  const cardStyle = {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "16px",
    padding: "28px",
  };

  const inputStyle = {
    background: "#0f0f0f",
    border: "1px solid #3f3f46",
    borderRadius: "10px",
    color: "#f4f4f5",
    padding: "11px 14px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    color: "#a1a1aa",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "7px",
    display: "block",
  };

  // ============================================================
  // RENDER: Verifying state
  // ============================================================
  if (verifying) {
    return (
      <div className="p-4" style={{ color: "#f4f4f5", minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ color: "#ff6b00", width: "3rem", height: "3rem" }} role="status" />
          <p style={{ color: "#a1a1aa", fontSize: "15px" }}>Verifying your new email address…</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Verification result overlay
  // ============================================================
  if (verifyResult) {
    return (
      <div className="p-4" style={{ color: "#f4f4f5", minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "520px", width: "100%", margin: "40px auto" }}>
          <div
            className="p-4 p-md-5 rounded-4 text-center"
            style={{
              background: verifyResult.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              border: verifyResult.success ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.3)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div className="mb-3" style={{ fontSize: "3.5rem" }}>
              {verifyResult.success ? "✅" : "❌"}
            </div>
            <h4 className="fw-bold mb-2" style={{ color: verifyResult.success ? "#10b981" : "#ef4444" }}>
              {verifyResult.success ? "Admin Email Updated!" : "Verification Failed"}
            </h4>
            <p style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.6" }}>{verifyResult.message}</p>
            {verifyResult.success && (
              <div
                className="p-3 rounded-3 my-3 text-start"
                style={{ background: "#18181b", border: "1px solid #27272a" }}
              >
                <div style={{ fontSize: "12px", color: "#71717a" }}>NEW LOGIN EMAIL:</div>
                <div className="fw-bold" style={{ color: "#f4f4f5", fontSize: "15px" }}>{verifyResult.newEmail}</div>
              </div>
            )}
            <button
              onClick={() => navigate(verifyResult.success ? "/Login" : "/AdminEmailSettings")}
              className="btn mt-3 fw-bold px-4 py-2 rounded-3"
              style={{ background: "linear-gradient(135deg,#ff6b00,#e05e00)", border: "none", color: "white", fontSize: "14px" }}
            >
              {verifyResult.success ? "Go to Login" : "Back to Admin Settings"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: Main email change form
  // ============================================================
  return (
    <div className="p-4" style={{ color: "#f4f4f5", minHeight: "100vh", background: "#09090b" }}>

      {/* Header */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-3 mb-1">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: "44px", height: "44px", background: "linear-gradient(135deg,#ff6b00,#e05e00)", boxShadow: "0 6px 20px rgba(255,107,0,0.35)" }}
          >
            <i className="bi bi-envelope-at text-white fs-5" />
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#ffffff" }}>Admin Email Settings</h4>
            <p className="mb-0" style={{ color: "#71717a", fontSize: "13px" }}>
              Manage and change your admin login email address securely.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4" style={{ maxWidth: "900px" }}>

        {/* LEFT: Email Change Form */}
        <div className="col-12 col-lg-7">

          {/* Pending verification banner */}
          {pendingChange && (
            <div
              className="p-3 rounded-3 mb-4 d-flex align-items-start gap-3"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.35)" }}
            >
              <i className="bi bi-hourglass-split mt-1" style={{ color: "#f59e0b", fontSize: "1.2rem" }} />
              <div>
                <div className="fw-bold mb-1" style={{ color: "#fbbf24", fontSize: "14px" }}>Verification Pending</div>
                <div style={{ color: "#fde68a", fontSize: "13px", lineHeight: "1.5" }}>
                  A verification link was sent to{" "}
                  <strong>{pendingEmailAddress || "your new email address"}</strong>. Click the link in that email to confirm the change.
                  Your current email (<strong>{currentEmail}</strong>) remains active until then.
                </div>
              </div>
            </div>
          )}

          <div style={cardStyle}>
            <h6 className="fw-bold mb-1" style={{ color: "#ffffff", fontSize: "15px" }}>
              <i className="bi bi-at me-2" style={{ color: "#ff6b00" }} />
              Change Admin Login Email
            </h6>
            <p className="mb-4" style={{ color: "#71717a", fontSize: "13px" }}>
              The login email is stored in your Admin account in MongoDB. Changing it requires password re-authentication and email confirmation.
            </p>

            {/* Current Email (read-only from MongoDB) */}
            <div className="mb-3">
              <label style={labelStyle}>Current Login Email (MongoDB)</label>
              <div
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                style={{ background: "#0a0a0a", border: "1px solid #27272a", fontSize: "14px", color: "#e4e4e7" }}
              >
                <i className="bi bi-envelope" style={{ color: "#71717a" }} />
                <span>{loadingMe ? "Loading from database…" : (currentEmail || "Unknown")}</span>
                <span
                  className="badge ms-auto"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: "10px", padding: "4px 8px" }}
                >
                  ACTIVE
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* New Email */}
              <div className="mb-3">
                <label style={labelStyle}>New Email Address</label>
                <div className="position-relative">
                  <input
                    id="adminNewEmail"
                    type="email"
                    value={form.newEmail}
                    onChange={(e) => setForm({ ...form, newEmail: e.target.value })}
                    placeholder="new-admin@example.com"
                    style={inputStyle}
                    required
                    autoComplete="email"
                  />
                </div>
                <div style={{ fontSize: "11px", color: "#71717a", marginTop: "5px" }}>
                  A verification link will be sent to this new address.
                </div>
              </div>

              {/* Current Password */}
              <div className="mb-4">
                <label style={labelStyle}>Current Password (Re-authentication)</label>
                <div className="position-relative">
                  <input
                    id="adminCurrentPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    style={{ ...inputStyle, paddingRight: "44px" }}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="btn p-0 position-absolute"
                    style={{ right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#71717a", lineHeight: 1 }}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
                <div style={{ fontSize: "11px", color: "#71717a", marginTop: "5px" }}>
                  Required to confirm your identity before initiating email change.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn fw-bold px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2"
                style={{
                  background: "linear-gradient(135deg,#ff6b00,#e05e00)",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  boxShadow: "0 6px 20px rgba(255,107,0,0.35)",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" />
                    Sending Verification…
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-check-fill fs-6" />
                    Send Verification Email
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Security info card */}
        <div className="col-12 col-lg-5">
          <div style={cardStyle}>
            <h6 className="fw-bold mb-3" style={{ color: "#ffffff", fontSize: "15px" }}>
              <i className="bi bi-shield-lock-fill me-2" style={{ color: "#ff6b00" }} />
              How It Works
            </h6>
            <div className="d-flex flex-column gap-3">
              {[
                { icon: "bi-1-circle-fill", label: "Enter New Email", desc: "Type the email address you want to use as your admin login." },
                { icon: "bi-2-circle-fill", label: "Re-authenticate", desc: "Enter your current password to confirm your identity." },
                { icon: "bi-3-circle-fill", label: "Check New Inbox", desc: "A secure verification link will be sent to the new email address." },
                { icon: "bi-4-circle-fill", label: "Click to Confirm", desc: "Click the link in the email to activate your new login email in MongoDB." },
              ].map((step) => (
                <div key={step.icon} className="d-flex gap-3">
                  <i className={`bi ${step.icon}`} style={{ color: "#ff6b00", fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div className="fw-semibold" style={{ fontSize: "13px", color: "#e4e4e7" }}>{step.label}</div>
                    <div style={{ fontSize: "12px", color: "#71717a", lineHeight: "1.5" }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-3 p-3 rounded-3"
            style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <div className="d-flex align-items-center gap-2 mb-2 fw-semibold" style={{ color: "#93c5fd", fontSize: "13px" }}>
              <i className="bi bi-info-circle-fill" />
              Important Security Notes
            </div>
            <ul className="mb-0 ps-3" style={{ color: "#bfdbfe", fontSize: "11px", lineHeight: "1.7" }}>
              <li>Your <strong>current email remains active</strong> until verification is complete.</li>
              <li>The verification link is <strong>single-use</strong> and expires in <strong>30 minutes</strong>.</li>
              <li>Changing your admin login email updates <strong>MongoDB User.email</strong>.</li>
              <li>SMTP credentials in <code>backend/.env</code> are for email transport only and remain untouched.</li>
              <li>After verification, log in using your new email address.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminEmailSettings;
