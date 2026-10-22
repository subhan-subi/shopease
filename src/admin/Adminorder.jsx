import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subscribeOrders } from "../services/orderService";

export function Adminorders() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Real-time listener for Firestore orders
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeOrders((fetchedOrders) => {
      setOrders(fetchedOrders || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Direct calculation on render
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" ||
      order.status?.toLowerCase() === filterStatus.toLowerCase() ||
      (filterStatus.toLowerCase() === "processing" &&
        order.status?.toLowerCase() === "proccessing");

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      String(order.id || "").toLowerCase().includes(term) ||
      String(order.customer || "").toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "admin-badge admin-badge-success";
      case "shipped":
        return "admin-badge admin-badge-info";
      case "cancelled":
        return "admin-badge admin-badge-danger";
      case "processing":
      case "proccessing":
        return "admin-badge admin-badge-primary";
      default:
        return "admin-badge admin-badge-warning";
    }
  };

  const getPaymentStatusBadge = (payStatus) => {
    switch (payStatus?.toLowerCase()) {
      case "paid":
        return "admin-badge admin-badge-success";
      case "unpaid":
        return "admin-badge admin-badge-danger";
      default:
        return "admin-badge admin-badge-warning";
    }
  };

  const filterTabs = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Page Header */}
      <div className="admin-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="admin-page-title mb-0">Order Management</h1>
            <span className="admin-live-dot">Live Sync</span>
          </div>
          <p className="admin-page-subtitle">
            Track customer orders, update delivery states, and audit payment verifications.
          </p>
        </div>

        {/* Quick Stat */}
        <div className="admin-stat-card d-flex align-items-center gap-3" style={{ padding: "14px 20px", minWidth: "160px" }}>
          <div className="admin-stat-icon" style={{ background: "rgba(11,19,43,0.08)", color: "#0B132B", width: "40px", height: "40px" }}>
            <i className="bi bi-bag-check-fill"></i>
          </div>
          <div>
            <div className="admin-stat-label">Total Orders</div>
            <div className="admin-stat-value" style={{ fontSize: "1.3rem" }}>{orders.length}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="admin-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-4">
            <div className="admin-table-search input-group">
              <span className="input-group-text">
                <i className="bi bi-search" style={{ fontSize: "0.875rem" }}></i>
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Search Order ID or Customer Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-8">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              {filterTabs.map((tab) => {
                const isActive = filterStatus.toLowerCase() === tab.value.toLowerCase();
                return (
                  <button
                    key={tab.value}
                    type="button"
                    className={`admin-filter-tab btn ${isActive ? "active" : ""}`}
                    onClick={() => setFilterStatus(tab.value)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-card">
        <div className="table-responsive" style={{ maxHeight: "70vh" }}>
          <table className="table admin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Customer & Order ID</th>
                <th>Date & Time</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Total Amount</th>
                <th>Order Status</th>
                <th className="text-end" style={{ paddingRight: "24px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border mb-2" role="status" style={{ color: "var(--admin-accent)", width: "28px", height: "28px" }}></div>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.825rem", margin: 0 }}>Syncing live order registry...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">
                        <i className="bi bi-inbox"></i>
                      </div>
                      <p className="admin-empty-title">No Orders Matching Your Criteria</p>
                      <p className="admin-empty-desc">
                        {searchTerm || filterStatus !== "all"
                          ? "Try adjusting your search criteria or switching filter tabs."
                          : "There are currently no customer orders logged in the store."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const customerInitial = order.customer ? order.customer.charAt(0).toUpperCase() : "C";
                  return (
                    <tr key={order.firebaseId || index}>
                      {/* Customer & ID */}
                      <td style={{ paddingLeft: "24px" }}>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="admin-user-avatar"
                            style={{
                              background: "rgba(255,107,0,0.10)",
                              color: "var(--admin-accent)",
                              fontWeight: 700,
                              width: "38px", height: "38px",
                              fontSize: "0.875rem",
                            }}
                          >
                            {customerInitial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>
                              {order.customer || "Guest Customer"}
                            </div>
                            <span
                              className="font-monospace"
                              style={{
                                fontSize: "0.72rem",
                                background: "var(--admin-bg)",
                                color: "var(--admin-muted)",
                                border: "1px solid var(--admin-border)",
                                borderRadius: "4px",
                                padding: "1px 6px",
                              }}
                            >
                              #{order.id || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <span style={{ fontWeight: 500, color: "var(--admin-text)", fontSize: "0.825rem", display: "block" }}>
                          {order.orderdate || "—"}
                        </span>
                        <small style={{ color: "var(--admin-muted)", fontSize: "0.75rem" }}>{order.ordertime || ""}</small>
                      </td>

                      {/* Payment Method */}
                      <td>
                        <span className="admin-badge admin-badge-primary">
                          <i className="bi bi-wallet2" style={{ fontSize: "0.7rem" }}></i>
                          {order.paymentDetails?.method || order.payment || "COD"}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td>
                        <span className={getPaymentStatusBadge(order.paymentStatus)}>
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td style={{ fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>
                        Rs. {Number(order.TotalAmount || 0).toLocaleString()}
                      </td>

                      {/* Order Status */}
                      <td>
                        <span className={getStatusBadge(order.status)}>
                          {order.status || "Pending"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="text-end" style={{ paddingRight: "24px" }}>
                        <Link
                          to={`/Ordersmange/${order.firebaseId}`}
                          className="admin-btn-dark btn btn-sm d-inline-flex align-items-center gap-1"
                          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
                        >
                          Manage
                          <i className="bi bi-chevron-right" style={{ fontSize: "0.7rem" }}></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}