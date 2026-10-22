import React, { useContext, useEffect, useState } from "react";
import { Addtocart } from "../Components/Usercontext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteProduct, subscribeProducts } from "../services/productService";

export function AddProducts() {
  const navigate = useNavigate();
  const { products, setproducts } = useContext(Addtocart);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Live Subscription
  useEffect(() => {
    const unsubscribe = subscribeProducts((data) => {
      setproducts(data || []);
    });
    return () => unsubscribe();
  }, [setproducts]);

  // Delete product logic
  async function deletproduct(id) {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete product");
    }
  }

  // Direct Filtering without useMemo
  const filteredProducts = (products || []).filter((product) => {
    const term = searchTerm.toLowerCase();
    const titleMatch = product.Title?.toLowerCase().includes(term);
    const categoryMatch = product.Cetagory?.toLowerCase().includes(term);
    const idMatch = product.firebaseId?.toLowerCase().includes(term);

    return titleMatch || categoryMatch || idMatch;
  });

  // Pagination Calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Status Metrics
  const activeCount = (products || []).filter((p) => p.status === "active" || !p.status).length;
  const inactiveCount = (products || []).filter((p) => p.status === "inactive").length;

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Page Header */}
      <div className="admin-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="admin-page-title mb-0">Products Catalog</h1>
            <span className="admin-live-dot">Live Sync</span>
          </div>
          <p className="admin-page-subtitle">Manage your store catalog, pricing, status, and inventory.</p>
        </div>
        <Link to="/Addform" className="text-decoration-none">
          <button className="admin-btn-primary btn">
            <i className="bi bi-plus-lg"></i> Add Product
          </button>
        </Link>
      </div>

      {/* Quick Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-4 col-md-3 admin-animate-in">
          <div className="admin-stat-card" style={{ "--accent-color": "#0B132B" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="admin-stat-icon" style={{ background: "rgba(11,19,43,0.08)", color: "#0B132B" }}>
                <i className="bi bi-box-seam-fill"></i>
              </div>
              <div>
                <div className="admin-stat-label">Total Catalog</div>
                <div className="admin-stat-value" style={{ fontSize: "1.4rem" }}>{products?.length || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-4 col-md-2 admin-animate-in">
          <div className="admin-stat-card" style={{ "--accent-color": "#22C55E" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="admin-stat-icon" style={{ background: "rgba(34,197,94,0.10)", color: "#22C55E" }}>
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <div className="admin-stat-label">Active</div>
                <div className="admin-stat-value" style={{ fontSize: "1.4rem" }}>{activeCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-sm-4 col-md-2 admin-animate-in">
          <div className="admin-stat-card" style={{ "--accent-color": "#EF4444" }}>
            <div className="d-flex align-items-center gap-3">
              <div className="admin-stat-icon" style={{ background: "rgba(239,68,68,0.10)", color: "#EF4444" }}>
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <div>
                <div className="admin-stat-label">Inactive</div>
                <div className="admin-stat-value" style={{ fontSize: "1.4rem" }}>{inactiveCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Field */}
        <div className="col-12 col-md-5 admin-animate-in">
          <div className="admin-card p-3 h-100 d-flex align-items-center">
            <div className="admin-table-search input-group w-100">
              <span className="input-group-text">
                <i className="bi bi-search" style={{ fontSize: "0.875rem" }}></i>
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Search by Title, Category, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on search
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-table-card mb-4">
        <div className="table-responsive">
          <table className="table admin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "24px" }}>Product Details</th>
                <th>ID</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentProducts && currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.firebaseId}>
                    {/* Product Image & Title */}
                    <td style={{ paddingLeft: "24px" }}>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={product.image || "https://via.placeholder.com/50"}
                          alt={product.Title}
                          style={{
                            height: "44px",
                            width: "44px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            border: "1px solid var(--admin-border)",
                            background: "var(--admin-bg)",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--admin-text)",
                            fontSize: "0.875rem",
                            maxWidth: "220px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}
                          title={product.Title}
                        >
                          {product.Title}
                        </span>
                      </div>
                    </td>

                    {/* Product ID */}
                    <td>
                      <Link
                        to={`/product/${product.firebaseId}`}
                        className="font-monospace text-decoration-none"
                        style={{
                          fontSize: "0.775rem",
                          background: "var(--admin-bg)",
                          color: "var(--admin-accent)",
                          border: "1px solid var(--admin-border)",
                          borderRadius: "6px",
                          padding: "3px 8px",
                          display: "inline-block",
                          maxWidth: "110px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={product.firebaseId}
                      >
                        #{product.firebaseId}
                      </Link>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="admin-badge admin-badge-primary">
                        {product.Cetagory || "General"}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ fontWeight: 700, color: "var(--admin-text)", fontSize: "0.875rem" }}>
                      Rs. {Number(product.price || 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`admin-badge ${
                          product.status === "inactive"
                            ? "admin-badge-danger"
                            : "admin-badge-success"
                        }`}
                      >
                        <span
                          style={{
                            width: "6px", height: "6px", borderRadius: "50%",
                            background: product.status === "inactive" ? "#EF4444" : "#22C55E",
                            display: "inline-block",
                          }}
                        ></span>
                        {product.status || "active"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <button
                          className="admin-btn-icon btn"
                          title="Edit Product"
                          onClick={() => navigate(`/Addform/${product.firebaseId}`)}
                        >
                          <i className="bi bi-pencil-square" style={{ fontSize: "0.825rem" }}></i>
                        </button>

                        <button
                          type="button"
                          className="admin-btn-icon admin-btn-icon-danger btn"
                          data-bs-toggle="modal"
                          data-bs-target={`#deleteModal-${product.firebaseId}`}
                          title="Delete Product"
                        >
                          <i className="bi bi-trash" style={{ fontSize: "0.825rem" }}></i>
                        </button>
                      </div>

                      {/* Delete Modal */}
                      <div
                        className="modal fade text-start admin-modal"
                        id={`deleteModal-${product.firebaseId}`}
                        tabIndex="-1"
                        aria-labelledby={`deleteModalLabel-${product.firebaseId}`}
                        aria-hidden="true"
                      >
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5
                                className="modal-title"
                                id={`deleteModalLabel-${product.firebaseId}`}
                              >
                                <i className="bi bi-exclamation-triangle-fill" style={{ color: "#F59E0B" }}></i>
                                Delete Product
                              </h5>
                              <button
                                type="button"
                                className="btn-close btn-close-white"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <div className="modal-body">
                              <p style={{ color: "var(--admin-muted)", fontSize: "0.9rem", margin: 0 }}>
                                Are you sure you want to delete{" "}
                                <strong style={{ color: "var(--admin-text)" }}>"{product.Title}"</strong>?
                                This action cannot be undone.
                              </p>
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
                                onClick={() => deletproduct(product.firebaseId)}
                                className="btn btn-sm btn-danger px-4 py-2 rounded-3 fw-semibold"
                                data-bs-dismiss="modal"
                                style={{ fontSize: "0.875rem" }}
                              >
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">
                        <i className="bi bi-box-seam"></i>
                      </div>
                      <p className="admin-empty-title">No products found</p>
                      <p className="admin-empty-desc">
                        {searchTerm
                          ? "Try adjusting your search keywords."
                          : "Click '+ Add Product' to populate your catalog."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 px-4 py-3"
            style={{ borderTop: "1px solid var(--admin-border)" }}
          >
            <span style={{ color: "var(--admin-muted)", fontSize: "0.825rem" }}>
              Showing <strong style={{ color: "var(--admin-text)" }}>{indexOfFirstItem + 1}</strong> to{" "}
              <strong style={{ color: "var(--admin-text)" }}>
                {indexOfLastItem > totalItems ? totalItems : indexOfLastItem}
              </strong>{" "}
              of <strong style={{ color: "var(--admin-text)" }}>{totalItems}</strong> products
            </span>

            {totalPages > 1 && (
              <div className="admin-pagination d-flex align-items-center gap-1">
                <button
                  className="btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  <i className="bi bi-chevron-left me-1"></i> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn ${currentPage === page ? "btn-active" : ""}`}
                    style={{
                      minWidth: "34px",
                      background: currentPage === page ? "var(--admin-primary)" : "#fff",
                      borderColor: currentPage === page ? "var(--admin-primary)" : "var(--admin-border)",
                      color: currentPage === page ? "#fff" : "var(--admin-muted)",
                      fontWeight: currentPage === page ? 700 : 500,
                    }}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}