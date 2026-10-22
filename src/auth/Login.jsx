import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  login,
  forgotPassword,
  googleLogin,
} from "../services/authService";
import { auth } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";

function Login() {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states & Errors
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const idToken = await user.getIdToken();

      const authData = await googleLogin({
        email: user.email,
        fullName: user.displayName || "Google User",
        image: user.photoURL || "",
        uid: user.uid,
        idToken: idToken
      });

      toast.success("Welcome back, " + (authData.user.fullName || "User") + "!");
      if (authData.user.role === "admin") {
        navigate("/Dashboard");
      } else {
        navigate("/UserDashboard");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
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
      // Backend REST API Login
      const data = await login({
        email: formData.email,
        password: formData.password,
      });

      toast.success("Welcome back, " + (data.user.fullName || "User") + "!");
      if (data.user.role === "admin") {
        navigate("/Dashboard");
      } else {
        navigate("/UserDashboard");
      }
    } catch (error) {
      console.log(error);
      const msg = error.response?.data?.message || error.message;

      if (
        error.response?.status === 401 ||
        msg.toLowerCase().includes("invalid email")
      ) {
        setErrors({
          email: "Invalid email or password",
        });
      } else if (error.response?.status === 403) {
        toast.warning("Please verify your email before login.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container-fluid  d-flex justify-content-center align-items-center py-5 px-3"
      style={{
      
      }}
    >
      <div
        className="card border-0  p-4 p-md-5 rounded-4"
        style={{
          maxWidth: "440px",
          width: "100%",
          backgroundColor: "#111827",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        {/* Brand Header */}
        <div className="text-center text-md-start mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-3 p-2 mb-3 border border-secondary border-opacity-25">
            <i className="bi bi-bag-check-fill fs-4" style={{ color: "#ff6b00" }}></i>
          </div>
          <h3 className="fw-bold text-white tracking-tight mb-1">
            Sign In to <span style={{ color: "#ff6b00" }}>ShopEase</span>
          </h3>
          <p className="text-secondary small mb-0">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-light opacity-75">Email Address</label>
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
                className={`form-control border-start-0 text-white py-2.5 fs-6 shadow-none ${
                  errors.email ? "is-invalid border-danger" : ""
                }`}
                style={{
                  backgroundColor: "#1f2937",
                  borderColor: errors.email ? "#dc3545" : "#374151"
                }}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <div className="text-danger small mt-1 fw-medium">{errors.email}</div>}
          </div>

          {/* Password Input */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-light opacity-75">Password</label>
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
                className={`form-control border-start-0 border-end-0 text-white py-2.5 fs-6 shadow-none ${
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
            {errors.password && <div className="text-danger small mt-1 fw-medium">{errors.password}</div>}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-4 small">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input bg-dark border-secondary rounded-2 shadow-none"
                id="rememberMe"
              />
              <label className="form-check-label text-secondary user-select-none" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-decoration-none fw-semibold"
              style={{ color: "#ff6b00" }}
            >
              Forgot Password?
            </Link>
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
            Sign In
          </button>

          {/* Socials Divider */}
          <div className="text-center text-secondary small mb-4 d-flex align-items-center">
            <hr className="flex-grow-1 border-secondary opacity-25 my-0" />
            <span className="px-3 text-secondary opacity-75 fw-medium">Or continue with</span>
            <hr className="flex-grow-1 border-secondary opacity-25 my-0" />
          </div>

          {/* Social Buttons */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <button
                type="button"
                className="btn text-white border-0 w-100 py-2.5 small fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3"
                style={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                onClick={handleGoogleLogin}
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
              Don't have an account?{" "}
              <Link to="/Signup" className="fw-semibold text-decoration-none" style={{ color: "#ff6b00" }}>
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;