import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Addtocart } from "./Usercontext";

export function Flash() {
  const { darkmode } = useContext(Addtocart);

  // Countdown timer — resets every 24h
  const getInitialTime = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 0);
    return Math.floor((endOfDay - new Date()) / 1000);
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? getInitialTime() : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const timeUnit = (val, label) => (
    <div
      className="d-flex flex-column align-items-center justify-content-center rounded-3 fw-bold"
      style={{
        minWidth: "56px",
        height: "60px",
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        color: "#ffffff",
      }}
    >
      <span style={{ fontSize: "22px", lineHeight: 1 }}>{val}</span>
      <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.8px", opacity: 0.7 }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="container py-4">
      <div
        className="rounded-4 overflow-hidden position-relative"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          boxShadow: "0 20px 60px rgba(255,107,0,0.2), 0 0 0 1px rgba(255,107,0,0.15)",
          minHeight: "180px",
        }}
      >
        {/* Glow Effects */}
        <div style={{
          position: "absolute", top: "-40px", left: "20%",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", right: "15%",
          width: "250px", height: "250px",
          background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="row align-items-center g-0 px-4 py-4 py-md-3 position-relative" style={{ zIndex: 1 }}>
          {/* Left: Icon + Text */}
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{
                  width: "52px", height: "52px",
                  background: "linear-gradient(135deg, #ff6b00, #e05e00)",
                  boxShadow: "0 6px 20px rgba(255,107,0,0.4)",
                }}
              >
                <i className="bi bi-lightning-charge-fill text-white" style={{ fontSize: "22px" }}></i>
              </div>
              <div>
                <div
                  className="fw-bold text-uppercase"
                  style={{ fontSize: "11px", letterSpacing: "2px", color: "#ff6b00" }}
                >
                  Limited Time Offer
                </div>
                <h4 className="text-white fw-bold mb-0 mt-1" style={{ fontSize: "20px" }}>
                  Flash Sale Today Only!
                </h4>
                <p className="mb-0" style={{ fontSize: "13px", color: "#94a3b8" }}>
                  Don't miss our biggest sale of the season
                </p>
              </div>
            </div>
          </div>

          {/* Center: Discount % */}
          <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
            <div
              className="fw-bold"
              style={{ fontSize: "clamp(60px, 10vw, 90px)", color: "#ff6b00", lineHeight: 1 }}
            >
              30%
            </div>
            <div className="fw-semibold text-white" style={{ fontSize: "16px", opacity: 0.8 }}>
              OFF Everything
            </div>
          </div>

          {/* Right: Countdown + Button */}
          <div className="col-12 col-md-4 d-flex flex-column align-items-center align-items-md-end gap-3">
            {/* Timer */}
            <div className="d-flex align-items-center gap-2">
              {timeUnit(hours, "Hours")}
              <span className="fw-bold text-white" style={{ fontSize: "20px" }}>:</span>
              {timeUnit(minutes, "Min")}
              <span className="fw-bold text-white" style={{ fontSize: "20px" }}>:</span>
              {timeUnit(seconds, "Sec")}
            </div>

            {/* CTA Button */}
            <Link to="/Productpage" className="text-decoration-none">
              <button
                className="btn fw-bold text-white px-4 py-2 rounded-pill"
                style={{
                  background: "linear-gradient(135deg, #ff6b00, #e05e00)",
                  border: "none",
                  boxShadow: "0 6px 20px rgba(255,107,0,0.4)",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >
                <i className="bi bi-bag-fill me-2"></i>Grab the Deal
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}