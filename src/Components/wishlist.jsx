import { useContext, useEffect } from "react";
import { Addtocart } from "./Usercontext";
import { Link } from "react-router-dom";

export function Wishlist() {
  const {
    products = [],
    wishlist = [],
    wishlistItems = [],
    wishlistLoading,
    remove,
    addtocart,
    loadWishlist,
    darkmode,
  } = useContext(Addtocart);

  useEffect(() => {
    if (loadWishlist) {
      loadWishlist();
    }
  }, [loadWishlist]);

  // Combine MongoDB Wishlist documents with rich product metadata if available
  const itemsToDisplay = wishlistItems.length > 0
    ? wishlistItems.map((wItem) => {
        const matchingProduct = products.find(
          (p) => String(p.firebaseId) === String(wItem.firebaseId) || String(p._id) === String(wItem.firebaseId)
        );
        return {
          ...wItem,
          ...(matchingProduct || {}),
          firebaseId: wItem.firebaseId || matchingProduct?.firebaseId,
          Title: matchingProduct?.Title || wItem.Title || "Product",
          image: matchingProduct?.image || wItem.image || "",
          price: matchingProduct?.price || wItem.price || 0,
          stock: matchingProduct ? matchingProduct.stock : 1,
        };
      })
    : products.filter((p) => wishlist.includes(p.firebaseId) || wishlist.includes(p._id));

  const cardBg = darkmode ? "#18181b" : "#ffffff";
  const borderCol = darkmode ? "1px solid #27272a" : "1px solid #f1f5f9";
  const textColor = darkmode ? "#f4f4f5" : "#0f172a";
  const subText = darkmode ? "#a1a1aa" : "#64748b";

  return (
    <div className="container py-3 py-md-4 px-2 px-md-3" style={{ color: textColor }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: textColor, letterSpacing: "-0.5px" }}>
            <i className="bi bi-heart-fill me-2" style={{ color: "#ef4444" }}></i>
            My Wishlist
          </h3>
          <p className="mb-0" style={{ color: subText, fontSize: "14px" }}>
            {itemsToDisplay.length === 0
              ? "Your saved items will appear here"
              : `${itemsToDisplay.length} item${itemsToDisplay.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
        {itemsToDisplay.length > 0 && (
          <span
            className="badge rounded-pill px-3 py-2 fw-semibold"
            style={{
              background: "rgba(239,68,68,0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.25)",
              fontSize: "13px",
            }}
          >
            {itemsToDisplay.length} Saved
          </span>
        )}
      </div>

      {/* Loading State */}
      {wishlistLoading && itemsToDisplay.length === 0 ? (
        <div
          className="text-center py-5 rounded-4"
          style={{ background: cardBg, border: borderCol }}
        >
          <div
            className="spinner-border mb-3"
            style={{ color: "#ff6b00", width: "2.5rem", height: "2.5rem" }}
            role="status"
          />
          <p className="mb-0 fw-medium" style={{ color: subText }}>
            Loading your wishlist from database…
          </p>
        </div>
      ) : itemsToDisplay.length === 0 ? (
        /* Empty State */
        <div
          className="text-center py-5 rounded-4 shadow-sm"
          style={{
            backgroundColor: cardBg,
            border: borderCol,
            minHeight: "340px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "30px 20px",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: "84px", height: "84px", background: "rgba(239,68,68,0.1)" }}
          >
            <i className="bi bi-heartbreak-fill" style={{ fontSize: "38px", color: "#ef4444" }}></i>
          </div>
          <div>
            <h5 className="fw-bold mb-1" style={{ color: textColor }}>
              Your wishlist is empty
            </h5>
            <p style={{ color: subText, fontSize: "14px", maxWidth: "280px", margin: "0 auto" }}>
              Save items you love so you can easily find them later and add them to your cart.
            </p>
          </div>
          <Link
            to="/Productpage"
            className="btn fw-bold rounded-pill px-4 py-2 text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #ff6b00, #e05e00)",
              border: "none",
              fontSize: "14px",
              boxShadow: "0 6px 20px rgba(255,107,0,0.35)",
            }}
          >
            <i className="bi bi-compass me-2"></i>Explore Products
          </Link>
        </div>
      ) : (
        /* Grid: 2 cards per row on mobile (col-6), 3 on tablet (col-md-4), 4 on desktop (col-lg-3) */
        <div className="row g-2 g-md-4">
          {itemsToDisplay.map((product) => {
            const prodId = product.firebaseId || product._id || product.id;
            const isOutOfStock = Number(product.stock) <= 0;
            const originalPrice = Number(product.price || 0);
            const discountPercentage = Number(product.discount || 0);
            const finalPrice =
              discountPercentage > 0
                ? originalPrice - (originalPrice * discountPercentage) / 100
                : originalPrice;

            return (
              <div
                key={prodId}
                className="col-6 col-md-4 col-lg-3 d-flex align-items-stretch"
              >
                <div
                  className="card h-100 border-0 shadow-sm w-100 position-relative d-flex flex-column"
                  style={{
                    backgroundColor: cardBg,
                    border: borderCol,
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* Image Container */}
                  <div
                    className="position-relative d-flex align-items-center justify-content-center p-2"
                    style={{
                      background: darkmode ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                      height: "150px",
                    }}
                  >
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                      <span
                        className="badge bg-danger position-absolute top-0 start-0 m-2 fw-semibold"
                        style={{ zIndex: 3, fontSize: "10px" }}
                      >
                        {discountPercentage}% OFF
                      </span>
                    )}

                    {/* Out of stock tag */}
                    {isOutOfStock && (
                      <span
                        className="badge bg-secondary position-absolute top-0 start-0 m-2 fw-semibold"
                        style={{ zIndex: 3, fontSize: "10px" }}
                      >
                        Out of Stock
                      </span>
                    )}

                    <Link
                      to={`/product/${prodId}`}
                      className="d-flex align-items-center justify-content-center w-100 h-100 text-decoration-none"
                    >
                      <img
                        className="img-fluid object-fit-contain p-1"
                        src={product.image || product.images?.[0]}
                        alt={product.Title}
                        style={{ maxHeight: "130px", width: "auto" }}
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%2327272a' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' fill='%2371717a' font-size='10' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </Link>

                    {/* Quick Remove from Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => remove(prodId)}
                      className="btn border-0 p-0 position-absolute d-flex align-items-center justify-content-center"
                      style={{
                        top: "8px",
                        right: "8px",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: darkmode ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.9)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        zIndex: 3,
                      }}
                      title="Remove from Wishlist"
                    >
                      <i className="bi bi-heart-fill text-danger" style={{ fontSize: "13px" }}></i>
                    </button>
                  </div>

                  {/* Content Container */}
                  <div className="p-2 p-md-3 d-flex flex-column flex-grow-1">
                    <Link
                      to={`/product/${prodId}`}
                      className="text-decoration-none"
                      style={{ color: textColor }}
                    >
                      <h6
                        className="fw-bold text-truncate mb-1"
                        title={product.Title}
                        style={{ fontSize: "13px" }}
                      >
                        {product.Title}
                      </h6>
                    </Link>

                    {/* Rating Section */}
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <div className="text-warning d-flex" style={{ fontSize: "10px" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={
                              star <= Math.round(product.rating || 0)
                                ? "bi bi-star-fill"
                                : "bi bi-star"
                            }
                          ></i>
                        ))}
                      </div>
                      <span style={{ fontSize: "10px", color: subText }}>
                        ({product.reviewCount || 0})
                      </span>
                    </div>

                    {/* Price & Stock Status */}
                    <div className="mt-auto">
                      <div className="d-flex align-items-baseline gap-1 flex-wrap mb-2">
                        <span className="fw-bold" style={{ color: "#ff6b00", fontSize: "15px" }}>
                          Rs {finalPrice.toFixed(2)}
                        </span>
                        {discountPercentage > 0 && (
                          <span
                            className="text-decoration-line-through text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            Rs {originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Move to Cart and Delete Actions */}
                      <div className="d-flex flex-column gap-1">
                        <button
                          disabled={isOutOfStock}
                          className="btn w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center py-1.5 px-2"
                          style={{
                            background: isOutOfStock
                              ? "#3f3f46"
                              : "linear-gradient(135deg, #ff6b00, #e05e00)",
                            color: "white",
                            border: "none",
                            fontSize: "12px",
                            cursor: isOutOfStock ? "not-allowed" : "pointer",
                          }}
                          onClick={() => {
                            addtocart(product);
                          }}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add to Cart
                        </button>

                        <button
                          className="btn w-100 fw-semibold rounded-pill d-flex align-items-center justify-content-center py-1 px-2"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "11px",
                          }}
                          onClick={() => remove(prodId)}
                        >
                          <i className="bi bi-trash3 me-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;