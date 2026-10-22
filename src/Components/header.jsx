import { useEffect, useState, useContext } from "react";
import { onAuthStateChanged, logout, getCurrentUser, getMe } from "../services/authService";
import { Addtocart } from "./Usercontext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export function Header() {
  const { 
    products,
    darkmode,
    changeclr,
    searchword,
    setword,
    side,
    setside,
    cartItems
  } = useContext(Addtocart);
  
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState(null);

  function handlesearch() {
    navigate(`/Productpage?search=${searchword}`);
  }

  useEffect(() => {
    // Optionally refresh user profile from backend
    if (localStorage.getItem("token")) {
      getMe().catch(() => null);
    }

    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserRole(currentUser.role?.trim());
        setUserData(currentUser);
      } else {
        setUserRole(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const cart = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setUserRole(null);
      setUserData(null);
      navigate("/Login");
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      navigate("/Login");
    }
  };

  return (
    <div>
      <nav
        className="navbar fixed-top px-2 px-md-3 transition-all shadow-sm"
        style={{
          background: darkmode ? "black" : "#ffffff",
          borderBottom: darkmode ? "1px solid #27272a" : "1px solid #f1f5f9",
          boxShadow: darkmode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between flex-nowrap gap-2 p-1">
          
          {/* 1. Logo */}
          <Link className="navbar-brand fw-bold logo text-decoration-none d-flex align-items-center m-0 flex-shrink-0" to="/">
            <span style={{ fontSize: "18px", letterSpacing: "-0.5px", color: darkmode ? "#ffffff" : "#0f172a" }}>
              Shop<span style={{ color: "#ff6b00" }}>Ease.</span>
            </span>
          </Link>

          {/* Nav Links (Desktop Only) */}
          <div className="navbar-collapse d-none  d-lg-block flex-grow-0" id="navbarNav" style={{paddingLeft: "180px"}}>
            <ul className="navbar-nav fw-medium gap-2 mx-auto align-items-center flex-row">
              {["/", "/Productpage", "/Contact"].map((path, idx) => {
                const names = ["Home", "Shop", "Contact"];
                return (
                  <li className="nav-item" key={path}>
                    <NavLink
                      className="nav-link px-3 py-1 rounded-pill transition-all"
                      to={path}
                      style={({ isActive }) => ({
                        color: isActive ? "#ff6b00" : (darkmode ? "#d1d5db" : "#475569"),
                        fontWeight: isActive ? "600" : "500",
                        background: isActive ? "rgba(255,107,42,0.1)" : "transparent",
                      })}
                    >
                      {names[idx]}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 2. Search Bar (Flexible width) */}
          <form className="d-flex align-items-center position-relative flex-grow-1" style={{ maxWidth: "250px", minWidth: "90px" }}>
            <input
              className="form-control rounded-pill ps-2 pe-4 py-1 border"
              type="text"
              style={{
                background: darkmode ? "rgba(255, 255, 255, 0.05)" : "#f8fafc",
                color: darkmode ? "#ffffff" : "#0f172a",
                borderColor: darkmode ? "#27272a" : "#e2e8f0",
                fontSize: "12px",
                height: "32px"
              }}
              value={searchword}
              onChange={(e) => setword(e.target.value)}
              placeholder="Search..."
            />
            <button
              className="btn position-absolute end-0 border-0 bg-transparent pe-2 h-100 d-flex align-items-center"
              style={{ outline: "none", boxShadow: "none" }}
              onClick={(e) => {
                e.preventDefault();
                if (searchword.trim() === "") {
                  toast.info("Please enter a search query");
                } else {
                  handlesearch();
                }
              }}
            >
              <i className="bi bi-search" style={{ color: darkmode ? "#ff6b00" : "#64748b", fontSize: "11px" }}></i>
            </button>
          </form>

          {/* 3. Icons Wrapper (Single-line layout) */}
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            
            {/* Cart Link */}
            <Link 
              className="nav-link d-flex align-items-center gap-1 px-2 rounded-pill text-decoration-none shadow-sm transition-all" 
              to="/ItemCart" 
              style={{ background: "#ff6b00", height: "32px" }}
            >
              <i className="bi bi-cart-fill text-white" style={{ fontSize: "12px" }}></i>
              <span className="text-white fw-bold" style={{ fontSize: "11px" }}>
                {cart}
              </span>
            </Link>

            {/* Wishlist (Mobile pe hide, Desktop pe show) */}
            <Link 
              to="/Wishlist" 
              className="d-none d-lg-flex align-items-center justify-content-center rounded-circle text-decoration-none"
              style={{ 
                color: darkmode ? "#d1d5db" : "#334155", 
                background: darkmode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                width: "32px",
                height: "32px"
              }}
            >
              <i className="bi bi-heart" style={{ fontSize: "13px" }}></i>
            </Link>

            {/* Dark / Light Toggle (Mobile pe hide, Desktop pe show) */}
            <div 
              className="d-none d-lg-flex align-items-center justify-content-center rounded-circle transition-all"
              style={{ 
                background: darkmode ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                width: "32px",
                height: "32px",
                cursor: "pointer" 
              }}
              onClick={() => changeclr()}
            >
              {darkmode ? (
                <i className="bi bi-moon-fill text-warning" style={{ fontSize: "13px" }}></i>
              ) : (
                <i className="bi bi-sun-fill text-dark" style={{ fontSize: "13px" }}></i>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="dropdown d-flex align-items-center">
              <button
                className="btn btn-link p-0 border-0 text-decoration-none d-flex align-items-center"
                type="button"
                id="userMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={userRole ? undefined : handleProfileClick}
              >
                <div className="position-relative d-flex align-items-center">
                  <i
                    className="bi bi-person-circle"
                    style={{ color: darkmode ? "#ff6b00" : "#0f172a", fontSize: "20px", cursor: "pointer" }}
                    title={userRole ? `Logged in as ${userRole}` : "Login / Account"}
                  ></i>
                  {userRole === "admin" && (
                    <span 
                      className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill border border-white" 
                      style={{ fontSize: "7px", padding: "1px 3px" }}
                    >
                      A
                    </span>
                  )}
                </div>
              </button>

              {userRole && (
                <ul 
                  className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 rounded-4 p-2" 
                  aria-labelledby="userMenuButton"
                  style={{ 
                    background: darkmode ? "#18181b" : "#ffffff",
                    minWidth: "180px"
                  }}
                >
                  <li className="dropdown-header px-3 py-1">
                    <span className="fw-bold d-block text-truncate" style={{ color: darkmode ? "#ffffff" : "#0f172a", fontSize: "13px" }}>
                      {userData?.fullName || "User"}
                    </span>
                    <span className="text-muted text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                      Role: {userRole}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider my-1 opacity-10" /></li>
                  
                  {userRole === "admin" && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-1.5 px-3 fw-medium" to="/Dashboard" style={{ color: darkmode ? "#e4e4e7" : "#334155", fontSize: "12px" }}>
                        <i className="bi bi-speedometer2 text-orange"></i> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  
                  {userRole === "customer" && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 rounded-2 py-1.5 px-3 fw-medium" to="/UserDashboard" style={{ color: darkmode ? "#e4e4e7" : "#334155", fontSize: "12px" }}>
                        <i className="bi bi-person text-orange"></i> My Dashboard
                      </Link>
                    </li>
                  )}
                  
                  <li><hr className="dropdown-divider my-1 opacity-10" /></li>
                  
                  <li>
                    <button 
                      className="dropdown-item text-danger d-flex align-items-center gap-2 rounded-2 py-1.5 px-3 fw-medium" 
                      onClick={handleLogout}
                      style={{ fontSize: "12px" }}
                    >
                      <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Mobile Sidebar Toggle Button */}
            <button 
              className="btn p-0 border-0 shadow-none d-lg-none d-flex align-items-center justify-content-center" 
              type="button" 
              onClick={() => setside(!side)}
              style={{ width: "30px", height: "32px" }}
            >
              <i className="bi bi-list" style={{ fontSize: "24px", color: darkmode ? "#ffffff" : "#0f172a" }}></i>
            </button>

          </div>

        </div>
      </nav>
    </div>
  );
}