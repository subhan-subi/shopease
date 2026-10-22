import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import { toast } from "react-toastify";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Password strength calculation
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, text: "Too short", color: "#6b7280" };
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: "Weak", color: "#ef4444", width: "30%" };
    if (score <= 4) return { score, text: "Medium", color: "#f59e0b", width: "65%" };
    return { score, text: "Strong", color: "#10b981", width: "100%" };
  };

  const strength = calculateStrength(password);

  const validate = () => {
    const errors = {};
    if (!password) {
      errors.password = "New password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm your new password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsLoading(true);

    try {
      const response = await resetPassword(token, password);
      setIsSuccess(true);
      toast.success(response.message || "Password updated successfully!");
    } catch (err) {
      console.error("Reset password error:", err);
      const msg =
        err.response?.data?.message ||
        "Invalid or expired password reset link. Please request a new one.";
      setErrorMessage(msg);
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
            <i className="bi bi-key-fill fs-4" style={{ color: "#ff6b00" }}></i>
          </div>
          <h3 className="fw-bold text-white tracking-tight mb-1">
            Set New Password
          </h3>
          <p className="text-secondary small mb-0">
            Create a strong, memorable password for your ShopEase account.
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="text-center py-3">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle p-3 mb-3"
              style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", width: "68px", height: "68px" }}
            >
              <i className="bi bi-check-circle-fill fs-2"></i>
            </div>
            <h5 className="text-white fw-bold mb-2">Password Reset Successful!</h5>
            <p className="text-secondary small mb-4" style={{ lineHeight: "1.6" }}>
              Your password has been changed securely. You can now log in using your new credentials.
            </p>
            <Link
              to="/Login"
              className="btn text-white w-100 py-2.5 fw-semibold rounded-3 shadow-sm text-decoration-none d-block"
              style={{
                background: "linear-gradient(135deg, #ff6b00 0%, #e05e00 100%)",
                border: "none",
              }}
            >
              Proceed to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Global Error Alert (e.g. Expired / Invalid token) */}
            {errorMessage && (
              <div
                className="alert alert-danger p-3 mb-3 rounded-3 small d-flex align-items-start gap-2"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#fca5a5" }}
              >
                <i className="bi bi-exclamation-triangle-fill fs-6 flex-shrink-0 mt-0.5"></i>
                <div>
                  <div className="fw-semibold">{errorMessage}</div>
                  <Link to="/forgot-password" className="text-white fw-bold small text-decoration-underline mt-1 d-inline-block">
                    Request a new password reset link
                  </Link>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-light opacity-75">
                New Password
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border-end-0 text-secondary ps-3"
                  style={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                >
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: "" });
                    }
                  }}
                  className={`form-control border-start-0 border-end-0 text-white py-2.5 fs-6 shadow-none ${
                    validationErrors.password ? "is-invalid border-danger" : ""
                  }`}
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: validationErrors.password ? "#dc3545" : "#374151",
                  }}
                  placeholder="At least 6 characters"
                  autoFocus
                />
                <span
                  className="input-group-text border-start-0 text-secondary pe-3"
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: validationErrors.password ? "#dc3545" : "#374151",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </span>
              </div>
              {validationErrors.password && (
                <div className="text-danger small mt-1 fw-medium">
                  {validationErrors.password}
                </div>
              )}

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary" style={{ fontSize: "11px" }}>
                      Strength: <strong style={{ color: strength.color }}>{strength.text}</strong>
                    </span>
                  </div>
                  <div
                    className="progress"
                    style={{ height: "4px", backgroundColor: "#374151", borderRadius: "10px" }}
                  >
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: strength.width,
                        backgroundColor: strength.color,
                        transition: "all 0.3s ease",
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label small fw-semibold text-light opacity-75">
                Confirm New Password
              </label>
              <div className="input-group">
                <span
                  className="input-group-text border-end-0 text-secondary ps-3"
                  style={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                >
                  <i className="bi bi-shield-check"></i>
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (validationErrors.confirmPassword) {
                      setValidationErrors({ ...validationErrors, confirmPassword: "" });
                    }
                  }}
                  className={`form-control border-start-0 border-end-0 text-white py-2.5 fs-6 shadow-none ${
                    validationErrors.confirmPassword ? "is-invalid border-danger" : ""
                  }`}
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: validationErrors.confirmPassword ? "#dc3545" : "#374151",
                  }}
                  placeholder="Re-enter new password"
                />
                <span
                  className="input-group-text border-start-0 text-secondary pe-3"
                  style={{
                    backgroundColor: "#1f2937",
                    borderColor: validationErrors.confirmPassword ? "#dc3545" : "#374151",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </span>
              </div>
              {validationErrors.confirmPassword && (
                <div className="text-danger small mt-1 fw-medium">
                  {validationErrors.confirmPassword}
                </div>
              )}
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
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </button>

            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                to="/Login"
                className="small text-secondary text-decoration-none fw-medium d-inline-flex align-items-center gap-1"
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

export default ResetPassword;
