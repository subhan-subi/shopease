import React, { useState, useEffect } from "react";
import { onAuthStateChanged, auth, logout, updateProfile } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { addReview, hasUserReviewed, getProductReviews } from "../services/reviewService";
import { subscribeOrders, updateOrderStatus } from "../services/orderService";
import { updateProductRating } from "../services/productService";
import { toast } from "react-toastify";

// ── Breadcrumb ──────────────────────────────────────────────────────────────
function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb mb-0 d-flex flex-wrap align-items-center gap-1" style={{ fontSize: "13px" }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumb-item${isLast ? " active" : ""}`}>
              {isLast ? (
                <span style={{ color: "#ff6b00", fontWeight: 600 }}>{item.label}</span>
              ) : (
                <>
                  <Link to={item.to} style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                    onMouseLeave={e => (e.target.style.color = "#94a3b8")}>
                    {item.label}
                  </Link>
                  <i className="bi bi-chevron-right mx-2" style={{ fontSize: "10px", color: "#334155" }} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Status helpers ──────────────────────────────────────────────────────────
function getProgress(status) {
  switch (status?.toLowerCase()) {
    case "pending": return 25;
    case "processing": case "proccessing": return 50;
    case "shipped": return 75;
    case "delivered": return 100;
    default: return 0;
  }
}

function StatusBadge({ status }) {
  const cfg = {
    delivered:   { bg: "#dcfce7", color: "#16a34a", icon: "check-circle-fill" },
    shipped:     { bg: "#dbeafe", color: "#2563eb", icon: "truck"             },
    processing:  { bg: "#ede9fe", color: "#7c3aed", icon: "gear-fill"         },
    proccessing: { bg: "#ede9fe", color: "#7c3aed", icon: "gear-fill"         },
    cancelled:   { bg: "#fee2e2", color: "#dc2626", icon: "x-circle-fill"     },
    pending:     { bg: "#fef9c3", color: "#ca8a04", icon: "clock-fill"        },
  };
  const key = status?.toLowerCase() || "pending";
  const c = cfg[key] || cfg.pending;
  return (
    <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-semibold" style={{ background: c.bg, color: c.color, fontSize: "12px" }}>
      <i className={`bi bi-${c.icon}`} style={{ fontSize: "11px" }} />
      {status || "Pending"}
    </span>
  );
}

// ── StatCard ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, iconColor, iconBg }) {
  return (
    <div className="col-12 col-md-4">
      <div className="rounded-4 p-4 h-100 d-flex justify-content-between align-items-center" style={{ background: "#ffffff", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(15,23,42,0.06)" }}>
        <div>
          <p className="mb-1 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.6px", color: "#94a3b8" }}>{label}</p>
          <h2 className="fw-bold mb-0" style={{ color: "#0f172a" }}>{value}</h2>
        </div>
        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: "52px", height: "52px", background: iconBg }}>
          <i className={`bi bi-${icon} fs-4`} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function UserDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState({});
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [fullyReviewedOrders, setFullyReviewedOrders] = useState({});
  const [activeTab, setActiveTab] = useState("orders");

  const [reviewData, setReviewData] = useState({ productId: "", rating: 5, comment: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", phone: "", address: "", city: "" });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logout(); navigate("/Login"); } catch (e) { console.log(e); }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        setUserData(user);
        setProfileData({ name: user.fullName || "", phone: user.phone || "", address: user.address || "", city: user.city || "" });
      }
    });
    return () => unsub();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ fullName: profileData.name, phone: profileData.phone, address: profileData.address, city: profileData.city });
      setIsEditingProfile(false);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
  };

  useEffect(() => {
    const unsub = subscribeOrders((data) => setOrders(data));
    return () => unsub();
  }, []);

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (!user || orders.length === 0) return;
      const map = {};
      for (const ord of orders) {
        if (ord.status?.toLowerCase() === "delivered" && ord.products) {
          let allReviewed = true;
          for (const p of ord.products) {
            const already = await hasUserReviewed(user.uid, p.firebaseId, ord.firestoreId);
            if (!already) { allReviewed = false; break; }
          }
          map[ord.firestoreId] = allReviewed;
        }
      }
      setFullyReviewedOrders(map);
    };
    check();
  }, [orders]);

  const handleReviewClick = async (order) => {
    const user = auth.currentUser;
    const pending = [];
    for (const p of order.products) {
      const already = await hasUserReviewed(user.uid, p.firebaseId, order.firestoreId);
      if (!already) pending.push(p);
    }
    setReviewedProducts(pending);
    setReviewOrder(order);
  };

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewData.productId) { toast.warning("Please select a product to review."); return; }
    try {
      const user = auth.currentUser;
      const already = await hasUserReviewed(user.uid, reviewData.productId, reviewOrder.firestoreId);
      if (already) { toast.warning("Already reviewed this product for this order"); setReviewOrder(null); setReviewData({ productId: "", rating: 5, comment: "" }); return; }

      await addReview({ userId: user.uid, productId: reviewData.productId, rating: reviewData.rating, comment: reviewData.comment, orderId: reviewOrder.firestoreId, createdAt: new Date(), userName: profileData.name, userEmail });
      const reviews = await getProductReviews(reviewData.productId);
      const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
      await updateProductRating(reviewData.productId, Number(avg.toFixed(1)), reviews.length);

      toast.success("Review submitted!");
      setReviewOrder(null);
      setReviewData({ productId: "", rating: 5, comment: "" });
      setFullyReviewedOrders(prev => ({ ...prev, [reviewOrder.firestoreId]: true }));
    } catch { toast.error("Failed to submit review."); }
  }

  const handleCancelOrder = async (orderId) => {
    try { await updateOrderStatus(orderId, "Cancelled"); setCancellingId(null); toast.info("Order Cancelled"); }
    catch { console.log("cancel error"); }
  };

  const totalSpent = orders.filter(o => o.status?.toLowerCase() === "delivered").reduce((s, o) => s + Number(o.TotalAmount || 0), 0);
  const activeOrdersCount = orders.filter(o => ["pending", "processing", "proccessing", "shipped"].includes(o.status?.toLowerCase())).length;
  const deliveredCount = orders.filter(o => o.status?.toLowerCase() === "delivered").length;

  const avatar = (profileData.name || userEmail || "U").charAt(0).toUpperCase();

  return (
    <div className="min-vh-100" style={{ background: "#f0f4f8" }}>
      <div className="container py-4 py-md-5" style={{ maxWidth: "1000px" }}>

        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "My Account" }]} />

        {/* ─── Profile Header ─── */}
        <div
          className="rounded-4 p-4 p-md-5 mb-4 position-relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)", border: "1px solid rgba(255,107,0,0.2)" }}
        >
          {/* ambient glow */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "250px", height: "250px", background: "radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-4 position-relative" style={{ zIndex: 1 }}>
            {/* Left: Avatar + Info */}
            <div className="d-flex align-items-center gap-3 gap-md-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0" style={{ width: "72px", height: "72px", background: "linear-gradient(135deg, #ff6b00, #e05e00)", fontSize: "26px", boxShadow: "0 8px 24px rgba(255,107,0,0.4)" }}>
                {avatar}
              </div>
              <div>
                <span className="badge px-2 py-1 mb-2 fw-semibold text-uppercase" style={{ background: "rgba(255,193,7,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", fontSize: "10px", letterSpacing: "0.8px" }}>
                  VIP Member
                </span>
                <h2 className="fw-bold text-white mb-0" style={{ fontSize: "clamp(1.1rem,3vw,1.5rem)" }}>{profileData.name || "ShopEase Customer"}</h2>
                <p className="mb-0" style={{ color: "#94a3b8", fontSize: "13px" }}>{userEmail}</p>
                {profileData.city && (
                  <p className="mb-0 mt-1" style={{ color: "#64748b", fontSize: "12px" }}>
                    <i className="bi bi-geo-alt me-1" style={{ color: "#ff6b00" }} />
                    {profileData.address && `${profileData.address}, `}{profileData.city}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="d-flex flex-wrap gap-2">
              <button onClick={() => setIsEditingProfile(true)} className="btn btn-sm rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2" style={{ background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.12)" }}>
                <i className="bi bi-pencil-square" /> Edit Profile
              </button>
              <Link to="/Productpage" className="btn btn-sm rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2 text-decoration-none" style={{ background: "#ff6b00", color: "#ffffff", border: "none" }}>
                <i className="bi bi-bag-plus" /> Shop Now
              </Link>
              <button onClick={handleLogout} className="btn btn-sm rounded-pill fw-semibold px-3 py-2 d-flex align-items-center gap-2" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                <i className="bi bi-box-arrow-right" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ─── Stats ─── */}
        <div className="row g-3 mb-4">
          <StatCard label="Total Orders" value={orders.length} icon="box-seam" iconColor="#ff6b00" iconBg="#fff3eb" />
          <StatCard label="Active Deliveries" value={activeOrdersCount} icon="truck" iconColor="#f59e0b" iconBg="#fef9c3" />
          <StatCard label="Total Spent" value={`Rs ${totalSpent}`} icon="wallet2" iconColor="#10b981" iconBg="#dcfce7" />
        </div>

        {/* ─── Tabs ─── */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {[
            { key: "orders", label: "Order History", icon: "bag-check" },
            { key: "profile", label: "My Profile", icon: "person-circle" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="btn rounded-pill fw-semibold px-4 py-2 d-flex align-items-center gap-2"
              style={{
                background: activeTab === tab.key ? "#ff6b00" : "#ffffff",
                color: activeTab === tab.key ? "#ffffff" : "#64748b",
                border: activeTab === tab.key ? "none" : "1px solid #e2e8f0",
                boxShadow: activeTab === tab.key ? "0 4px 12px rgba(255,107,0,0.3)" : "none",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
            >
              <i className={`bi bi-${tab.icon}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Orders Tab ─── */}
        {activeTab === "orders" && (
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>
                Order History &amp; Live Tracking
              </h5>
              <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{ background: "#f1f5f9", color: "#64748b", fontSize: "12px" }}>
                {orders.length} orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-4 text-center py-5 px-4" style={{ background: "#ffffff", border: "1px solid #f1f5f9" }}>
                <div className="mb-3 d-flex align-items-center justify-content-center mx-auto rounded-circle" style={{ width: "80px", height: "80px", background: "#fff3eb" }}>
                  <i className="bi bi-cart-x fs-2" style={{ color: "#ff6b00" }} />
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "#0f172a" }}>No Orders Yet</h5>
                <p className="mb-4" style={{ color: "#64748b", fontSize: "14px" }}>Start exploring and place your first order today!</p>
                <Link to="/Productpage" className="btn rounded-pill fw-semibold px-4 py-2 text-white text-decoration-none" style={{ background: "#ff6b00", border: "none" }}>
                  <i className="bi bi-bag-plus me-2" /> Start Shopping
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {orders.map((ord, idx) => {
                  const progress = getProgress(ord.status);
                  const isCancelable = ["pending", "processing", "proccessing"].includes(ord.status?.toLowerCase());
                  const isDelivered = ord.status?.toLowerCase() === "delivered";
                  const isFullyReviewed = fullyReviewedOrders[ord.firestoreId];
                  const isCancelled = ord.status?.toLowerCase() === "cancelled";

                  return (
                    <div key={idx} className="rounded-4 overflow-hidden" style={{ background: "#ffffff", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
                      {/* Order Card Header */}
                      <div className="px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ borderBottom: "1px solid #f8fafc", background: "#fafafa" }}>
                        <div className="d-flex align-items-center gap-3 flex-wrap">
                          <span className="fw-bold font-monospace" style={{ color: "#0f172a", fontSize: "13px" }}>
                            #{ord.id}
                          </span>
                          <span className="d-flex align-items-center gap-1" style={{ color: "#94a3b8", fontSize: "12px" }}>
                            <i className="bi bi-calendar3" /> {ord.orderdate || "Recent"}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {isDelivered && (
                            isFullyReviewed ? (
                              <span className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-semibold" style={{ background: "#dcfce7", color: "#16a34a", fontSize: "12px" }}>
                                <i className="bi bi-check-all" /> Reviewed
                              </span>
                            ) : (
                              <button onClick={() => handleReviewClick(ord)} className="btn btn-sm rounded-pill fw-semibold px-3 d-flex align-items-center gap-1" style={{ background: "#fef9c3", color: "#ca8a04", border: "1px solid #fde047", fontSize: "12px" }}>
                                <i className="bi bi-star-fill" /> Write Review
                              </button>
                            )
                          )}
                          <StatusBadge status={ord.status} />
                        </div>
                      </div>

                      {/* Tracking Progress */}
                      <div className="px-4 py-3">
                        {!isCancelled ? (
                          <div>
                            <div className="d-flex justify-content-between mb-2">
                              {["Placed", "Processing", "Shipped", "Delivered"].map((step, si) => {
                                const thresholds = [25, 50, 75, 100];
                                const active = progress >= thresholds[si];
                                const icons = ["check-circle-fill", "gear-fill", "truck", "house-door-fill"];
                                return (
                                  <div key={si} className="d-flex flex-column align-items-center text-center" style={{ flex: 1 }}>
                                    <i className={`bi bi-${icons[si]}`} style={{ fontSize: "16px", color: active ? (si === 3 ? "#10b981" : "#ff6b00") : "#e2e8f0", marginBottom: "4px" }} />
                                    <span style={{ fontSize: "10px", color: active ? "#0f172a" : "#94a3b8", fontWeight: active ? 600 : 400 }}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="rounded-pill overflow-hidden" style={{ height: "6px", background: "#f1f5f9" }}>
                              <div
                                className="rounded-pill"
                                style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #ff6b00, #e05e00)", transition: "width 0.6s ease" }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-3 px-3 py-2 d-flex align-items-center gap-2" style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
                            <i className="bi bi-exclamation-triangle-fill" style={{ color: "#dc2626", fontSize: "14px" }} />
                            <span style={{ color: "#dc2626", fontSize: "13px", fontWeight: 500 }}>This order was cancelled.</span>
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className="px-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ borderTop: "1px solid #f8fafc", background: "#fafafa" }}>
                        <div className="d-flex gap-4">
                          <div>
                            <span className="d-block" style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Items</span>
                            <span className="fw-bold" style={{ color: "#0f172a", fontSize: "14px" }}>{ord.TotalProducts || ord.products?.length || 1}</span>
                          </div>
                          <div>
                            <span className="d-block" style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</span>
                            <span className="fw-bold" style={{ color: "#ff6b00", fontSize: "16px" }}>Rs {ord.TotalAmount}</span>
                          </div>
                          <div>
                            <span className="d-block" style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment</span>
                            <span className="fw-semibold" style={{ color: "#0f172a", fontSize: "13px" }}>{ord.payment || "—"}</span>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          {isCancelable && (
                            <button onClick={() => setCancellingId(ord.firestoreId)} className="btn btn-sm rounded-pill fw-semibold px-3 d-flex align-items-center gap-1" style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px" }}>
                              <i className="bi bi-x-circle" /> Cancel
                            </button>
                          )}
                          <button onClick={() => setSelectedOrder(ord)} className="btn btn-sm rounded-pill fw-semibold px-3 d-flex align-items-center gap-1" style={{ background: "#0f172a", color: "#ffffff", border: "none", fontSize: "12px" }}>
                            <i className="bi bi-eye" /> Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Profile Tab ─── */}
        {activeTab === "profile" && (
          <div className="rounded-4 overflow-hidden" style={{ background: "#ffffff", border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(15,23,42,0.05)" }}>
            <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
              <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Profile Information</h5>
              <button onClick={() => setIsEditingProfile(true)} className="btn btn-sm rounded-pill fw-semibold px-3 d-flex align-items-center gap-2" style={{ background: "#ff6b00", color: "#fff", border: "none", fontSize: "13px" }}>
                <i className="bi bi-pencil-square" /> Edit
              </button>
            </div>
            <div className="p-4">
              <div className="row g-4">
                {[
                  { label: "Full Name", value: profileData.name || "Not set", icon: "person" },
                  { label: "Email Address", value: userEmail || "Not set", icon: "envelope" },
                  { label: "Phone Number", value: profileData.phone || "Not set", icon: "telephone" },
                  { label: "City", value: profileData.city || "Not set", icon: "building" },
                  { label: "Address", value: profileData.address || "Not set", icon: "geo-alt" },
                ].map((field, i) => (
                  <div key={i} className="col-12 col-md-6">
                    <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: "36px", height: "36px", background: "#fff3eb" }}>
                        <i className={`bi bi-${field.icon}`} style={{ color: "#ff6b00", fontSize: "16px" }} />
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>{field.label}</span>
                        <p className="mb-0 fw-semibold mt-1" style={{ color: "#0f172a", fontSize: "14px" }}>{field.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══════ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-circle" style={{ color: "#ff6b00", fontSize: "20px" }} />
                  <h5 className="fw-bold mb-0 text-white">Edit Profile</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsEditingProfile(false)} />
              </div>
              <form onSubmit={handleProfileSave}>
                <div className="p-4">
                  {[
                    { label: "Full Name", key: "name", icon: "person", placeholder: "Muhammad Ahmed" },
                    { label: "Phone Number", key: "phone", icon: "telephone", placeholder: "+92 300 1234567" },
                    { label: "Street Address", key: "address", icon: "geo-alt", placeholder: "House #, Street, Area" },
                    { label: "City", key: "city", icon: "building", placeholder: "Lahore" },
                  ].map((field, i) => (
                    <div key={i} className="mb-3">
                      <label className="d-block mb-1 fw-semibold" style={{ fontSize: "12px", color: "#64748b" }}>{field.label}</label>
                      <div className="position-relative">
                        <i className={`bi bi-${field.icon} position-absolute`} style={{ left: "14px", top: "50%", transform: "translateY(-50%)", color: "#ff6b00", fontSize: "14px" }} />
                        <input
                          type="text"
                          className="w-100 rounded-3"
                          placeholder={field.placeholder}
                          value={profileData[field.key]}
                          onChange={e => setProfileData({ ...profileData, [field.key]: e.target.value })}
                          required={field.key === "name"}
                          style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0f172a", padding: "10px 14px 10px 38px", fontSize: "14px", outline: "none" }}
                          onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                          onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4 d-flex gap-2">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="btn rounded-pill fw-semibold px-4 flex-fill" style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}>Cancel</button>
                  <button type="submit" className="btn rounded-pill fw-semibold px-4 flex-fill text-white" style={{ background: "linear-gradient(135deg, #ff6b00, #e05e00)", border: "none" }}>
                    <i className="bi bi-check-circle me-2" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingId && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-body text-center py-5 px-4">
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: "72px", height: "72px", background: "#fee2e2" }}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ color: "#dc2626", fontSize: "28px" }} />
                </div>
                <h5 className="fw-bold mb-2" style={{ color: "#0f172a" }}>Cancel This Order?</h5>
                <p style={{ color: "#64748b", fontSize: "14px" }} className="mb-4">This action cannot be undone. Are you sure?</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button onClick={() => setCancellingId(null)} className="btn rounded-pill fw-semibold px-4" style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}>Keep Order</button>
                  <button onClick={() => handleCancelOrder(cancellingId)} className="btn rounded-pill fw-semibold px-4 text-white" style={{ background: "#dc2626", border: "none" }}>Yes, Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-receipt" style={{ color: "#ff6b00", fontSize: "18px" }} />
                  <h5 className="fw-bold mb-0 text-white">Order #{selectedOrder.id}</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedOrder(null)} />
              </div>
              <div className="p-4">
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <span className="d-block mb-1" style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Shipping Address</span>
                      <p className="fw-semibold mb-0" style={{ color: "#0f172a", fontSize: "14px" }}>{selectedOrder.Address || "N/A"}</p>
                      <p className="mb-0" style={{ color: "#64748b", fontSize: "13px" }}>{selectedOrder.City}</p>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <span className="d-block mb-1" style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Payment Info</span>
                      <p className="fw-semibold mb-0" style={{ color: "#0f172a", fontSize: "14px" }}>{selectedOrder.payment}</p>
                      <p className="mb-0" style={{ color: "#64748b", fontSize: "13px" }}>{selectedOrder.paymentStatus || "Pending"}</p>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3" style={{ color: "#0f172a" }}>Ordered Items</h6>
                <div className="d-flex flex-column gap-2 mb-4">
                  {selectedOrder.products && selectedOrder.products.length > 0 ? (
                    selectedOrder.products.map((p, i) => (
                      <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                        <div className="d-flex align-items-center gap-3">
                          {p.image && (
                            <div className="rounded-2 overflow-hidden flex-shrink-0" style={{ width: "44px", height: "44px", background: "#fff" }}>
                              <img src={p.image} alt={p.Title} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
                            </div>
                          )}
                          <span className="fw-semibold" style={{ fontSize: "14px", color: "#0f172a" }}>{p.Title || p.title || "Item"}</span>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                          <span style={{ color: "#64748b", fontSize: "13px" }}>x{p.qty || 1}</span>
                          <span className="fw-bold" style={{ color: "#ff6b00", fontSize: "14px" }}>Rs {p.price}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "14px" }} className="text-center py-3">No item details available.</p>
                  )}
                </div>

                <div className="rounded-3 p-3 d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
                  <span className="fw-bold text-white fs-6">Total Paid</span>
                  <span className="fw-bold fs-4" style={{ color: "#ff6b00" }}>Rs {selectedOrder.TotalAmount}</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => setSelectedOrder(null)} className="btn rounded-pill fw-semibold px-4 w-100" style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-star-fill" style={{ color: "#fbbf24", fontSize: "18px" }} />
                  <h5 className="fw-bold mb-0 text-white">Write a Review</h5>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setReviewOrder(null)} />
              </div>
              <form onSubmit={handleReviewSubmit} className="p-4">
                <div className="mb-3">
                  <label className="d-block mb-1 fw-semibold" style={{ fontSize: "12px", color: "#64748b" }}>Select Product</label>
                  <select className="w-100 rounded-3 fw-semibold" value={reviewData.productId} onChange={e => setReviewData({ ...reviewData, productId: e.target.value })}
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0f172a", padding: "10px 14px", fontSize: "14px", outline: "none" }}>
                    <option value="">Choose a product...</option>
                    {reviewedProducts.map((p) => (
                      <option key={p.firebaseId} value={p.firebaseId}>{p.Title || p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="d-block mb-2 fw-semibold" style={{ fontSize: "12px", color: "#64748b" }}>Your Rating</label>
                  <div className="d-flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="btn p-0 border-0" style={{ fontSize: "28px", color: star <= reviewData.rating ? "#fbbf24" : "#e2e8f0", transition: "color 0.15s" }}>
                        <i className={`bi bi-star-fill`} />
                      </button>
                    ))}
                    <span className="ms-2 fw-semibold align-self-center" style={{ color: "#64748b", fontSize: "13px" }}>
                      {reviewData.rating}/5
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="d-block mb-1 fw-semibold" style={{ fontSize: "12px", color: "#64748b" }}>Your Review</label>
                  <textarea
                    className="w-100 rounded-3"
                    rows="4"
                    placeholder="Share your experience with this product..."
                    value={reviewData.comment}
                    onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#0f172a", padding: "10px 14px", fontSize: "14px", outline: "none", resize: "none" }}
                    onFocus={e => (e.target.style.borderColor = "#ff6b00")}
                    onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div className="d-flex gap-2">
                  <button type="button" onClick={() => setReviewOrder(null)} className="btn rounded-pill fw-semibold px-4 flex-fill" style={{ background: "#f1f5f9", color: "#64748b", border: "none" }}>Cancel</button>
                  <button type="submit" className="btn rounded-pill fw-semibold px-4 flex-fill text-white" style={{ background: "linear-gradient(135deg, #ff6b00, #e05e00)", border: "none" }}>
                    <i className="bi bi-send-fill me-2" /> Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;