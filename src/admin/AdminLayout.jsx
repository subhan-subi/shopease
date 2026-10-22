import { useState, useEffect, useContext } from "react";
import { AdmintopBar } from "./AdminHeader";
import { AdminsideBar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { Addtocart } from "../Components/Usercontext";
import "./admin.css";

export function AdminLayout({ children }) {
  const { darkmode } = useContext(Addtocart);

  // Mobile screens par default closed rakhte hain
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Screen size change/resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobileStatus = window.innerWidth <= 768;
      setIsMobile(mobileStatus);
      if (mobileStatus) {
        setIsSidebarOpen(false); // Mobile par auto close
      } else {
        setIsSidebarOpen(true);  // Desktop par default open
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`admin-root d-flex flex-nowrap min-vh-100 overflow-x-hidden position-relative${darkmode ? " dark-admin" : ""}`}
      style={{ background: "var(--admin-bg)" }}
    >
      {/* Mobile Dark Overlay when Sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040, background: "rgba(11,19,43,0.55)", backdropFilter: "blur(2px)" }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className="admin-sidebar"
        style={{
          zIndex: 1050,
          height: isMobile ? "100vh" : "",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          flexShrink: 0,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
          width: isMobile
            ? isSidebarOpen ? "260px" : "0px"
            : isSidebarOpen ? "242px" : "68px",
          overflow: isMobile && !isSidebarOpen ? "hidden" : "visible",
          visibility: isMobile && !isSidebarOpen ? "hidden" : "visible",
        }}
      >
        <AdminsideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </aside>

      {/* Main Content Area */}
      <main
        className="flex-grow-1 d-flex flex-column min-vh-100"
        style={{
          minWidth: 0,
          transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
          background: "var(--admin-bg)",
          color: "var(--admin-text)",
        }}
      >
        <AdmintopBar toggleSidebar={toggleSidebar} />

        <div className="flex-grow-1 p-3 p-md-4" style={{ maxWidth: "100%" }}>
          {children}
          <Outlet />
        </div>
      </main>
    </div>
  );
}