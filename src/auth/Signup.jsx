import React, { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../services/authService";
import { toast } from "react-toastify";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showCpassword, setShowCpassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.email) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.terms) {
      newErrors.terms = "You must agree to the Terms & Conditions.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Backend REST API registration
      const response = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      toast.success(
        response.message ||
          "Account Created Successfully! Please check your email to verify before logging in."
      );

      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;

      if (
        error.response?.status === 409 ||
        msg.toLowerCase().includes("already registered")
      ) {
        setErrors({
          email: "Email already registered",
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-start mb-4">
        <h3 className="fw-bold text-white tracking-tight mb-1">
          Create <span style={{ color: "#ff6b00" }}>ShopEase</span> Account
        </h3>
        <p className="text-secondary small mb-0">
          Register to start managing orders or shopping
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-light opacity-75">
            Full Name
          </label>
          <div className="input-group">
            <span
              className="input-group-text border-end-0 text-secondary ps-3"
              style={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
            >
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-control border-start-0 text-white py-2 fs-6 shadow-none ${
                errors.fullName ? "is-invalid border-danger" : ""
              }`}
              style={{
                backgroundColor: "#1f2937",
                borderColor: errors.fullName ? "#dc3545" : "#374151"
              }}
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && (
            <div className="text-danger small mt-1 fw-medium">
              {errors.fullName}
            </div>
          )}
        </div>

        {/* Email Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-light opacity-75">
            Email Address
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
              value={formData.email}
              onChange={handleChange}
              className={`form-control border-start-0 text-white py-2 fs-6 shadow-none ${
                errors.email ? "is-invalid border-danger" : ""
              }`}
              style={{
                backgroundColor: "#1f2937",
                borderColor: errors.email ? "#dc3545" : "#374151"
              }}
              placeholder="name@example.com"
            />
          </div>
          {errors.email && (
            <div className="text-danger small mt-1 fw-medium">
              {errors.email}
            </div>
          )}
        </div>

        {/* Password Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-light opacity-75">
            Password
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control border-start-0 border-end-0 text-white py-2 fs-6 shadow-none ${
                errors.password ? "is-invalid border-danger" : ""
              }`}
              style={{
                backgroundColor: "#1f2937",
                borderColor: errors.password ? "#dc3545" : "#374151"
              }}
              placeholder="••••••••"
            />
            <span
              className="input-group-text border-start-0 text-secondary pe-3"
              style={{
                backgroundColor: "#1f2937",
                borderColor: errors.password ? "#dc3545" : "#374151",
                cursor: "pointer"
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>
          {errors.password && (
            <div className="text-danger small mt-1 fw-medium">
              {errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-light opacity-75">
            Confirm Password
          </label>
          <div className="input-group">
            <span
              className="input-group-text border-end-0 text-secondary ps-3"
              style={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
            >
              <i className="bi bi-shield-lock"></i>
            </span>
            <input
              type={showCpassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-control border-start-0 border-end-0 text-white py-2 fs-6 shadow-none ${
                errors.confirmPassword ? "is-invalid border-danger" : ""
              }`}
              style={{
                backgroundColor: "#1f2937",
                borderColor: errors.confirmPassword ? "#dc3545" : "#374151"
              }}
              placeholder="••••••••"
            />
            <span
              className="input-group-text border-start-0 text-secondary pe-3"
              style={{
                backgroundColor: "#1f2937",
                borderColor: errors.confirmPassword ? "#dc3545" : "#374151",
                cursor: "pointer"
              }}
              onClick={() => setShowCpassword(!showCpassword)}
            >
              <i className={`bi ${showCpassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>
          {errors.confirmPassword && (
            <div className="text-danger small mt-1 fw-medium">
              {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="mb-4 small">
          <div className="form-check">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className={`form-check-input bg-dark border-secondary rounded-2 shadow-none ${
                errors.terms ? "is-invalid" : ""
              }`}
              id="terms"
            />
            <label className="form-check-label text-secondary user-select-none" htmlFor="terms">
              I agree to the{" "}
              <a
                href="#terms"
                className="text-decoration-none fw-semibold"
                style={{ color: "#ff6b00" }}
              >
                Terms & Conditions
              </a>
            </label>
          </div>
          {errors.terms && (
            <div className="text-danger small mt-1 fw-medium">{errors.terms}</div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn text-white w-100 py-2.5 fw-semibold rounded-3 mb-4 shadow-sm d-flex align-items-center justify-content-center"
          style={{
            background: "linear-gradient(135deg, #ff6b00 0%, #e05e00 100%)",
            border: "none",
            transition: "transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out"
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          ) : null}
          Create Account
        </button>

        {/* Divider */}
        <div className="text-center text-secondary small mb-4 d-flex align-items-center">
          <hr className="flex-grow-1 border-secondary opacity-25 my-0" />
          <span className="px-3 text-secondary opacity-75 fw-medium">Or sign up with</span>
          <hr className="flex-grow-1 border-secondary opacity-25 my-0" />
        </div>

        {/* Social Buttons */}
        <div className="row g-3 mb-4">
          <div className="col-6">
            <button
              type="button"
              className="btn text-white border-0 w-100 py-2.5 small fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3"
              style={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            >
              <i className="bi bi-google text-danger fs-6"></i> Google
            </button>
          </div>
          <div className="col-6">
            <button
              type="button"
              className="btn text-white border-0 w-100 py-2.5 small fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3"
              style={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
            >
              <i className="bi bi-github text-white fs-6"></i> GitHub
            </button>
          </div>
        </div>

        {/* Bottom Switch Text */}
        <div className="text-center">
          <p className="small text-secondary mb-0">
            Already have an account?{" "}
            <Link to="/Login" className="fw-semibold text-decoration-none" style={{ color: "#ff6b00" }}>
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Signup;