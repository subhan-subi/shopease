import React from "react";
import { Link, useLocation } from "react-router-dom";

function AuthLayout({ children }) {
  const location = useLocation();
  const isLogin = location.pathname.toLowerCase() === "/login";

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        backgroundColor: "#0b0f19",
        backgroundImage: "radial-gradient(circle at 50% 0%, #1f293d 0%, #0b0f19 75%)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Ambient Glow Effects */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "450px",
          height: "450px",
          background: "rgba(255, 107, 0, 0.08)",
          filter: "blur(140px)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "450px",
          height: "450px",
          background: "rgba(31, 41, 61, 0.4)",
          filter: "blur(140px)",
          borderRadius: "50%",
          pointerEvents: "none"
        }}
      />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row justify-content-center align-items-center">
          <div className="col-xl-10 col-lg-11">
            <div
              className="card border-0 shadow-lg rounded-4 overflow-hidden"
              style={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255, 255, 255, 0.08)"
              }}
            >
              <div className="row g-0">
                {/* Left Side: Premium Branding Section */}
                <div
                  className="col-lg-5 text-white p-4 p-sm-5 d-flex flex-column justify-content-between position-relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, #0b0f19 0%, #1f293d 60%, #111827 100%)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  {/* Decorative Subtle Circle */}
                  <div
                    style={{
                      position: "absolute",
                      right: "-20%",
                      top: "-20%",
                      width: "300px",
                      height: "300px",
                      background: "rgba(255, 107, 0, 0.05)",
                      borderRadius: "50%",
                      pointerEvents: "none"
                    }}
                  />

                  <div>
                    {/* Brand Logo */}
                    <div className="d-flex align-items-center gap-3 mb-5">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 bg-dark border border-secondary border-opacity-25 shadow-sm"
                        style={{ width: "48px", height: "48px" }}
                      >
                        <i className="bi bi-bag-check-fill fs-3" style={{ color: "#ff6b00" }}></i>
                      </div>
                      <span className="fs-3 fw-bold tracking-tight text-white">
                        Shop<span style={{ color: "#ff6b00" }}>Ease</span>
                      </span>
                    </div>

                    {/* Dynamic Text Content */}
                    <div className="mb-4">
                      <span
                        className="badge border rounded-pill px-3 py-2 mb-3 small fw-semibold"
                        style={{
                          backgroundColor: "rgba(255, 107, 0, 0.1)",
                          borderColor: "rgba(255, 107, 0, 0.3)",
                          color: "#ff6b00"
                        }}
                      >
                        {isLogin ? "Welcome Back" : "Start For Free"}
                      </span>
                      <h2 className="fw-bold display-6 mb-3 text-white lh-sm">
                        {isLogin ? "Welcome Back to ShopEase!" : "Join ShopEase Today"}
                      </h2>
                      <p className="fs-6 text-secondary lh-lg mb-0" style={{ maxWidth: "380px" }}>
                        {isLogin
                          ? "Access your dashboard, track orders, and manage your store preferences effortlessly."
                          : "Create an account to explore top-tier products, exclusive deals, and seamless checkout."}
                      </p>
                    </div>
                  </div>

                  {/* Footer Switch Link */}
                  <div className="pt-4 border-top border-secondary border-opacity-25 mt-auto">
                    <p className="small text-secondary mb-1">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    {isLogin ? (
                      <Link
                        to="/Signup"
                        className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
                        style={{ color: "#ff6b00" }}
                      >
                        Sign Up <i className="bi bi-arrow-right"></i>
                      </Link>
                    ) : (
                      <Link
                        to="/Login"
                        className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
                        style={{ color: "#ff6b00" }}
                      >
                        Login <i className="bi bi-arrow-right"></i>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Side: Dynamic Form Section */}
                <div
                  className="col-lg-7 p-4 p-sm-5 d-flex flex-column justify-content-center"
                  style={{ backgroundColor: "#111827" }}
                >
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;