import { useContext } from "react";
import { Addtocart } from "./Usercontext";

const features = [
  {
    icon: "bi-truck",
    title: "Free Fast Shipping",
    desc: "Free delivery on all orders above Rs 5,000. Express options available.",
    gradient: "linear-gradient(135deg, #ff6b00, #e05e00)",
    glow: "rgba(255,107,0,0.25)",
  },
  {
    icon: "bi-shield-lock-fill",
    title: "100% Secure Payments",
    desc: "All transactions are encrypted and protected by bank-grade security.",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    glow: "rgba(59,130,246,0.2)",
  },
  {
    icon: "bi-arrow-counterclockwise",
    title: "Easy 30-Day Returns",
    desc: "Return anything within 30 days, no questions asked. Hassle-free.",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.2)",
  },
  {
    icon: "bi-headphones",
    title: "24/7 Expert Support",
    desc: "Chat, call or WhatsApp — our team is always here to help you.",
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    glow: "rgba(139,92,246,0.2)",
  },
];

export function Free() {
  const { darkmode } = useContext(Addtocart);

  return (
    <div className="container py-5">
      {/* Section Header */}
      <div className="text-center mb-5">
        <span
          className="badge rounded-pill px-3 py-2 mb-2 fw-semibold"
          style={{
            background: "rgba(255,107,0,0.1)",
            border: "1px solid rgba(255,107,0,0.25)",
            color: "#ff6b00",
            fontSize: "12px",
            letterSpacing: "0.5px",
          }}
        >
          Why Choose Us
        </span>
        <h2
          className="fw-bold mb-2"
          style={{
            color: darkmode ? "#ffffff" : "#0f172a",
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            letterSpacing: "-0.5px",
          }}
        >
          Why Thousands Choose{" "}
          <span style={{ color: "#ff6b00" }}>ShopEase</span>
        </h2>
        <p style={{ color: darkmode ? "#71717a" : "#94a3b8", fontSize: "15px", maxWidth: "450px", margin: "0 auto" }}>
          We make shopping easy, safe &amp; affordable — every single day.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="row g-4">
        {features.map((f, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-3">
            <div
              className="h-100 p-4 rounded-4 d-flex flex-column gap-3"
              style={{
                background: darkmode ? "#18181b" : "#ffffff",
                border: darkmode ? "1px solid #27272a" : "1px solid #f1f5f9",
                boxShadow: darkmode
                  ? `0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px #27272a`
                  : `0 8px 30px ${f.glow}, 0 1px 0 rgba(0,0,0,0.04)`,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = darkmode
                  ? `0 16px 40px rgba(0,0,0,0.5)`
                  : `0 16px 40px ${f.glow}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = darkmode
                  ? `0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px #27272a`
                  : `0 8px 30px ${f.glow}, 0 1px 0 rgba(0,0,0,0.04)`;
              }}
            >
              {/* Icon */}
              <div
                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{
                  width: "52px", height: "52px",
                  background: f.gradient,
                  boxShadow: `0 6px 20px ${f.glow}`,
                }}
              >
                <i className={`bi ${f.icon} text-white`} style={{ fontSize: "22px" }}></i>
              </div>

              {/* Text */}
              <div>
                <h6
                  className="fw-bold mb-1"
                  style={{ color: darkmode ? "#f4f4f5" : "#0f172a", fontSize: "15px" }}
                >
                  {f.title}
                </h6>
                <p
                  className="mb-0"
                  style={{ color: darkmode ? "#71717a" : "#64748b", fontSize: "13px", lineHeight: "1.6" }}
                >
                  {f.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}