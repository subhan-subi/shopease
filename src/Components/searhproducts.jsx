import { useContext } from "react";
import { Link } from "react-router-dom";
import { Productpage } from "./Productpage";
import { Addtocart } from "./Usercontext";

// ── Breadcrumb ────────────────────────────────────────────────────────────────
function Breadcrumb({ items, darkmode }) {
  const sub = darkmode ? "#a1a1aa" : "#64748b";
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol
        className="breadcrumb mb-0 d-flex flex-wrap align-items-center"
        style={{ fontSize: "13px", gap: "2px" }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumb-item${isLast ? " active" : ""}`}>
              {isLast ? (
                <span style={{ color: "#ff6b00", fontWeight: 600 }}>{item.label}</span>
              ) : (
                <>
                  <Link
                    to={item.to}
                    style={{ color: sub, textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                    onMouseLeave={e => (e.target.style.color = sub)}
                  >
                    {item.label}
                  </Link>
                  <i
                    className="bi bi-chevron-right"
                    style={{ fontSize: "10px", color: darkmode ? "#3f3f46" : "#cbd5e1", margin: "0 5px" }}
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Searchproduc() {
  const { searchword, setword, searchfilter, darkmode } = useContext(Addtocart);

  const textColor = darkmode ? "#f4f4f5" : "#0f172a";
  const subText   = darkmode ? "#a1a1aa" : "#64748b";
  const inputBg   = darkmode ? "rgba(255,255,255,0.06)" : "#ffffff";
  const inputBdr  = darkmode ? "1px solid #27272a" : "1px solid #e2e8f0";

  // Label for the breadcrumb: if there's an active search, show it
  const pageLabel = searchword.trim()
    ? `Results for "${searchword.trim()}"`
    : "All Products";

  return (
    <div className="container py-3 py-md-4">

      {/* ── Breadcrumb ── */}
      <Breadcrumb
        darkmode={darkmode}
        items={[
          { label: "Home", to: "/" },
          { label: pageLabel },
        ]}
      />

      {/* ── Page Header Bar ── */}
      <div
        className="rounded-4 px-4 py-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{
          background: darkmode
            ? "linear-gradient(135deg, #18181b, #111111)"
            : "linear-gradient(135deg, #ffffff, #f8fafc)",
          border: darkmode ? "1px solid #27272a" : "1px solid #e2e8f0",
          boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
        }}
      >
        {/* Left: Title + count */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: "40px", height: "40px", background: "rgba(255,107,0,0.12)" }}
          >
            <i
              className={`bi bi-${searchword.trim() ? "search" : "grid-3x3-gap-fill"}`}
              style={{ color: "#ff6b00", fontSize: "18px" }}
            />
          </div>
          <div>
            <h1
              className="fw-bold mb-0"
              style={{ fontSize: "clamp(1rem, 3vw, 1.4rem)", color: textColor, letterSpacing: "-0.3px" }}
            >
              {searchword.trim() ? `Results for "${searchword.trim()}"` : "All Products"}
            </h1>
            <span style={{ fontSize: "12px", color: subText }}>
              {searchword.trim()
                ? `${searchfilter.length} result${searchfilter.length !== 1 ? "s" : ""} found`
                : "Browse our full collection"}
            </span>
          </div>
        </div>

        {/* Right: Search input */}
        <div className="position-relative" style={{ minWidth: "220px", flex: "0 1 320px" }}>
          <i
            className="bi bi-search position-absolute"
            style={{ left: "12px", top: "50%", transform: "translateY(-50%)", color: "#ff6b00", fontSize: "14px", pointerEvents: "none" }}
          />
          <input
            type="search"
            value={searchword}
            onChange={e => setword(e.target.value)}
            placeholder="Search products..."
            className="w-100 rounded-pill"
            style={{
              background: inputBg,
              border: inputBdr,
              color: textColor,
              padding: "9px 16px 9px 36px",
              fontSize: "13px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => (e.target.style.borderColor = "#ff6b00")}
            onBlur={e => (e.target.style.borderColor = darkmode ? "#27272a" : "#e2e8f0")}
          />
        </div>
      </div>

      {/* ── Product Grid ── */}
      {searchword.trim() && searchfilter.length === 0 ? (
        <div className="text-center py-5">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "72px", height: "72px", background: "rgba(255,107,0,0.1)" }}
          >
            <i className="bi bi-search fs-2" style={{ color: "#ff6b00" }} />
          </div>
          <h5 className="fw-bold mb-2" style={{ color: textColor }}>No Products Found</h5>
          <p style={{ color: subText, fontSize: "14px" }}>
            No results for <strong style={{ color: "#ff6b00" }}>"{searchword}"</strong>. Try a different keyword.
          </p>
        </div>
      ) : (
        <Productpage />
      )}
    </div>
  );
}