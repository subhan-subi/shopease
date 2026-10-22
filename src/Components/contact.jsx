import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Addtocart } from "./Usercontext";

// ── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ items, darkmode }) {
  const sub = darkmode ? "#a1a1aa" : "#64748b";
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb mb-0 d-flex flex-wrap align-items-center" style={{ fontSize: "13px", gap: "2px" }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumb-item${isLast ? " active" : ""}`}>
              {isLast ? (
                <span style={{ color: "#ff6b00", fontWeight: 600 }}>{item.label}</span>
              ) : (
                <>
                  <Link to={item.to} style={{ color: sub, textDecoration: "none" }}
                    onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                    onMouseLeave={e => (e.target.style.color = sub)}>
                    {item.label}
                  </Link>
                  <i className="bi bi-chevron-right" style={{ fontSize: "10px", color: darkmode ? "#3f3f46" : "#cbd5e1", margin: "0 5px" }} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Contact() {
  const { darkmode } = useContext(Addtocart);
  const [formsubmit, setformsubmit] = useState(false);
  const [error, seterror] = useState({});
  const newerror = {};
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const [formdata, setformdata] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleformdata(e) {
    setformdata({ ...formdata, [e.target.name]: e.target.value });
  }

  function handlesubmit(e) {
    e.preventDefault();
    if (formdata.name.trim() === "") {
      newerror.name = " Name is requaird!";
    }
    if (formdata.email.trim() === "") {
      newerror.email = " email is requaird!";
    }
    if (formdata.subject.trim() === "") {
      newerror.subject = " enter subject details!";
    }
    if (formdata.message.trim() === "") {
      newerror.message = "enter your assistance";
    }
    seterror(newerror);
    if (Object.keys(newerror).length === 0) {
      setformsubmit(true);
      setformdata({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      const Message = `
       Name: ${formdata.name}
       Name: ${formdata.email}
       Name: ${formdata.subject}
       Name: ${formdata.message}
      `;
      window.open(`http://wa.me/923196376355?text=${encodeURIComponent(Message)}`, "_blank");
    }

    setTimeout(() => {
      seterror({});
    }, 3000);
  }

  const theme = {
    textColor: darkmode ? "#F8FAFC" : "#0F172A",
    mutedText: darkmode ? "#94A3B8" : "#64748B",
    cardBg: darkmode ? "rgba(30, 41, 59, 0.7)" : "#FFFFFF",
    infoCardBg: darkmode ? "#0F172A" : "#070124",
    inputBg: darkmode ? "rgba(15, 23, 42, 0.6)" : "#F8FAFC",
    inputBorder: darkmode ? "rgba(255, 255, 255, 0.12)" : "#E2E8F0",
    shadow: darkmode ? "0 20px 25px -5px rgba(0, 0, 0, 0.5)" : "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
  };

  return (
    <div className="container py-5">
      <Breadcrumb
        darkmode={darkmode}
        items={[
          { label: "Home", to: "/" },
          { label: "Contact Us" },
        ]}
      />
      {/* Component Micro-Interaction Styles */}
      <style>{`
        .custom-input {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .custom-input:focus {
          transform: translateY(-2px);
          border-color: #FF6B00 !important;
          box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.18) !important;
          outline: none;
        }
        .custom-input::placeholder {
          transition: opacity 0.2s ease;
        }
        .custom-input:focus::placeholder {
          opacity: 0.4;
        }
        .btn-interactive {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .btn-interactive:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 0, 0.4) !important;
          background-color: #ff7b1a !important;
        }
        .btn-interactive:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 4px 10px rgba(255, 107, 0, 0.3) !important;
        }
        .info-card-item {
          transition: transform 0.25s ease, background-color 0.25s ease;
          border-radius: 12px;
          padding: 8px;
          margin: -8px;
        }
        .info-card-item:hover {
          transform: translateX(6px);
          background-color: rgba(255, 255, 255, 0.04);
        }
        .info-icon {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .info-card-item:hover .info-icon {
          transform: scale(1.12) rotate(-6deg);
        }
        .alert-slide-down {
          animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .error-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>

      {/* Header Section */}
      <div className="row justify-content-center text-center mb-5">
        <div className="col-lg-8">
          <span 
            className="text-uppercase tracking-wider fw-bold px-3 py-1 rounded-pill small d-inline-block mb-3" 
            style={{ color: "#FF6B00", backgroundColor: "rgba(255, 107, 0, 0.1)" }}
          >
            Get In Touch
          </span>
          <h1 className="fw-extrabold display-5 mb-3" style={{ color: theme.textColor }}>
            Contact <span style={{ color: "#FF6B00" }}>ShopEase.</span>
          </h1>
          <p className="lead fs-6" style={{ color: theme.mutedText }}>
            Have a question or need any assistance? We're here to help. Fill out the form below
            and our team will get back to you as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content Card Wrapper */}
      <div 
        className="row g-0 rounded-4 overflow-hidden border" 
        style={{ 
          backgroundColor: theme.cardBg, 
          borderColor: theme.inputBorder,
          boxShadow: theme.shadow,
          backdropFilter: "blur(12px)"
        }}
      >
        {/* Info Sidebar (Left) */}
        <div 
          className="col-lg-5 p-4 p-md-5 d-flex flex-column justify-content-between text-white position-relative" 
          style={{ backgroundColor: theme.infoCardBg }}
        >
          <div>
            <h3 className="fw-bold mb-2 text-white">Contact Information</h3>
            <p className="small mb-4 opacity-75">Fill out the form or reach out directly using the details below.</p>
            
            <div className="info-card-item d-flex align-items-center mb-4 gap-3">
              <div 
                className="info-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" 
                style={{ width: "48px", height: "48px", background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00" }}
              >
                <i className="bi bi-geo-alt-fill fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-0 text-white">Location</h6>
                <span className="small opacity-75">Multan, Punjab Pakistan</span>
              </div>
            </div>

            <div className="info-card-item d-flex align-items-center mb-4 gap-3">
              <div 
                className="info-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" 
                style={{ width: "48px", height: "48px", background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00" }}
              >
                <i className="bi bi-telephone-outbound-fill fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-0 text-white">Phone Number</h6>
                <span className="small opacity-75">+92 0300 1234567</span>
              </div>
            </div>

            <div className="info-card-item d-flex align-items-center mb-4 gap-3">
              <div 
                className="info-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" 
                style={{ width: "48px", height: "48px", background: "rgba(255, 107, 0, 0.15)", color: "#FF6B00" }}
              >
                <i className="bi bi-envelope-open-fill fs-5"></i>
              </div>
              <div>
                <h6 className="fw-semibold mb-0 text-white">Support Email</h6>
                <span className="small opacity-75">support@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Business Hours Card */}
          <div 
            className="p-3 rounded-3 border mt-4" 
            style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <h6 className="fw-semibold text-white mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-warning"></i> Business Hours
            </h6>
            <div className="d-flex justify-content-between small opacity-75 mb-1">
              <span>Monday - Saturday:</span>
              <span>9:00 AM - 9:00 PM</span>
            </div>
            <div className="d-flex justify-content-between small opacity-75">
              <span>Sunday:</span>
              <span className="text-warning">Closed</span>
            </div>
          </div>
        </div>

        {/* Form Container (Right) */}
        <div className="col-lg-7 p-4 p-md-5">
          <form onSubmit={handlesubmit} noValidate>
            <h3 className="fw-bold mb-4" style={{ color: theme.textColor }}>
              Send us a Message
            </h3>

            {formsubmit && (
              <div className="alert alert-success alert-slide-down d-flex align-items-center gap-2 border-0 shadow-sm rounded-3 mb-4" role="alert">
                <i className="bi bi-check-circle-fill fs-5"></i>
                <div>Your message has been sent successfully!</div>
              </div>
            )}

            <div className="row g-3">
              {/* Name Field */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold" style={{ color: theme.mutedText }}>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formdata.name} 
                  className={`form-control custom-input py-2 px-3 rounded-3 ${error.name ? "is-invalid error-shake" : ""}`} 
                  placeholder="John Doe" 
                  onChange={handleformdata} 
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textColor,
                    borderColor: error.name ? "#dc3545" : theme.inputBorder,
                  }} 
                />
                {error.name && <div className="invalid-feedback d-block mt-1">{error.name}</div>}
              </div>

              {/* Email Field */}
              <div className="col-md-6">
                <label className="form-label small fw-semibold" style={{ color: theme.mutedText }}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formdata.email} 
                  onChange={handleformdata} 
                  className={`form-control custom-input py-2 px-3 rounded-3 ${error.email ? "is-invalid error-shake" : ""}`} 
                  placeholder="name@example.com" 
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textColor,
                    borderColor: error.email ? "#dc3545" : theme.inputBorder,
                  }} 
                />
                {error.email && <div className="invalid-feedback d-block mt-1">{error.email}</div>}
              </div>

              {/* Subject Field */}
              <div className="col-12">
                <label className="form-label small fw-semibold" style={{ color: theme.mutedText }}>Subject</label>
                <input 
                  type="text" 
                  name="subject" 
                  value={formdata.subject} 
                  onChange={handleformdata} 
                  className={`form-control custom-input py-2 px-3 rounded-3 ${error.subject ? "is-invalid error-shake" : ""}`} 
                  placeholder="Order Inquiry / Support / Feedback" 
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textColor,
                    borderColor: error.subject ? "#dc3545" : theme.inputBorder,
                  }} 
                />
                {error.subject && <div className="invalid-feedback d-block mt-1">{error.subject}</div>}
              </div>

              {/* Message Field */}
              <div className="col-12">
                <label className="form-label small fw-semibold" style={{ color: theme.mutedText }}>Message</label>
                <textarea 
                  name="message" 
                  rows="4"
                  className={`form-control custom-input py-2 px-3 rounded-3 ${error.message ? "is-invalid error-shake" : ""}`}
                  placeholder="Type your message here..." 
                  value={formdata.message} 
                  onChange={handleformdata} 
                  style={{
                    backgroundColor: theme.inputBg,
                    color: theme.textColor,
                    borderColor: error.message ? "#dc3545" : theme.inputBorder,
                  }} 
                ></textarea>
                {error.message && <div className="invalid-feedback d-block mt-1">{error.message}</div>}
              </div>

              {/* Submit Button */}
              <div className="col-12 mt-4">
                <button 
                  type="submit" 
                  className="btn btn-interactive text-white fw-bold w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2" 
                  style={{ 
                    backgroundColor: "#FF6B00", 
                    fontSize: "1rem", 
                    border: "none",
                    boxShadow: "0 4px 12px rgba(255, 107, 0, 0.3)"
                  }}
                >
                  <i className="bi bi-send-fill"></i> Send Message
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}