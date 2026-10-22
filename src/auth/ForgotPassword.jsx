import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import { toast } from "react-toastify";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.trim()) {
      return "Email address is required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await forgotPassword(email.trim());
      setIsSubmitted(true);
      toast.success(response.message || "Password reset link has been dispatched.");
    } catch (err) {
      console.error("Forgot password error:", err);
      const msg = err.response?.data?.message || "Failed to process request. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center py-5 px-3">
      <div
        className="card border-0 p-4 p-md-5 rounded-4 shadow-lg"
        style={{
          maxWidth: "460px",
          width: "100%",
          backgroundColor: "#111827",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-3 p-2 mb-3 border border-secondary border-opacity-25">
            <i className="bi bi-shield-lock-fill fs-4" style={{ color: "#ff6b00" }}></i>
          </div>
          <h3 className="fw-bold text-white tracking-tight mb-1">
            Forgot Password?
          </h3>
          <p className="text-secondary small mb-0">
            {isSubmitted
              ? "Instructions have been dispatched to your email address."
              : "Enter your registered email address and we'll send you a secure link to reset your password."}
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center py-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3"
              style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", width: "68px", height: "68px" }}
            >
              <i className="bi bi-check-circle-fill fs-2"></i>
            </div>
            <h5 className="text-white fw-bold mb-2">Check Your Inbox</h5>
            <p className="text-secondary small mb-4" style={{ lineHeight: "1.6" }}>
              If an account is associated with <strong className="text-white">{email}</strong>, a password reset link has been sent. The link expires in 15 minutes.
            </p>
            <div className="d-flex flex-column gap-2">
              <Link
                to="/Login"
                className="btn text-white py-2.5 fw-semibold rounded-3 shadow-sm text-decoration-none"
                style={{
                  background: "linear-gradient(135deg, #ff6b00 0%, #e05e00 100%)",
                  border: "none",
                }}
              >
                Return to Sign In
              </Link>
              <button
                type="button"
                className="btn btn-link text-secondary text-decoration-none small mt-2"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Did not receive email? Try again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-light opacity-75">
                Registered Email Address
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border-end-0 text-secondary ps-3"
                  style={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                >
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={`form-control border-start-0 text-white py-2.5 fs-6 shadow-none ${
                    error ? "is-invalid border-danger" : ""
                  }`}
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: error ? "#dc3545" : "#374151",
                  }}
                  placeholder="name@example.com"
                  autoFocus
                />
              </div>
              {error && <div className="text-danger small mt-1.5 fw-medium">{error}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn text-white w-100 py-2.5 fw-semibold rounded-3 mb-4 shadow-sm d-flex align-items-center justify-content-center"
              style={{
                background: "linear-gradient(135deg, #ff6b00 0%, #e05e00 100%)",
                border: "none",
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending Link...
                </>
              ) : (
                "Send Password Reset Link"
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/Login"
                className="small text-secondary text-decoration-none fw-medium d-inline-flex align-items-center gap-1"
                style={{ transition: "color 0.2s" }}
              >
                <i className="bi bi-arrow-left"></i> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
