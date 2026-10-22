import { useState } from "react";
import { toast } from "react-toastify";

export function Save() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/\S+@\S+\.\S+/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    setEmail("");
    toast.success("You're subscribed! 🎉 Expect exclusive deals in your inbox.");
  };

  return (
    <div
      className="container-fluid py-5 position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ff6b00 0%, #e05e00 60%, #c84b00 100%)",
        boxShadow: "0 -1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {/* Decorative shapes */}
      <div style={{
        position: "absolute", top: "-60px", right: "-60px",
        width: "220px", height: "220px",
        background: "rgba(255,255,255,0.06)", borderRadius: "50%",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "10%",
        width: "280px", height: "280px",
        background: "rgba(0,0,0,0.06)", borderRadius: "50%",
        pointerEvents: "none",
      }} />

      <div className="container position-relative" style={{ zIndex: 1 }}>
        <div className="row align-items-center g-4">
          {/* Left: Text */}
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-envelope-heart-fill text-white" style={{ fontSize: "22px" }}></i>
              <span
                className="fw-bold text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "2px", color: "rgba(255,255,255,0.8)" }}
              >
                Newsletter
              </span>
            </div>
            <h3
              className="fw-bold text-white mb-2"
              style={{ fontSize: "clamp(1.4rem, 3vw, 1.8rem)", letterSpacing: "-0.5px" }}
            >
              Subscribe &amp; Save{" "}
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "0 10px",
                  display: "inline-block",
                }}
              >
                10%
              </span>
            </h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: 0 }}>
              Exclusive deals, promo codes, and new arrivals — straight to your inbox.
              No spam, ever.
            </p>
          </div>

          {/* Right: Input */}
          <div className="col-12 col-md-6">
            {subscribed ? (
              <div
                className="d-flex align-items-center gap-3 p-3 rounded-4"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{ width: "44px", height: "44px", background: "rgba(255,255,255,0.2)" }}
                >
                  <i className="bi bi-check-circle-fill text-white" style={{ fontSize: "22px" }}></i>
                </div>
                <div>
                  <div className="fw-bold text-white" style={{ fontSize: "15px" }}>You're subscribed!</div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                    Check your inbox for a special welcome offer 🎁
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe}>
                <div className="input-group shadow-sm" style={{ borderRadius: "50px", overflow: "hidden" }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="form-control border-0 py-3 px-4"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      color: "#ffffff",
                      fontSize: "14px",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <button
                    type="submit"
                    className="btn fw-bold px-4"
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <i className="bi bi-send-fill me-2"></i>
                    Subscribe
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginTop: "8px", paddingLeft: "4px" }}>
                  <i className="bi bi-shield-check me-1"></i>
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}