
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Addtocart } from "../Components/Usercontext";
import { subscribeOrders } from "../services/orderService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export function Dashboard() {
  const { products = [] } = useContext(Addtocart) || {};

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FIREBASE ORDERS
  // =========================
  useEffect(() => {
    const unsubscribe = subscribeOrders((data) => {
      setOrders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // =========================
  // BASIC METRICS
  // =========================

  const lowStockProducts = products.filter(
    (item) => Number(item.stock || 0) <= 5
  );

  const pendingOrders = orders.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const totalProducts = products.length;

  const deliveredOrders = orders.filter(
    (item) => item.status?.toLowerCase() === "delivered"
  );

  const totalRevenue = deliveredOrders.reduce(
    (total, order) => total + Number(order.TotalAmount || 0),
    0
  );

  const totalOrders = orders.length;

  const uniqueCustomers = new Set(
    orders
      .map((order) => order.Email || order.Name || order.userEmail)
      .filter(Boolean)
  ).size;

  // =========================
  // TODAY
  // =========================

  const today = new Date().toLocaleDateString();

  const todayRevenue = deliveredOrders
    .filter((order) => order.orderdate === today)
    .reduce(
      (sum, order) => sum + Number(order.TotalAmount || 0),
      0
    );

  // =========================
  // CURRENT MONTH REVENUE
  // =========================

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = deliveredOrders
    .filter((order) => {
      if (!order.orderdate) return false;

      const parts = order.orderdate.split("/");

      if (parts.length !== 3) return false;

      const month = Number(parts[0]) - 1;
      const day = Number(parts[1]);
      const year = Number(parts[2]);

      const date = new Date(year, month, day);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce(
      (sum, order) => sum + Number(order.TotalAmount || 0),
      0
    );

  // =========================
  // ORDER STATUS CHART
  // =========================

  const orderStatusData = useMemo(() => {
    const getCount = (status) =>
      orders.filter(
        (order) => order.status?.toLowerCase() === status
      ).length;

    return [
      {
        name: "Pending",
        value: getCount("pending"),
      },
      {
        name: "Processing",
        value:
          getCount("processing") +
          getCount("proccessing"),
      },
      {
        name: "Shipped",
        value: getCount("shipped"),
      },
      {
        name: "Delivered",
        value: getCount("delivered"),
      },
      {
        name: "Cancelled",
        value: getCount("cancelled"),
      },
    ].filter((item) => item.value > 0);
  }, [orders]);

  // =========================
  // PAYMENT METHOD CHART
  // =========================

  const paymentData = useMemo(() => {
    const methods = {};

    orders.forEach((order) => {
      const method = order.payment || "Unknown";

      methods[method] = (methods[method] || 0) + 1;
    });

    return Object.entries(methods).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [orders]);

  // =========================
  // REVENUE TREND
  // =========================

  const revenueData = useMemo(() => {
    const dailyRevenue = {};

    deliveredOrders.forEach((order) => {
      if (!order.orderdate) return;

      const amount = Number(order.TotalAmount || 0);

      dailyRevenue[order.orderdate] =
        (dailyRevenue[order.orderdate] || 0) + amount;
    });

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date,
        revenue,
      }))
      .sort((a, b) => {
        const [am, ad, ay] = a.date.split("/").map(Number);
        const [bm, bd, by] = b.date.split("/").map(Number);

        return (
          new Date(ay, am - 1, ad) -
          new Date(by, bm - 1, bd)
        );
      })
      .slice(-30);
  }, [deliveredOrders]);

  // =========================
  // TOP PRODUCTS
  // =========================

  const topProductsData = useMemo(() => {
    const productSales = {};

    orders.forEach((order) => {
      if (order.status?.toLowerCase() !== "delivered") {
        return;
      }

      if (!Array.isArray(order.products)) return;

      order.products.forEach((product) => {
        const title = product.Title || "Unknown Product";
        const qty = Number(product.qty || 0);

        productSales[title] =
          (productSales[title] || 0) + qty;
      });
    });

    return Object.entries(productSales)
      .map(([name, sales]) => ({
        name,
        sales,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders]);

  // =========================
  // CATEGORY STOCK DATA
  // =========================

  const stockData = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((product) => {
      const stock = Number(product.stock || 0);

      if (stock === 0) {
        outOfStock++;
      } else if (stock <= 5) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return [
      {
        name: "In Stock",
        value: inStock,
      },
      {
        name: "Low Stock",
        value: lowStock,
      },
      {
        name: "Out of Stock",
        value: outOfStock,
      },
    ].filter((item) => item.value > 0);
  }, [products]);

  // =========================
  // RECENT ORDERS
  // =========================

  const recentOrders = [...orders]
    .reverse()
    .slice(0, 5);

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusAdminBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "admin-badge admin-badge-success";

      case "shipped":
        return "admin-badge admin-badge-info";

      case "processing":
      case "proccessing":
        return "admin-badge admin-badge-primary";

      case "cancelled":
        return "admin-badge admin-badge-danger";

      default:
        return "admin-badge admin-badge-warning";
    }
  };

  // =========================
  // STAT CARDS
  // =========================

  const statCards = [
    {
      label: "Total Revenue",
      value: `Rs. ${totalRevenue.toLocaleString()}`,
      icon: "bi-currency-dollar",
      accent: "#FF6B00",
      bg: "rgba(255,107,0,0.10)",
      accentVar: "#FF6B00",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: "bi-bag-check-fill",
      accent: "#22C55E",
      bg: "rgba(34,197,94,0.10)",
      accentVar: "#22C55E",
    },
    {
      label: "Total Customers",
      value: uniqueCustomers,
      icon: "bi-people-fill",
      accent: "#3B82F6",
      bg: "rgba(59,130,246,0.10)",
      accentVar: "#3B82F6",
    },
    {
      label: "Total Products",
      value: totalProducts,
      icon: "bi-box-seam-fill",
      accent: "#8B5CF6",
      bg: "rgba(139,92,246,0.10)",
      accentVar: "#8B5CF6",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: "bi-clock-history",
      accent: "#F59E0B",
      bg: "rgba(245,158,11,0.10)",
      accentVar: "#F59E0B",
    },
    {
      label: "Low Stock Alerts",
      value: lowStockProducts.length,
      icon: "bi-exclamation-triangle-fill",
      accent: "#EF4444",
      bg: "rgba(239,68,68,0.10)",
      accentVar: "#EF4444",
    },
    {
      label: "Monthly Sales",
      value: `Rs. ${monthlyRevenue.toLocaleString()}`,
      icon: "bi-receipt",
      accent: "#0B132B",
      bg: "rgba(11,19,43,0.08)",
      accentVar: "#0B132B",
    },
    {
      label: "Today's Revenue",
      value: `Rs. ${todayRevenue.toLocaleString()}`,
      icon: "bi-cash-stack",
      accent: "#22C55E",
      bg: "rgba(34,197,94,0.10)",
      accentVar: "#22C55E",
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* =========================
          HEADER
      ========================= */}

      <div className="admin-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="admin-page-title">
            Dashboard Overview
          </h1>

          <p className="admin-page-subtitle">
            Welcome back! Here's what's happening with
            your store today.
          </p>
        </div>

        <div className="admin-live-dot">
          Live Sync
        </div>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="row g-3 mb-4">
        {statCards.map((card, idx) => (
          <div
            className="col-12 col-sm-6 col-lg-3 admin-animate-in"
            key={idx}
          >
            <div
              className="admin-stat-card"
              style={{
                "--accent-color": card.accentVar,
              }}
            >
              <div className="d-flex align-items-start justify-content-between">

                <div>
                  <div className="admin-stat-label">
                    {card.label}
                  </div>

                  <div className="admin-stat-value">
                    {card.value}
                  </div>
                </div>

                <div
                  className="admin-stat-icon"
                  style={{
                    background: card.bg,
                    color: card.accent,
                  }}
                >
                  <i className={`bi ${card.icon}`}></i>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =========================
          CHARTS ROW 1
      ========================= */}

      <div className="row g-4 mb-4">

        {/* ORDER STATUS */}

        <div className="col-12 col-lg-5">
          <div
            className="admin-table-card p-4"
            style={{ height: "100%" }}
          >
            <h5
              className="mb-1 fw-bold"
              style={{
                color: "var(--admin-text)",
              }}
            >
              Orders by Status
            </h5>

            <small
              style={{
                color: "var(--admin-muted)",
              }}
            >
              Current order distribution
            </small>

            <div
              style={{
                width: "100%",
                height: 330,
              }}
            >
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={115}
                      paddingAngle={3}
                    >
                      {orderStatusData.map(
                        (entry, index) => (
                          <Cell key={index} />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center pt-5 text-muted">
                  No order data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* REVENUE TREND */}

        <div className="col-12 col-lg-7">
          <div
            className="admin-table-card p-4"
            style={{ height: "100%" }}
          >
            <h5
              className="mb-1 fw-bold"
              style={{
                color: "var(--admin-text)",
              }}
            >
              Revenue Trend
            </h5>

            <small
              style={{
                color: "var(--admin-muted)",
              }}
            >
              Delivered orders revenue
            </small>

            <div
              style={{
                width: "100%",
                height: 330,
              }}
            >
              {revenueData.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.15}
                    />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) =>
                        `Rs. ${Number(value).toLocaleString()}`
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FF6B00"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center pt-5 text-muted">
                  No revenue data available
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          CHARTS ROW 2
      ========================= */}

      <div className="row g-4 mb-4">

        {/* TOP PRODUCTS */}

        <div className="col-12 col-lg-7">
          <div
            className="admin-table-card p-4"
            style={{ height: "100%" }}
          >
            <h5
              className="mb-1 fw-bold"
              style={{
                color: "var(--admin-text)",
              }}
            >
              Top Selling Products
            </h5>

            <small
              style={{
                color: "var(--admin-muted)",
              }}
            >
              Best performing products
            </small>

            <div
              style={{
                width: "100%",
                height: 330,
              }}
            >
              {topProductsData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={topProductsData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      opacity={0.15}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="sales"
                      fill="#FF6B00"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center pt-5 text-muted">
                  No product sales data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS */}

        <div className="col-12 col-lg-5">
          <div
            className="admin-table-card p-4"
            style={{ height: "100%" }}
          >
            <h5
              className="mb-1 fw-bold"
              style={{
                color: "var(--admin-text)",
              }}
            >
              Payment Methods
            </h5>

            <small
              style={{
                color: "var(--admin-muted)",
              }}
            >
              Orders by payment method
            </small>

            <div
              style={{
                width: "100%",
                height: 330,
              }}
            >
              {paymentData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {paymentData.map(
                        (entry, index) => (
                          <Cell key={index} />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center pt-5 text-muted">
                  No payment data available
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          STOCK OVERVIEW
      ========================= */}

      <div className="row g-4 mb-4">

        <div className="col-12 col-lg-5">
          <div
            className="admin-table-card p-4"
            style={{ height: "100%" }}
          >
            <h5
              className="mb-1 fw-bold"
              style={{
                color: "var(--admin-text)",
              }}
            >
              Inventory Overview
            </h5>

            <small
              style={{
                color: "var(--admin-muted)",
              }}
            >
              Current product stock levels
            </small>

            <div
              style={{
                width: "100%",
                height: 300,
              }}
            >
              {stockData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={stockData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {stockData.map(
                        (entry, index) => (
                          <Cell key={index} />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center pt-5 text-muted">
                  No product data available
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          RECENT ORDERS
      ========================= */}

      <div className="admin-table-card">

        <div
          className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{
            borderBottom:
              "1px solid var(--admin-border)",
          }}
        >
          <div>
            <h5
              className="mb-0"
              style={{
                fontWeight: 700,
                color: "var(--admin-text)",
                fontSize: "1rem",
              }}
            >
              Recent Orders
            </h5>

            <small
              style={{
                color: "var(--admin-muted)",
                fontSize: "0.8rem",
              }}
            >
              Latest activity from your customers
            </small>
          </div>
        </div>

        <div className="table-responsive">

          <table className="table admin-table">

            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5"
                  >
                    <div
                      className="spinner-border mb-2"
                      role="status"
                      style={{
                        color:
                          "var(--admin-accent)",
                        width: "28px",
                        height: "28px",
                      }}
                    ></div>

                    <p
                      style={{
                        color:
                          "var(--admin-muted)",
                        fontSize:
                          "0.825rem",
                        margin: 0,
                      }}
                    >
                      Loading orders...
                    </p>
                  </td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((ord, idx) => (
                  <tr
                    key={
                      ord.firebaseId ||
                      ord.id ||
                      idx
                    }
                  >

                    <td>
                      <span
                        className="font-monospace"
                        style={{
                          fontWeight: 700,
                          color:
                            "var(--admin-text)",
                          fontSize:
                            "0.825rem",
                        }}
                      >
                        #{ord.id}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-2">

                        <div
                          className="admin-user-avatar"
                          style={{
                            background:
                              "rgba(255,107,0,0.10)",
                            color:
                              "var(--admin-accent)",
                            fontSize:
                              "0.75rem",
                            fontWeight: 700,
                            width: "32px",
                            height: "32px",
                          }}
                        >
                          {(
                            ord.customer ||
                            ord.Email ||
                            "G"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <div
                            style={{
                              fontWeight: 600,
                              color:
                                "var(--admin-text)",
                              fontSize:
                                "0.85rem",
                            }}
                          >
                            {ord.customer ||
                              ord.Email ||
                              "Guest User"}
                          </div>

                          <small
                            style={{
                              color:
                                "var(--admin-muted)",
                              fontSize:
                                "0.75rem",
                            }}
                          >
                            {ord.City || "N/A"}
                          </small>

                        </div>

                      </div>
                    </td>

                    <td
                      style={{
                        color:
                          "var(--admin-muted)",
                        fontSize:
                          "0.825rem",
                      }}
                    >
                      {ord.orderdate || "Recent"}
                    </td>

                    <td
                      style={{
                        fontWeight: 700,
                        color:
                          "var(--admin-text)",
                        fontSize:
                          "0.875rem",
                      }}
                    >
                      Rs.{" "}
                      {Number(
                        ord.TotalAmount || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      <span
                        className={getStatusAdminBadge(
                          ord.status
                        )}
                      >
                        {ord.status ||
                          "Pending"}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">

                    <div className="admin-empty-state">

                      <div className="admin-empty-icon">
                        <i className="bi bi-inbox"></i>
                      </div>

                      <p className="admin-empty-title">
                        No recent orders
                      </p>

                      <p className="admin-empty-desc">
                        Orders will appear here once
                        customers place them.
                      </p>

                    </div>

                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}
