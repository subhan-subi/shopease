import React, { useEffect, useState } from "react";
import { getAllReviews, deleteReview } from "../services/reviewService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const formatReviewDate = (dateVal) => {
  if (!dateVal) return "Recent";
  const d = new Date(dateVal);
  return isNaN(d.getTime())
    ? "Recent"
    : d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

export function Adminreviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      const result = await deleteReview(id);
      if (result.success) {
        toast.success("Review deleted successfully");
        fetchReviews();
      } else {
        toast.error(result.message || "Failed to delete review");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  // Direct array filtering without useMemo
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      ratingFilter === "all"
        ? true
        : review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  // Calculate average rating directly
  const calculateAverageRating = () => {
    if (!reviews.length) return "0.0";
    const total = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi ${i < rating ? "bi-star-fill" : "bi-star"}`}
        style={{ color: i < rating ? "#F59E0B" : "#D1D5DB", fontSize: "0.75rem" }}
      ></i>
    ));
  };

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Page Header */}
      <div className="admin-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="admin-page-title">Customer Reviews</h1>
          <p className="admin-page-subtitle">
            Monitor feedback, ratings, and moderate customer comments.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3 admin-animate-in">
          <div className="admin-stat-card" style={{ "--accent-color": "#3B82F6" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.10)", color: "#3B82F6" }}>
                <i className="bi bi-chat-square-quote-fill"></i>
              </div>
              <div>
                <div className="admin-stat-label">Total Reviews</div>
                <div className="admin-stat-value" style={{ fontSize: "1.5rem" }}>{reviews.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3 admin-animate-in">
          <div className="admin-stat-card" style={{ "--accent-color": "#F59E0B" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="admin-stat-icon" style={{ background: "rgba(245,158,11,0.10)", color: "#F59E0B" }}>
                <i className="bi bi-star-fill"></i>
              </div>
              <div>
                <div className="admin-stat-label">Avg Rating</div>
                <div className="admin-stat-value" style={{ fontSize: "1.5rem" }}>
                  {calculateAverageRating()}
                  <span style={{ fontSize: "0.85rem", color: "var(--admin-muted)", fontWeight: 400 }}> /5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-table-card">
        {/* Search & Filter Header */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--admin-border)" }}
        >
          <div className="admin-table-search input-group" style={{ maxWidth: "380px" }}>
            <span className="input-group-text">
              <i className="bi bi-search" style={{ fontSize: "0.875rem" }}></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search user, product ID, comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="admin-select form-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{ width: "170px" }}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★</option>
            <option value="3">3 Stars ★★★</option>
            <option value="2">2 Stars ★★</option>
            <option value="1">1 Star ★</option>
          </select>
        </div>

        <div className="table-responsive" style={{ maxHeight: "65vh" }}>
          <table className="table admin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>User Details</th>
                <th>Product ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border mb-2" role="status" style={{ color: "var(--admin-accent)", width: "28px", height: "28px" }}></div>
                    <p style={{ color: "var(--admin-muted)", fontSize: "0.825rem", margin: 0 }}>Fetching reviews...</p>
                  </td>
                </tr>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => {
                  const userName = review.userName || "Customer";
                  const firstLetter = userName.charAt(0).toUpperCase();

                  return (
                    <tr key={review.firestoreId}>
                      <td style={{ paddingLeft: "24px" }}>
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="admin-user-avatar"
                            style={{
                              background: "rgba(59,130,246,0.10)",
                              color: "#3B82F6",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              width: "38px", height: "38px",
                            }}
                          >
                            {firstLetter}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--admin-text)", fontSize: "0.875rem" }}>
                              {userName}
                            </div>
                            <small style={{ color: "var(--admin-muted)", fontSize: "0.75rem" }}>
                              {review.userEmail || "No email provided"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <Link
                          to={`/product/${review.productId}`}
                          className="font-monospace text-decoration-none"
                          style={{
                            fontSize: "0.75rem",
                            background: "var(--admin-bg)",
                            color: "var(--admin-accent)",
                            border: "1px solid var(--admin-border)",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            display: "inline-block",
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={review.productId}
                        >
                          #{review.productId}
                        </Link>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                            background: "rgba(245,158,11,0.08)",
                            border: "1px solid rgba(245,158,11,0.20)",
                            borderRadius: "999px",
                            padding: "4px 10px",
                          }}
                        >
                          <span style={{ fontWeight: 700, color: "#d97706", fontSize: "0.8rem", marginRight: "4px" }}>
                            {review.rating || 0}
                          </span>
                          {renderStars(review.rating || 0)}
                        </div>
                      </td>

                      <td style={{ maxWidth: "280px" }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.825rem",
                            color: "var(--admin-muted)",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                          title={review.comment}
                        >
                          {review.comment || <em style={{ color: "var(--admin-muted)" }}>No comment written.</em>}
                        </p>
                      </td>

                      <td>
                        <small style={{ color: "var(--admin-muted)", fontSize: "0.78rem", fontWeight: 500 }}>
                          {formatReviewDate(review.createdAt)}
                        </small>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          className="admin-btn-icon admin-btn-icon-danger btn"
                          data-bs-toggle="modal"
                          data-bs-target={`#deleteModal-${review.firestoreId}`}
                          title="Delete Review"
                        >
                          <i className="bi bi-trash" style={{ fontSize: "0.825rem" }}></i>
                        </button>

                        {/* Delete Modal */}
                        <div
                          className="modal fade text-start admin-modal"
                          id={`deleteModal-${review.firestoreId}`}
                          tabIndex="-1"
                          aria-labelledby={`deleteModalLabel-${review.firestoreId}`}
                          aria-hidden="true"
                        >
                          <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                              <div className="modal-header" style={{ background: "#EF4444" }}>
                                <h6
                                  className="modal-title"
                                  id={`deleteModalLabel-${review.firestoreId}`}
                                  style={{ color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}
                                >
                                  <i className="bi bi-exclamation-triangle-fill"></i>
                                  Delete Review
                                </h6>
                                <button
                                  type="button"
                                  className="btn-close btn-close-white"
                                  data-bs-dismiss="modal"
                                  aria-label="Close"
                                ></button>
                              </div>
                              <div className="modal-body">
                                <p style={{ color: "var(--admin-muted)", fontSize: "0.9rem", marginBottom: "12px" }}>
                                  Are you sure you want to delete this review from{" "}
                                  <strong style={{ color: "var(--admin-text)" }}>"{userName}"</strong>?
                                </p>
                                <div
                                  style={{
                                    background: "var(--admin-bg)",
                                    border: "1px solid var(--admin-border)",
                                    borderRadius: "8px",
                                    padding: "10px 14px",
                                    fontSize: "0.825rem",
                                    color: "var(--admin-muted)",
                                    fontStyle: "italic",
                                  }}
                                >
                                  "{review.comment?.substring(0, 80) || "No comment"}{review.comment?.length > 80 ? "..." : ""}"
                                </div>
                              </div>
                              <div className="modal-footer">
                                <button
                                  type="button"
                                  className="admin-btn-ghost btn"
                                  data-bs-dismiss="modal"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(review.firestoreId)}
                                  disabled={deletingId === review.firestoreId}
                                  className="btn btn-sm btn-danger px-4 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-2"
                                  data-bs-dismiss="modal"
                                  style={{ fontSize: "0.875rem" }}
                                >
                                  {deletingId === review.firestoreId ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <i className="bi bi-trash"></i> Confirm Delete
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">
                        <i className="bi bi-chat-square"></i>
                      </div>
                      <p className="admin-empty-title">No reviews found</p>
                      <p className="admin-empty-desc">
                        {searchTerm || ratingFilter !== "all"
                          ? "Try adjusting your search or rating filter."
                          : "Your store currently has no customer reviews."}
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