import { useEffect, useState } from "react";
import { Productpage } from "./Productpage";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useContext } from "react";
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
                <span style={{ color: "#ff6b00", fontWeight: 600 }}>
                  {item.label}
                </span>
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

// ── deslugify: turns "smart-phones" → "Smart Phones" for display ──────────────
function deslugify(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function slugify(text) {
  return text?.toLowerCase().replace(/\s+/g, "-") || "";
}

export function Productfilter() {
  const { products, addtocart, searchword, setword, searchfilter, darkmode } =
    useContext(Addtocart);
  const { cetegory, subcategory, frsubcategory } = useParams();
  const [searchp] = useSearchParams();
  const search = searchp.get("search") || "";

  // ── Filter products based on URL params ───────────────────────────────────
  const filterproducts = products.filter((item) => {
    if (frsubcategory) return slugify(item.frsubCategory) === frsubcategory;
    if (subcategory)   return slugify(item.subCetagory)  === subcategory;
    if (cetegory)      return slugify(item.Cetagory)      === cetegory;
    return false;
  });

  // ── Build breadcrumb items ─────────────────────────────────────────────────
  const crumbs = [{ label: "Home", to: "/" }];

  if (cetegory) {
    crumbs.push({
      label: deslugify(cetegory),
      to: frsubcategory || subcategory ? `/category/${cetegory}` : undefined,
    });
  }
  if (subcategory) {
    crumbs.push({
      label: deslugify(subcategory),
      to: frsubcategory ? `/category/${cetegory}/${subcategory}` : undefined,
    });
  }
  if (frsubcategory) {
    crumbs.push({ label: deslugify(frsubcategory) });
  }

  // Last item should not have a `to` (it's the current page)
  if (crumbs[crumbs.length - 1].to !== undefined && !frsubcategory) {
    delete crumbs[crumbs.length - 1].to; // make the last item non-linkable
  }

  const textColor = darkmode ? "#f4f4f5" : "#0f172a";
  const subText   = darkmode ? "#a1a1aa" : "#64748b";
  const inputBg   = darkmode ? "rgba(255,255,255,0.06)" : "#ffffff";
  const inputBdr  = darkmode ? "1px solid #27272a" : "1px solid #e2e8f0";

  // Current level label for the page heading
  const currentLabel = deslugify(frsubcategory || subcategory || cetegory || "Products");
  const productCount = filterproducts.filter(
    (i) => i.status === "active" || !i.status || i.status === ""
  ).length;

  return (
    <div className="container py-3 py-md-4">

      {/* ── Breadcrumb ── */}
      <Breadcrumb items={crumbs} darkmode={darkmode} />

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
            <i className="bi bi-grid-3x3-gap-fill" style={{ color: "#ff6b00", fontSize: "18px" }} />
          </div>
          <div>
            <h1
              className="fw-bold mb-0"
              style={{ fontSize: "clamp(1rem, 3vw, 1.4rem)", color: textColor, letterSpacing: "-0.3px" }}
            >
              {currentLabel}
            </h1>
            <span style={{ fontSize: "12px", color: subText }}>
              {productCount} {productCount === 1 ? "product" : "products"} found
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
            onChange={(e) => setword(e.target.value)}
            placeholder="Search in this category..."
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
      <div className="row">
        {filterproducts.length <= 0 ? (
          <div className="col-12 text-center py-5">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: "72px", height: "72px", background: "rgba(255,107,0,0.1)" }}
            >
              <i className="bi bi-search fs-2" style={{ color: "#ff6b00" }} />
            </div>
            <h5 className="fw-bold mb-2" style={{ color: textColor }}>No Products Found</h5>
            <p style={{ color: subText, fontSize: "14px" }}>
              No products available in <strong style={{ color: "#ff6b00" }}>{currentLabel}</strong> yet.
            </p>
            <Link
              to="/"
              className="btn rounded-pill fw-semibold px-4 py-2 text-white text-decoration-none mt-2"
              style={{ background: "#ff6b00", border: "none" }}
            >
              <i className="bi bi-arrow-left me-2" /> Back to Home
            </Link>
          </div>
        ) : (
          <Productpage customproducts={filterproducts} />
        )}
      </div>
    </div>
  );
}
