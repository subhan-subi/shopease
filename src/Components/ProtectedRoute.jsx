import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, getMe } from "../services/authService";

function ProtectedRoute({ children, role }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {
      getMe()
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setUserRole(data.user.role);
          }
        })
        .catch(() => {
          // getMe failed (backend unreachable, DB down, etc.)
          // Fall back to cached user from localStorage rather than logging out
          try {
            const cached = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
            if (cached) {
              setUser(cached);
              setUserRole(cached.role || null);
            } else {
              setUser(null);
              setUserRole(null);
            }
          } catch {
            setUser(null);
            setUserRole(null);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserRole(currentUser?.role || null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div
          className="spinner-border text-warning"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-bold text-secondary">Loading, please wait...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" />;
  }

  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/" />;
  }

  if (role === "customer" && !userRole) {
    return <Navigate to="/Login" />;
  }


  return children;
}

export default ProtectedRoute;