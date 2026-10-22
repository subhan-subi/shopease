import { useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Addtocart } from "./Usercontext";
import {calculateTotalPrice} from "../../src/CartUtils";
export function ItemCart() {
  const {
    darkmode,
    cartItems = [],
    cartLoading,
    removeFromCart,
    updateCartQuantity,
  } = useContext(Addtocart);

  const totalcart = cartItems.length;
  const totalQuantity = cartItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  // const totalprice = cartItems.reduce(
  //   (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
  //   0
  // );

const totalprice = calculateTotalPrice(cartItems);

  const handleIncrease = (item) => {
    const id = item.firebaseId || item.id;
    const currentQty = Number(item.qty) || 1;
    const stockLimit = Number(item.stock) || 999;

    if (currentQty >= stockLimit) {
      toast.warning(`Only ${stockLimit} unit${stockLimit === 1 ? "" : "s"} available in stock.`);
      return;
    }
    updateCartQuantity(id, currentQty + 1);
  };

  const handleDecrease = (item) => {
    const id = item.firebaseId || item.id;
    const currentQty = Number(item.qty) || 1;
    if (currentQty <= 1) {
      removeFromCart(id);
      return;
    }
    updateCartQuantity(id, currentQty - 1);
  };

  const cardBg = darkmode ? "#18181b" : "#ffffff";
  const borderCol = darkmode ? "1px solid #27272a" : "1px solid #f1f5f9";
  const textColor = darkmode ? "#f4f4f5" : "#0f172a";
  const subText = darkmode ? "#a1a1aa" : "#64748b";

  return (
    <div className="container py-3 py-md-4" style={{ color: textColor }}>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="fw-bold mb-1" style={{ color: textColor, letterSpacing: "-0.5px" }}>
            <i className="bi bi-cart4 me-2" style={{ color: "#ff6b00" }}></i>
            Shopping Cart
          </h3>
          <p className="mb-0" style={{ color: subText, fontSize: "14px" }}>
            {totalcart === 0
              ? "Your cart is currently empty"
              : `${totalQuantity} item${totalQuantity !== 1 ? "s" : ""} selected`}
          </p>
        </div>
        {totalcart > 0 && (
          <span
            className="badge rounded-pill px-3 py-2 fw-semibold"
            style={{
              background: "rgba(255,107,0,0.12)",
              color: "#ff6b00",
              border: "1px solid rgba(255,107,0,0.25)",
              fontSize: "13px",
            }}
          >
            {totalcart} unique product{totalcart !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="row g-4">
        {/* Left: Cart Items List */}
        <div className="col-12 col-lg-7">
          {cartLoading ? (
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
                Loading your cart from database…
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            <div
              className="text-center py-5 rounded-4"
              style={{
                background: cardBg,
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
                style={{
                  width: "84px",
                  height: "84px",
                  background: "rgba(255,107,0,0.1)",
                }}
              >
                <i className="bi bi-cart-x fs-1" style={{ color: "#ff6b00" }}></i>
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: textColor }}>
                  Your cart is empty
                </h5>
                <p
                  style={{
                    color: subText,
                    fontSize: "14px",
                    maxWidth: "280px",
                    margin: "0 auto",
                  }}
                >
                  Explore our collection and discover top-rated tech and fashion deals.
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
                <i className="bi bi-bag me-2"></i>Start Shopping
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {cartItems.map((item) => {
                const itemId = item.firebaseId || item.id;
                const price = Number(item.price) || 0;
                const qty = Number(item.qty) || 1;
                const subtotal = price * qty;

                return (
                  <div
                    key={itemId}
                    className="d-flex align-items-center gap-3 p-3 rounded-4 position-relative"
                    style={{
                      background: cardBg,
                      border: borderCol,
                      boxShadow: darkmode ? "none" : "0 2px 10px rgba(0,0,0,0.03)",
                      transition: "transform 0.2s ease, border-color 0.2s ease",
                    }}
                  >
                    {/* Product Image Thumbnail */}
                    <Link to={`/product/${itemId}`} className="flex-shrink-0 text-decoration-none">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 overflow-hidden"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: darkmode ? "rgba(255,255,255,0.04)" : "#f8fafc",
                          border: borderCol,
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.Title || "Product"}
                          style={{
                            maxWidth: "70px",
                            maxHeight: "70px",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Crect fill='%2327272a' width='70' height='70'/%3E%3Ctext x='50%25' y='50%25' fill='%2371717a' font-size='10' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </Link>

                    {/* Item Info */}
                    <div className="flex-grow-1 min-w-0">
                      <Link
                        to={`/product/${itemId}`}
                        className="text-decoration-none d-block mb-1"
                      >
                        <h6
                          className="fw-bold mb-0 text-truncate"
                          style={{ color: textColor, fontSize: "14px" }}
                          title={item.Title}
                        >
                          {item.Title || "Untitled Product"}
                        </h6>
                      </Link>

                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold" style={{ color: "#ff6b00", fontSize: "15px" }}>
                          Rs {price.toFixed(2)}
                        </span>
                        {item.stock && item.stock <= 5 && (
                          <span
                            className="badge text-warning"
                            style={{
                              background: "rgba(245,158,11,0.12)",
                              fontSize: "10px",
                              padding: "2px 6px",
                            }}
                          >
                            Only {item.stock} left
                          </span>
                        )}
                      </div>

                      <div style={{ color: subText, fontSize: "12px" }}>
                        Subtotal:{" "}
                        <strong style={{ color: textColor }}>Rs {subtotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div
                      className="d-flex align-items-center rounded-pill flex-shrink-0"
                      style={{
                        border: borderCol,
                        background: darkmode ? "rgba(255,255,255,0.03)" : "#f8fafc",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => handleDecrease(item)}
                        className="btn border-0 fw-bold px-3 py-1"
                        style={{
                          color: textColor,
                          background: "transparent",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                        title="Decrease quantity"
                      >
                        −
                      </button>
                      <span
                        className="fw-bold px-1"
                        style={{
                          color: textColor,
                          minWidth: "26px",
                          textAlign: "center",
                          fontSize: "13px",
                        }}
                      >
                        {qty}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="btn border-0 fw-bold px-3 py-1"
                        style={{
                          color: "#ff6b00",
                          background: "transparent",
                          fontSize: "16px",
                          lineHeight: 1,
                        }}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="btn rounded-3 flex-shrink-0"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "#ef4444",
                        padding: "7px 10px",
                      }}
                      title="Remove from cart"
                    >
                      <i className="bi bi-trash3-fill" style={{ fontSize: "13px" }}></i>
                    </button>
                  </div>
                );
              })}

              {/* Continue Shopping Link */}
              <div className="text-start mt-2">
                <Link
                  to="/Productpage"
                  className="fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
                  style={{ color: "#ff6b00", fontSize: "14px" }}
                >
                  <i className="bi bi-arrow-left"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary Card */}
        <div className="col-12 col-lg-5">
          <div
            className="rounded-4 p-4 sticky-top"
            style={{
              background: cardBg,
              border: borderCol,
              top: "90px",
              boxShadow: darkmode ? "none" : "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h5 className="fw-bold mb-0" style={{ color: textColor }}>
                Order Summary
              </h5>
              <span
                className="badge rounded-pill px-2 py-1"
                style={{
                  background: "rgba(255,107,0,0.12)",
                  color: "#ff6b00",
                  fontSize: "11px",
                }}
              >
                {totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Quick Item List Breakdown */}
            {cartItems.length > 0 ? (
              <div
                className="mb-3 rounded-3 p-2"
                style={{
                  overflowY: "auto",
                  maxHeight: "220px",
                  background: darkmode ? "rgba(255,255,255,0.02)" : "#f8fafc",
                  border: borderCol,
                }}
              >
                {cartItems.map((item) => (
                  <div
                    key={item.firebaseId || item.id}
                    className="d-flex align-items-center justify-content-between py-2 px-1"
                    style={{
                      borderBottom: `1px solid ${darkmode ? "#27272a" : "#f1f5f9"}`,
                    }}
                  >
                    <div className="flex-grow-1 min-w-0 pe-2">
                      <p
                        className="mb-0 text-truncate fw-medium"
                        style={{ fontSize: "13px", color: textColor }}
                      >
                        {item.Title}
                      </p>
                      <span style={{ fontSize: "12px", color: subText }}>
                        Qty: {item.qty}
                      </span>
                    </div>
                    <span
                      className="fw-semibold flex-shrink-0"
                      style={{ fontSize: "13px", color: "#ff6b00" }}
                    >
                      Rs {((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Breakdown */}
            <div className="d-flex flex-column gap-2 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: subText, fontSize: "14px" }}>Subtotal</span>
                <span className="fw-semibold" style={{ color: textColor, fontSize: "14px" }}>
                  Rs {totalprice.toFixed(2)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: subText, fontSize: "14px" }}>Estimated Shipping</span>
                <span className="fw-semibold" style={{ color: "#10b981", fontSize: "14px" }}>
                  <i className="bi bi-truck me-1"></i>FREE
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ color: subText, fontSize: "14px" }}>Sales Tax</span>
                <span className="fw-semibold" style={{ color: textColor, fontSize: "14px" }}>
                  Rs 0.00
                </span>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: "1px",
                background: darkmode ? "#27272a" : "#f1f5f9",
                marginBottom: "16px",
              }}
            />

            {/* Total */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold" style={{ color: textColor, fontSize: "16px" }}>
                Total Due
              </span>
              <span className="fw-bold" style={{ color: "#ff6b00", fontSize: "22px" }}>
                Rs {totalprice.toFixed(2)}
              </span>
            </div>

            {/* Checkout CTA */}
            <Link to="/order" className="text-decoration-none">
              <button
                disabled={cartItems.length === 0}
                className="btn fw-bold w-100 py-3 rounded-3 text-white d-flex align-items-center justify-content-center gap-2"
                style={{
                  background:
                    cartItems.length === 0
                      ? "#3f3f46"
                      : "linear-gradient(135deg, #ff6b00, #e05e00)",
                  border: "none",
                  fontSize: "15px",
                  boxShadow:
                    cartItems.length === 0
                      ? "none"
                      : "0 6px 20px rgba(255,107,0,0.35)",
                  cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <i className="bi bi-shield-lock-fill"></i>
                Proceed to Checkout
                <i className="bi bi-arrow-right"></i>
              </button>
            </Link>

            {/* Trust Badges */}
            <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">
              {[
                { icon: "bi-shield-check", text: "Secure Checkout", color: "#10b981" },
                { icon: "bi-truck", text: "Free Delivery", color: "#3b82f6" },
                { icon: "bi-arrow-counterclockwise", text: "Easy Returns", color: "#f59e0b" },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="d-flex align-items-center gap-1"
                  style={{ fontSize: "11px", color: subText }}
                >
                  <i className={`bi ${badge.icon}`} style={{ color: badge.color }}></i>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemCart;