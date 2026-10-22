import { Link } from "react-router-dom";
import { useContext, useRef } from "react";
import { Addtocart } from "./Usercontext";

export function Fcategory() {
  const { darkmode, Category = [] } = useContext(Addtocart);
  const sliderRef = useRef(null);

  // Dynamic unique main categories extraction
  const mainCategories = [
    ...new Set(Category.map((cat) => cat.Cetagory || cat.Category).filter(Boolean))
  ];

  // Map icon dynamically based on category title OR retrieve custom icon saved in document
  const getCategoryIcon = (catName) => {
    const matchDoc = Category.find(
      (c) => (c.Cetagory || c.Category) === catName && c.icon
    );

    if (matchDoc && matchDoc.icon) {
      return matchDoc.icon;
    }

    const title = (catName || "").trim().toLowerCase();
    const fallbackIcons = [
      "bi-laptop", "bi-phone", "bi-watch", "bi-lightning-charge", "bi-briefcase",
      "bi-display", "bi-headphones", "bi-camera", "bi-tv", "bi-controller"
    ];

    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % fallbackIcons.length;
    return fallbackIcons[index];
  };

  // Smooth Horizontal Scroll Logic
  const scroll = (scrollOffset) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  return (
    <div
      className="container py-4 py-md-5 px-2 px-md-3"
      style={{
        color: darkmode ? "#f8fafc" : "#0f172a"
      }}
    >
      {/* Section Header with Slider Navigation Controls */}
      <div className="d-flex align-items-center justify-content-between mb-3 mb-md-4">
        <div>
          <h4
            className="fw-bold mb-0 mb-md-1 fs-5 fs-md-3"
            style={{ 
              color: darkmode ? "#ffffff" : "#0f172a",
              letterSpacing: "-0.02em" 
            }}
          >
            Featured Categories
          </h4>
          <p className="text-muted small mb-0 d-none d-sm-block">Find exactly what you're looking for</p>
        </div>

        {/* Carousel Prev/Next Buttons */}
        {mainCategories.length > 4 && (
          <div className="d-flex gap-2">
            <button
              onClick={() => scroll(-250)}
              className="btn btn-sm rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center p-0"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: darkmode ? "#ce5d25" : "#ffffff",
                color: darkmode ? "#ffffff" : "#0f172a",
                transition: "all 0.2s ease"
              }}
              aria-label="Scroll Left"
            >
              <i className="bi bi-chevron-left fs-6"></i>
            </button>
            <button
              onClick={() => scroll(250)}
              className="btn btn-sm rounded-circle border-0 shadow-sm d-flex align-items-center justify-content-center p-0"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: darkmode ? "#ce5d25" : "#ffffff",
                color: darkmode ? "#ffffff" : "#0f172a",
                transition: "all 0.2s ease"
              }}
              aria-label="Scroll Right"
            >
              <i className="bi bi-chevron-right fs-6"></i>
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Horizontal Category Slider Container */}
      <div
        ref={sliderRef}
        className="d-flex gap-2 gap-md-3 overflow-auto pb-3 pt-1 pe-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {mainCategories.length > 0 ? (
          mainCategories.map((catName, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-center p-2 p-md-4 transition-all"
              style={{
                width: "calc(25% - 6px)",
                minWidth: "75px",
                maxWidth: "170px",
                borderRadius: "16px",
                cursor: "pointer",
                backgroundColor: darkmode
                  ? "rgba(9, 9, 10, 0.7)"
                  : "#ffffff",
                border: darkmode
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(226, 232, 240, 0.8)",
                boxShadow: darkmode
                  ? "0 10px 30px -10px rgba(0,0,0,0.5)"
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                backdropFilter: "blur(12px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "#ff6b00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.borderColor = darkmode
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(226, 232, 240, 0.8)";
              }}
            >
              {/* Category Icon Wrapper */}
              <div
                className="d-inline-flex align-items-center justify-content-center mb-1 mb-md-3 rounded-circle"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: darkmode
                    ? "rgba(255, 107, 0, 0.15)"
                    : "rgba(255, 107, 0, 0.08)",
                  color: "#ff6b00",
                  boxShadow: "0 0 8px rgba(255, 107, 0, 0.2)"
                }}
              >
                <i className={`bi ${getCategoryIcon(catName)} fs-6 fs-md-3`}></i>
              </div>

              {/* Category Title */}
              <div>
                <Link
                  to={`/category/${catName.toLowerCase().replace(/\s+/g, "-")}`}
                  style={{
                    textDecoration: "none",
                    color: darkmode ? "#e2e8f0" : "#1e293b"
                  }}
                  className="fw-bold d-block text-truncate"
                  title={catName}
                >
                  <span style={{ fontSize: "11px" }} className="d-md-none">{catName}</span>
                  <span style={{ fontSize: "0.95rem" }} className="d-none d-md-inline">{catName}</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="w-100 text-center py-4 text-muted">
            <small>No categories added yet.</small>
          </div>
        )}
      </div>
    </div>
  );
}