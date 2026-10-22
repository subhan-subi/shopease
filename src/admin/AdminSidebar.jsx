import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "../services/authService";

// ── nav items configuration ───────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { to: "/Dashboard",   icon: "grid-1x2-fill",    label: "Dashboard"      },
    ],
  },
  {
    label: "Catalog",
    items: [
      { to: "/AddProducts",    icon: "box-seam-fill",      label: "Products"       },
      { to: "/AddCotegories",  icon: "tags-fill",           label: "Categories"     },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/Adminorders",    icon: "bag-check-fill",      label: "Orders"         },
      { to: "/Adminreviews",   icon: "star-fill",           label: "Reviews"        },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/AdminProfile",       icon: "person-circle",       label: "Profile"        },
      { to: "/AdminEmailSettings", icon: "envelope-at-fill",    label: "Email Settings" },
    ],
  },
];

// ── single nav link ───────────────────────────────────────────────────────────
function SideNavLink({ item, isOpen }) {
  return (
    <NavLink
      to={item.to}
      title={!isOpen ? item.label : undefined}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: isOpen ? "flex-start" : "center",
        gap: "10px",
        padding: isOpen ? "9px 14px" : "10px 0",
        margin: "1px 8px",
        width: isOpen ? "calc(100% - 16px)" : "auto",
        borderRadius: "8px",
        textDecoration: "none",
        fontSize: "0.855rem",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "#FF6B00" : "rgba(255,255,255,0.58)",
        background: isActive ? "rgba(255,107,0,0.14)" : "transparent",
        borderLeft: isActive ? "3px solid #FF6B00" : "3px solid transparent",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        position: "relative",
      })}
      className="admin-sidebar-navlink"
    >
      {({ isActive }) => (
        <>
          {/* Active glow dot */}
          {isActive && (
            <span style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#FF6B00",
              boxShadow: "0 0 6px #FF6B00",
              flexShrink: 0,
              display: isOpen ? "block" : "none",
            }} />
          )}
          <i
            className={`bi bi-${item.icon}`}
            style={{
              fontSize: "1rem",
              flexShrink: 0,
              width: isOpen ? "20px" : "auto",
              textAlign: "center",
              filter: isActive ? "drop-shadow(0 0 4px rgba(255,107,0,0.5))" : "none",
              transition: "filter 0.2s",
            }}
          />
          {isOpen && (
            <span style={{ lineHeight: 1.3 }}>{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ── main sidebar ──────────────────────────────────────────────────────────────
export function AdminsideBar({ isOpen, toggleSidebar }) {
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("admin");

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      if (user) {
        setAdminName(user.fullName || user.email?.split("@")[0] || "Admin");
        setAdminEmail(user.email || "");
        setAdminRole(user.role || "admin");
      }
    });
    return () => unsub();
  }, []);

  const avatar = (adminName || adminEmail || "A").charAt(0).toUpperCase();

  return (
    <>
      {/* Inline hover styles injected once */}
      <style>{`
        .admin-sidebar-navlink:hover {
          background: rgba(255,255,255,0.07) !important;
          color: rgba(255,255,255,0.9) !important;
          border-left-color: rgba(255,107,0,0.4) !important;
        }
      `}</style>

      <div
        className="d-flex flex-column h-100"
        style={{ overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none" }}
      >
        {/* ── Logo & Toggle ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isOpen ? "space-between" : "center",
            padding: isOpen ? "20px 16px 16px" : "20px 8px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
            minHeight: "66px",
          }}
        >
          {isOpen && (
            <div className="d-flex align-items-center gap-2" style={{ overflow: "hidden" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #FF6B00, #ff8c00)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(255,107,0,0.35)",
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-basket-fill text-white" style={{ fontSize: "1rem" }} />
              </div>
              <div style={{ lineHeight: 1.2, overflow: "hidden" }}>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.3px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Shop<span style={{ color: "#FF6B00" }}>Ease</span>
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  Admin Panel
                </span>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="btn btn-sm d-flex align-items-center justify-content-center"
            title="Toggle Sidebar"
            style={{
              width: "32px",
              height: "32px",
              padding: 0,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.7)",
              borderRadius: "8px",
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          >
            <i className={`bi ${isOpen ? "bi-chevron-left" : "bi-list"} fs-5`} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <div className="flex-grow-1 py-2" style={{ overflowY: "auto", scrollbarWidth: "none" }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-1">
              {/* Section label */}
              {isOpen && (
                <span
                  style={{
                    display: "block",
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.25)",
                    padding: "16px 22px 5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {section.label}
                </span>
              )}
              {!isOpen && <div style={{ height: "12px" }} />}

              {section.items.map((item) => (
                <SideNavLink key={item.to} item={item} isOpen={isOpen} />
              ))}
            </div>
          ))}
        </div>

        {/* ── Bottom: Admin User Info ── */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            padding: isOpen ? "14px 14px" : "12px 8px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              justifyContent: isOpen ? "flex-start" : "center",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B00, #e05e00)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.875rem",
                flexShrink: 0,
                border: "2px solid rgba(255,107,0,0.4)",
                boxShadow: "0 2px 8px rgba(255,107,0,0.3)",
              }}
            >
              {avatar}
            </div>

            {isOpen && (
              <div style={{ overflow: "hidden", flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {adminName || "Admin"}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {adminRole === "admin" ? "Super Admin" : adminRole}
                </span>
              </div>
            )}

            {isOpen && (
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  flexShrink: 0,
                  boxShadow: "0 0 6px rgba(34,197,94,0.7)",
                }}
                title="Online"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}