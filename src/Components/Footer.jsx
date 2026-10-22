import { useContext } from "react";
import { Addtocart } from "./Usercontext";
import { Link } from "react-router-dom";

export function Footer() {
  const { darkmode } = useContext(Addtocart);

  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Shop All", to: "/Productpage" },
    { label: "New Arrivals", to: "/Productpage" },
    { label: "Best Sellers", to: "/Productpage" },
    { label: "Sale & Offers", to: "/Productpage" },
  ];

  const categories = [
    { label: "Electronics", to: "/category/Electronics" },
    { label: "Mobile Phones", to: "/category/Mobile Phones" },
    { label: "Accessories", to: "/category/Accessories" },
    { label: "Watches", to: "/category/Watches" },
    { label: "Sports", to: "/category/Sports" },
  ];

  const support = [
    { label: "My Orders", to: "/UserDashboard" },
    { label: "Track Order", to: "/UserDashboard" },
    { label: "Privacy Policy", to: "/" },
    { label: "FAQs", to: "/Contact" },
    { label: "Contact Us", to: "/Contact" },
  ];

  const payments = [
    { icon: "bi-credit-card-fill", label: "Visa", color: "#f59e0b" },
    { icon: "bi-credit-card-2-front-fill", label: "MasterCard", color: "#f59e0b" },
    { label: "Easypaisa", color: "#10b981", text: true },
    { label: "JazzCash", color: "#ef4444", text: true },
    { icon: "bi-cash-stack", label: "Cash On Delivery", color: "#10b981" },
  ];

  const socials = [
    { icon: "bi-facebook", color: "#1877f2" },
    { icon: "bi-instagram", color: "#e1306c" },
    { icon: "bi-twitter-x", color: "#000000" },
    { icon: "bi-whatsapp", color: "#25d366" },
  ];

  const linkStyle = {
    color: "#94a3b8",
    fontSize: "13px",
    textDecoration: "none",
    transition: "color 0.2s",
    display: "block",
    marginBottom: "8px",
  };

  return (
    <footer
      style={{
        background: darkmode
          ? "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)"
          : "linear-gradient(180deg, #0f172a 0%, #0b0f19 100%)",
        borderTop: "1px solid rgba(255,107,0,0.25)",
      }}
    >
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand Column */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="mb-3">
              <span className="fw-bold" style={{ fontSize: "26px", color: "#ffffff" }}>
                Shop<span style={{ color: "#ff6b00" }}>Ease.</span>
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.7", maxWidth: "220px" }}>
              Pakistan's most trusted online store. Quality guaranteed, prices unbeatable.
            </p>
            <div className="d-flex flex-column gap-1 mb-4">
              <a href="tel:+923001234567" style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-telephone-fill" style={{ color: "#ff6b00", fontSize: "12px" }}></i>
                +92 300 1234567
              </a>
              <a href="mailto:support@shopease.com" style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-envelope-fill" style={{ color: "#ff6b00", fontSize: "12px" }}></i>
                support@shopease.com
              </a>
              <span style={{ ...linkStyle, display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="bi bi-geo-alt-fill" style={{ color: "#ef4444", fontSize: "12px" }}></i>
                Multan, Pakistan
              </span>
            </div>

            {/* Social Icons */}
            <div className="d-flex gap-2">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className="d-flex align-items-center justify-content-center rounded-circle text-decoration-none"
                  style={{
                    width: "34px", height: "34px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94a3b8",
                    fontSize: "14px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = s.color;
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = s.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  <i className={`bi ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-2 offset-lg-1">
            <h6 className="fw-bold mb-3" style={{ color: "#ff6b00", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Quick Links
            </h6>
            {quickLinks.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                style={linkStyle}
                onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                onMouseLeave={e => (e.target.style.color = "#94a3b8")}
              >
                <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px", color: "#ff6b00" }}></i>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-bold mb-3" style={{ color: "#ff6b00", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Categories
            </h6>
            {categories.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                style={linkStyle}
                onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                onMouseLeave={e => (e.target.style.color = "#94a3b8")}
              >
                <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px", color: "#ff6b00" }}></i>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-bold mb-3" style={{ color: "#ff6b00", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Support
            </h6>
            {support.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                style={linkStyle}
                onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                onMouseLeave={e => (e.target.style.color = "#94a3b8")}
              >
                <i className="bi bi-chevron-right me-1" style={{ fontSize: "10px", color: "#ff6b00" }}></i>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "40px 0 24px" }} />

        {/* Bottom Bar */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          {/* Payment Methods */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            <span style={{ color: "#475569", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Accepted:
            </span>
            {payments.map((p, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-2 d-flex align-items-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "11px",
                  color: p.color || "#94a3b8",
                  fontWeight: "600",
                }}
              >
                {p.icon && <i className={`bi ${p.icon}`}></i>}
                {p.label}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <div style={{ color: "#475569", fontSize: "12px", textAlign: "center" }}>
            © {new Date().getFullYear()}{" "}
            <span style={{ color: "#ff6b00", fontWeight: "bold" }}>ShopEase.</span>{" "}
            All Rights Reserved. Made with{" "}
            <i className="bi bi-heart-fill" style={{ color: "#ef4444", fontSize: "10px" }}></i>{" "}
            by Muhammad Subhan
          </div>
        </div>
      </div>
    </footer>
  );
}