import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import image5 from '../assets/fri.png';
import { useContext } from "react";
import { Addtocart } from "./Usercontext";

export function Mainpart() {
  const { darkmode } = useContext(Addtocart);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { icon: "bi-box-seam-fill", value: "10K+", label: "Products" },
    { icon: "bi-people-fill", value: "50K+", label: "Customers" },
    { icon: "bi-star-fill", value: "4.9", label: "Rating" },
    { icon: "bi-truck", value: "Free", label: "Shipping" },
  ];

  const badges = [
    { icon: "bi-shield-check", text: "Secure Checkout", color: "#10b981" },
    { icon: "bi-arrow-counterclockwise", text: "30-Day Returns", color: "#3b82f6" },
    { icon: "bi-lightning-fill", text: "Flash Deals Daily", color: "#f59e0b" },
  ];

  return (
    <div
      className="container-fluid px-3 px-md-4 py-4 py-md-5"
      style={{
        background: darkmode
          ? "linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0f0f0f 100%)"
          : "linear-gradient(135deg, #fff7f0 0%, #ffffff 50%, #f8fafc 100%)",
        borderRadius: "24px",
        border: darkmode ? "1px solid #1f1f1f" : "1px solid #f1e8df",
        boxShadow: darkmode
          ? "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,107,0,0.05)"
          : "0 20px 60px rgba(255,107,0,0.06), 0 1px 0 rgba(255,107,0,0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient Glow */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-60px",
        width: "250px", height: "250px",
        background: "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="row align-items-center g-4" style={{ position: "relative", zIndex: 1 }}>
        {/* Left Content */}
        <div className="col-lg-6 col-12 pe-lg-5">
          {/* Promo Badge */}
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-2 mb-3 rounded-pill fw-semibold"
            style={{
              background: "rgba(255,107,0,0.12)",
              border: "1px solid rgba(255,107,0,0.3)",
              color: "#ff6b00",
              fontSize: "13px",
              animation: "pulse 2s infinite",
            }}
          >
            <i className="bi bi-lightning-fill text-warning"></i>
            SUMMER SALE — Up to 30% OFF
          </div>

          {/* Headline */}
          <h1
            className="fw-bold lh-sm mb-3"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              color: darkmode ? "#ffffff" : "#0f172a",
              letterSpacing: "-1px",
            }}
          >
            Find Your{" "}
            <span
              style={{
                color: "#ff6b00",
                position: "relative",
              }}
            >
              Perfect
            </span>{" "}
            Tech{" "}
            <span style={{ color: "#ff6b00" }}>Deal</span>
          </h1>

          {/* Description */}
          <p
            className="mb-4"
            style={{
              fontSize: "16px",
              color: darkmode ? "#a1a1aa" : "#64748b",
              lineHeight: "1.7",
              maxWidth: "480px",
            }}
          >
            Discover the latest electronics, accessories, and fashion at unbeatable prices.
            Quality guaranteed. Fast delivery. Hassle-free returns.
          </p>

          {/* CTA Buttons */}
          <div className="d-flex flex-wrap gap-3 mb-4">
            <Link to="/Productpage">
              <button
                className="btn fw-bold px-4 py-2 rounded-pill text-white shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #ff6b00, #e05e00)",
                  border: "none",
                  fontSize: "15px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 6px 20px rgba(255,107,0,0.35)",
                }}
                onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.target.style.transform = "translateY(0)"}
              >
                <i className="bi bi-bag-fill me-2"></i>
                Shop Now
              </button>
            </Link>
            <Link to="/Productpage" className="text-decoration-none">
              <button
                className="btn fw-semibold px-4 py-2 rounded-pill"
                style={{
                  background: "transparent",
                  border: darkmode ? "1.5px solid #3f3f46" : "1.5px solid #e2e8f0",
                  color: darkmode ? "#e4e4e7" : "#334155",
                  fontSize: "15px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "#ff6b00"; e.target.style.color = "#ff6b00"; }}
                onMouseLeave={e => { e.target.style.borderColor = darkmode ? "#3f3f46" : "#e2e8f0"; e.target.style.color = darkmode ? "#e4e4e7" : "#334155"; }}
              >
                View All Products <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {badges.map((b, i) => (
              <div
                key={i}
                className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                style={{
                  background: darkmode ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  border: darkmode ? "1px solid #27272a" : "1px solid #e2e8f0",
                  fontSize: "12px",
                  color: darkmode ? "#a1a1aa" : "#64748b",
                }}
              >
                <i className={`bi ${b.icon}`} style={{ color: b.color, fontSize: "13px" }}></i>
                {b.text}
              </div>
            ))}
          </div>

          {/* Horizontal Divider */}
          <div style={{ height: "1px", background: darkmode ? "#1f1f1f" : "#f1f5f9", marginBottom: "20px" }} />

          {/* Stats Row */}
          <div className="d-flex gap-4 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="fw-bold" style={{ fontSize: "18px", color: "#ff6b00" }}>
                  <i className={`bi ${s.icon} me-1`} style={{ fontSize: "14px" }}></i>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", color: darkmode ? "#71717a" : "#94a3b8" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div className="col-lg-6 col-12 d-flex justify-content-center align-items-center position-relative">
          {/* Decorative Ring */}
          <div style={{
            position: "absolute",
            width: "340px", height: "340px",
            border: "1px dashed rgba(255,107,0,0.2)",
            borderRadius: "50%",
            animation: "spin 30s linear infinite",
          }} />
          <div style={{
            position: "absolute",
            width: "280px", height: "280px",
            border: "1px solid rgba(255,107,0,0.1)",
            borderRadius: "50%",
            animation: "spin 20s linear infinite reverse",
          }} />

          <img
            src={image5}
            alt="Featured product"
            className="img-fluid"
            style={{
              maxHeight: "380px",
              objectFit: "contain",
              filter: darkmode
                ? "drop-shadow(0 20px 40px rgba(255,107,0,0.25))"
                : "drop-shadow(0 20px 40px rgba(255,107,0,0.15))",
              animation: "float 4s ease-in-out infinite",
              position: "relative",
              zIndex: 2,
            }}
          />

          {/* Floating Badge - Discount */}
          <div
            style={{
              position: "absolute", top: "10%", left: "5%",
              background: "linear-gradient(135deg, #ff6b00, #e05e00)",
              color: "white", borderRadius: "12px",
              padding: "8px 14px", boxShadow: "0 8px 24px rgba(255,107,0,0.4)",
              fontSize: "12px", fontWeight: "bold", zIndex: 3,
              animation: "float 3s ease-in-out infinite 0.5s",
            }}
          >
            <i className="bi bi-tag-fill me-1"></i>Up to 30% OFF
          </div>

          {/* Floating Badge - Free Shipping */}
          <div
            style={{
              position: "absolute", bottom: "15%", right: "5%",
              background: darkmode ? "#18181b" : "#ffffff",
              color: darkmode ? "#ffffff" : "#0f172a",
              border: darkmode ? "1px solid #27272a" : "1px solid #e2e8f0",
              borderRadius: "12px", padding: "8px 14px",
              boxShadow: darkmode ? "0 8px 24px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.08)",
              fontSize: "12px", fontWeight: "600", zIndex: 3,
              animation: "float 3.5s ease-in-out infinite 1s",
            }}
          >
            <i className="bi bi-truck me-1" style={{ color: "#10b981" }}></i>Free Shipping
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}