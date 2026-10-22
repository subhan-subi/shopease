import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout, onAuthStateChanged, auth } from "../services/authService";
import {
  getAdminNotifications,
  markNotificationRead
} from "../services/notificationService";

export function AdmintopBar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [imgError, setImgError] = useState(false);
  const [adminData, setAdminData] = useState({
    fullName: "",
    email: "",
    role: "",
    image: "", // Added image field
  });

  useEffect(() => {
    async function load() {
      const data = await getAdminNotifications();

      const sorted = data.sort((a, b) => {
        if (a.read === b.read) return 0;
        return a.read ? 1 : -1;
      });

      setNotifications(sorted);
    }
    load();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setAdminData(user);
        setImgError(false); // Reset error state on data load
      }
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/Login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header
      className="admin-header d-flex align-items-center justify-content-between px-3 px-md-4"
      style={{ zIndex: 1020 }}
    >
      {/* Left: Toggle + Search */}
      <div className="d-flex align-items-center gap-3">
        {/* Mobile Toggle */}
        <button
          onClick={toggleSidebar}
          className="admin-icon-btn btn d-lg-none"
          title="Toggle Sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        {/* Page Title */}
        <span className="fw-700 text-dark d-none d-md-block" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.2px", color: "var(--admin-text)" }}>
          ShopEase <span style={{ color: "var(--admin-muted)", fontWeight: 400 }}>Admin</span>
        </span>

        {/* Search */}
        <div className="admin-search-box d-none d-sm-flex">
          <i className="bi bi-search text-muted" style={{ fontSize: "0.8rem", flexShrink: 0 }}></i>
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="d-flex align-items-center gap-2">

        {/* Notifications */}
        <div className="dropdown">
          <button
            type="button"
            className="admin-icon-btn btn"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            title="Notifications"
          >
            <i className="bi bi-bell fs-5"></i>
            {unreadCount > 0 && (
              <span className="admin-notif-badge">{unreadCount}</span>
            )}
          </button>

          <ul className="dropdown-menu dropdown-menu-end admin-notif-dropdown p-0">
            {/* Header */}
            <div
              style={{
                padding: "14px 18px",
                background: "var(--admin-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="admin-badge admin-badge-accent" style={{ fontSize: "0.65rem" }}>
                  {unreadCount} New
                </span>
              )}
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <li key={item.id}>
                    <div
                      className={`admin-notif-item ${!item.read ? "unread" : ""}`}
                      onClick={async () => {
                        if (!item.read) {
                          await markNotificationRead(item.id);
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === item.id ? { ...n, read: true } : n
                            )
                          );
                        }
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div className="d-flex align-items-start gap-2 flex-grow-1">
                          <div
                            style={{
                              width: "34px", height: "34px", borderRadius: "8px",
                              background: !item.read ? "var(--admin-accent-soft)" : "var(--admin-bg)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0, border: "1px solid var(--admin-border)",
                            }}
                          >
                            <i className="bi bi-bell-fill" style={{ fontSize: "0.8rem", color: !item.read ? "var(--admin-accent)" : "var(--admin-muted)" }}></i>
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: item.read ? 500 : 700,
                                fontSize: "0.825rem",
                                color: item.read ? "var(--admin-muted)" : "var(--admin-text)",
                                marginBottom: "2px",
                              }}
                            >
                              {item.title}
                            </div>
                            <p style={{ fontSize: "0.775rem", color: "var(--admin-muted)", margin: 0, lineHeight: 1.4 }}>
                              {item.message}
                            </p>
                          </div>
                        </div>
                        {!item.read && (
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--admin-accent)", flexShrink: 0, marginTop: "5px" }}></div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <div className="admin-empty-state py-5">
                    <div className="admin-empty-icon">
                      <i className="bi bi-bell-slash"></i>
                    </div>
                    <p className="admin-empty-title" style={{ fontSize: "0.875rem" }}>All caught up!</p>
                    <p className="admin-empty-desc" style={{ fontSize: "0.775rem" }}>No new notifications</p>
                  </div>
                </li>
              )}
            </div>
          </ul>
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "22px", background: "var(--admin-border)" }} className="d-none d-sm-block"></div>

        {/* Profile Dropdown */}
        <div className="dropdown">
          <button
            className="btn p-1 border-0 d-flex align-items-center gap-2 rounded-pill"
            data-bs-toggle="dropdown"
            style={{ background: "transparent" }}
          >
            {/* Conditional Render: Avatar Image or Initials */}
            {adminData.image && !imgError ? (
              <img
                src={adminData.image}
                alt={adminData.fullName || "User"}
                className="admin-avatar"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="admin-avatar-initials">
                {adminData.fullName
                  ? adminData.fullName.substring(0, 2).toUpperCase()
                  : "AU"}
              </div>
            )}

            <div className="d-none d-lg-block text-start lh-sm">
              <span className="fw-600 d-block text-dark" style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.3 }}>
                {adminData.fullName || "Admin User"}
              </span>
              <small style={{ fontSize: "0.7rem", color: "var(--admin-muted)", textTransform: "capitalize" }}>
                {adminData.role === "admin" ? "Super Admin" : adminData.role || "Administrator"}
              </small>
            </div>

            <i className="bi bi-chevron-down d-none d-lg-block" style={{ fontSize: "0.7rem", color: "var(--admin-muted)" }}></i>
          </button>

          <ul className="dropdown-menu dropdown-menu-end admin-dropdown-menu">
            <li>
              <button
                className="admin-dropdown-item dropdown-item"
                onClick={() => navigate("/AdminProfile")}
              >
                <i className="bi bi-person-circle" style={{ color: "var(--admin-accent)" }}></i>
                My Profile
              </button>
            </li>
            <li><hr className="dropdown-divider my-1" style={{ borderColor: "var(--admin-border)" }} /></li>
            <li>
              <button
                className="admin-dropdown-item dropdown-item danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}