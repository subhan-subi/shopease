import { useState, useEffect, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Addtocart } from "./Usercontext";
import { getCategories } from "../services/categoryService";

export function Sidebar() {
  const {
    side,
    setside,
    darkmode,
    searchword,
    Category = [],
    setCategory,
    changeclr
  } = useContext(Addtocart);
  const [openMainCategory, setOpenMainCategory] = useState(null);
  const [openSubCategory, setOpenSubCategory] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategory(data || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, [setCategory]);

  // Dynamic unique main categories extraction
  const mainCategories = [
    ...new Set(
      Category.map((item) => item.Cetagory || item.Category).filter(
        (m) => m && m.trim() !== ""
      )
    )
  ];

  // Helper: Get icon based on category name
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

  function toggleMainCategory(mainCatName) {
    setOpenMainCategory(openMainCategory === mainCatName ? "" : mainCatName);
    setOpenSubCategory("");
  }

  function toggleSubCategory(subCatName, e) {
    e.stopPropagation();
    setOpenSubCategory(openSubCategory === subCatName ? "" : subCatName);
  }

  function getnavstyle({ isActive }) {
    return {
      background: isActive ? "rgba(255, 107, 42, 0.12)" : "transparent",
      color: isActive ? "#ff6b00" : darkmode ? "#ffffff" : "#475569",
      fontWeight: isActive ? "600" : "500",
      borderRadius: "8px",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      fontSize: "13px",
      padding: "8px 12px",
      transition: "all 0.2s ease",
      borderLeft: isActive ? "3px solid #ff6b00" : "3px solid transparent"
    };
  }

  return (
    <aside className="d-flex flex-column w-100 h-100 transition-all">
      {/* Sidebar Header & Toggle Button */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary-subtle">
        {side && (
          <Link
            to="/"
            className="d-flex align-items-center gap-2 text-decoration-none fw-bold fs-5"
            style={{ color: darkmode ? "#ffffff" : "#0f172a" }}
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white"
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#ff6b00"
              }}
            >
              <i className="bi bi-cart-fill fs-6"></i>
            </div>
            <span>ShopEase</span>
          </Link>
        )}

        <button
          onClick={() => setside(!side)}
          className="btn btn-sm border-0 ms-auto text-warning fs-5 p-1 d-flex align-items-center justify-content-center"
          aria-label="Toggle Sidebar"
          style={{ background: "transparent" }}
        >
          <i
            className={`bi bi-arrow-${side ? "left" : "right"}-square-fill`}
            style={{ color: "#ff6b00" }}
          ></i>
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="mb-4 d-sm-block d-md-none">
        <div className="d-flex flex-column d-sm-block d-md-none gap-1">
          <NavLink
            to="/"
            className="nav-link"
            style={({ isActive }) => getnavstyle({ isActive })}
          >
            <i className="bi bi-house-door fs-5 me-3" style={{ color: "#ff6b00" }}></i>
            {side && <span>Home</span>}
          </NavLink>

          <NavLink
            to="/Productpage"
            className="nav-link"
            style={({ isActive }) => getnavstyle({ isActive })}
          >
            <i className="bi bi-shop fs-5 me-3" style={{ color: "#ff6b00" }}></i>
            {side && <span>Shop All</span>}
          </NavLink>

          <NavLink
            to="/Contact"
            className="nav-link"
            style={({ isActive }) => getnavstyle({ isActive })}
          >
            <i className="bi bi-person fs-5 me-3" style={{ color: "#ff6b00" }}></i>
            {side && <span>Contact</span>}
          </NavLink>

          {side && (
            <Link
              to="/Wishlist"
              className="nav-link"
              style={getnavstyle({ isActive: false })}
            >
              <i className="bi bi-heart fs-5 me-3" style={{ color: "#ff6b00" }}></i>
              <span>Wishlist</span>
            </Link>
          )}
        </div>
      </div>

      {/* Category Section Header */}
      {side && (
        <div className="px-2 mb-2">
          <p
            className={`text-uppercase fw-bold font-monospace mb-1 ${darkmode ? "text-light" : "text-muted"
              }`}
            style={{ fontSize: "11px", letterSpacing: "1px" }}
          >
            Categories
          </p>
        </div>
      )}

      {/* Categories Tree */}
      <div className="flex-grow-1 overflow-auto pe-1 custom-scrollbar">
        {mainCategories.map((mainCat, i) => {
          const isMainOpen = openMainCategory === mainCat;
          const currentMainItems = Category.filter(
            (item) => (item.Cetagory || item.Category) === mainCat
          );

          const subcategories = [
            ...new Set(
              currentMainItems
                .map((cat) => cat.subCetagory || cat.subCategory)
                .filter((sub) => sub && sub.trim() !== "")
            )
          ];

          return (
            <div key={i} className="mb-1">
              {/* Main Category Row */}
              <div
                onClick={() => side && toggleMainCategory(mainCat)}
                className="d-flex align-items-center justify-content-between rounded-3 transition-all "
                style={{
                  cursor: side ? "pointer" : "default",
                  backgroundColor:
                    isMainOpen && side
                      ? darkmode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0,0,0,0.03)"
                      : "transparent"
                }}
                title={!side ? mainCat : ""}
              >
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                  <i
                    className={`bi ${getCategoryIcon(mainCat)} fs-5`}
                    style={{ color: "#ff6b00", minWidth: "20px" }}
                  ></i>
                  {side && (
                    <span
                      className="fw-semibold text-truncate small"
                      style={{ color: darkmode ? "#ffffff" : "#334155" }}
                    >
                      {mainCat}
                    </span>
                  )}
                </div>

                {side && subcategories.length > 0 && (
                  <i
                    className={`bi bi-chevron-${isMainOpen ? "up" : "down"
                      } ${darkmode ? "text-light" : "text-muted"} small`}
                    style={{ fontSize: "11px" }}
                  ></i>
                )}
              </div>

              {/* Sub Categories Accordion Level 1 */}
              {side && isMainOpen && (
                <div className="ms-3 ps-2 border-start border-secondary-subtle my-1">
                  <NavLink
                    className="d-block text-decoration-none py-1 px-2 mb-1 rounded small fw-medium"
                    style={({ isActive }) => ({
                      color: isActive ? "#ffffff" : darkmode ? "#ff8c38" : "#ff6b00",
                      fontSize: "12px",
                      backgroundColor: isActive
                        ? "#ff6b00"
                        : darkmode
                          ? "rgba(255, 107, 42, 0.15)"
                          : "#fff7ed"
                    })}
                    to={`/category/${encodeURIComponent(
                      mainCat.toLowerCase().replace(/\s+/g, "-")
                    )}`}
                  >
                    All {mainCat}
                  </NavLink>

                  {subcategories.map((subcat, subIdx) => {
                    const furtherSubcategories = [
                      ...new Set(
                        currentMainItems
                          .filter(
                            (item) =>
                              (item.subCetagory || item.subCategory) === subcat
                          )
                          .map((item) => item.frsubCategory || item.frsubID)
                          .filter((fr) => fr && fr.trim() !== "")
                      )
                    ];

                    const isSubOpen = openSubCategory === subcat;

                    return (
                      <div key={subIdx} className="my-1">
                        <div className="d-flex align-items-center justify-content-between py-1 px-2 rounded hover-bg">
                          {/* Clickable Sub-Category NavLink */}
                          <NavLink
                            to={`/category/${encodeURIComponent(
                              mainCat.toLowerCase().replace(/\s+/g, "-")
                            )}/${encodeURIComponent(
                              subcat.toLowerCase().replace(/\s+/g, "-")
                            )}`}
                            className="text-decoration-none text-truncate flex-grow-1"
                            style={({ isActive }) => ({
                              fontSize: "12px",
                              color: isActive
                                ? "#ff6b00"
                                : darkmode
                                  ? "#e2e8f0"
                                  : "#64748b",
                              fontWeight: isActive ? "600" : "400"
                            })}
                          >
                            <span className="text-warning me-1">•</span> {subcat}
                          </NavLink>

                          {/* Toggle Icon for Next Level */}
                          {furtherSubcategories.length > 0 && (
                            <i
                              onClick={(e) => toggleSubCategory(subcat, e)}
                              className={`bi bi-chevron-${isSubOpen ? "up" : "down"
                                } ${darkmode ? "text-light" : "text-muted"} p-1`}
                              style={{ fontSize: "10px", cursor: "pointer" }}
                            ></i>
                          )}
                        </div>

                        {/* Further Sub-Categories Level 2 */}
                        {isSubOpen && furtherSubcategories.length > 0 && (
                          <div className="ms-3 ps-2 border-start border-2 border-warning-subtle my-1">
                            {furtherSubcategories.map((fSub, fIdx) => (
                              <NavLink
                                key={fIdx}
                                className="d-block py-1 text-decoration-none"
                                style={({ isActive }) => ({
                                  fontSize: "11px",
                                  color: isActive
                                    ? "#ff6b00"
                                    : darkmode
                                      ? "#cbd5e1"
                                      : "#64748b",
                                  fontWeight: isActive ? "600" : "normal"
                                })}
                                to={`/category/${encodeURIComponent(
                                  mainCat.toLowerCase().replace(/\s+/g, "-")
                                )}/${encodeURIComponent(
                                  subcat.toLowerCase().replace(/\s+/g, "-")
                                )}/${encodeURIComponent(
                                  fSub.toLowerCase().replace(/\s+/g, "-")
                                )}`}
                              >
                                {fSub}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dark / Light Theme Toggle Control */}
      <div className="pt-3 border-top border-secondary-subtle mt-auto">
        {side ? (
          <div
            onClick={changeclr}
            className="d-flex align-items-center justify-content-between p-2 rounded-3 cursor-pointer"
            style={{
              backgroundColor: darkmode ? "#1e293b" : "#f1f5f9",
              color: darkmode ? "#ffffff" : "#0f172a",
              cursor: "pointer"
            }}
          >
            <span className="small fw-semibold">
              {darkmode ? "Light Theme" : "Dark Theme"}
            </span>
            <i
              className={`bi bi-toggle-${darkmode ? "on text-warning" : "off text-secondary"} fs-4`}
            ></i>
          </div>
        ) : (
          <div
            onClick={changeclr}
            className="text-center cursor-pointer"
            style={{ cursor: "pointer" }}
            title="Toggle Theme"
          >
            <i
              className={`bi bi-toggle-${darkmode ? "on text-warning" : "off text-secondary"} fs-4`}
            ></i>
          </div>
        )}
      </div>
    </aside>
  );
}