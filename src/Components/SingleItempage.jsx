import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Addtocart } from "./Usercontext";
import { getProductReviews } from "../services/reviewService";

// ── Shared Breadcrumb ────────────────────────────────────────────────────────
function Breadcrumb({ items, darkmode }) {
  const subText = darkmode ? "#a1a1aa" : "#64748b";
  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0 d-flex flex-wrap align-items-center" style={{ fontSize: "13px", gap: "2px" }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumb-item${isLast ? " active" : ""}`}>
              {isLast ? (
                <span className="fw-semibold text-truncate" style={{ color: "#ff6b00", maxWidth: "180px", display: "inline-block", verticalAlign: "bottom" }}>{item.label}</span>
              ) : (
                <>
                  <Link to={item.to} style={{ color: subText, textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                    onMouseLeave={e => (e.target.style.color = subText)}>
                    {item.label}
                  </Link>
                  <i className="bi bi-chevron-right" style={{ fontSize: "10px", color: darkmode ? "#3f3f46" : "#cbd5e1", margin: "0 5px" }} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const formatReviewDate = (dateVal) => {
  if (!dateVal) return "Recent";
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? "Recent" : d.toLocaleDateString();
};

export function SingleItempage() {
  const navigate = useNavigate();
  const {
    products,
    addtocart,
    darkmode,
    cartItems,
    productLoading,
    addtowislist,
    remove,
    isProductInWishlist,
    updateCartQuantity,
  } = useContext(Addtocart);

  const { id } = useParams();
  const [Dis, setDis] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [mainimg, setmainimg] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);

  const pro = products.find((item) => item.firebaseId === id);

  const productImages = pro?.images?.length
    ? pro.images
    : pro?.image
    ? [pro.image]
    : [];

  useEffect(() => {
    if (pro?.image) {
      setmainimg(pro.image);
    }
  }, [pro]);

  useEffect(() => {
    async function loadReviews() {
      if (id) {
        const data = await getProductReviews(id);
        setReviews(data);
      }
    }
    loadReviews();
  }, [id]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + Number(item.rating), 0) /
          reviews.length
        ).toFixed(1)
      : 0;

  if (productLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border" style={{ color: "#ff6b00" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="ms-3 mb-0 fw-semibold" style={{ color: darkmode ? "#fff" : "#000" }}>
          Loading product...
        </h4>
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="text-center py-5 my-5" style={{ color: darkmode ? "#fff" : "#000" }}>
        <i className="bi bi-exclamation-circle text-muted fs-1 d-block mb-3"></i>
        <h3 className="fw-bold">Product not found</h3>
      </div>
    );
  }

  async function Increas(id) {
    const item = cartItems.find((item) => item.firebaseId === id);
    if (item) {
      await updateCartQuantity(id, item.qty + 1);
    }
  }

  async function decrease(id) {
    const item = cartItems.find((item) => item.firebaseId === id);
    if (item && item.qty > 1) {
      await updateCartQuantity(id, item.qty - 1);
    }
  }

  const currentQty =
    cartItems.find((item) => item.firebaseId === pro.firebaseId)?.qty || 1;

  // Dynamic Dark/Light Theme System
  const textColor = darkmode ? "#ffffff" : "#1a1a1a";
  const subTextColor = darkmode ? "#a1a1aa" : "#64748b";
  const cardBg = darkmode ? "#121212" : "#f8fafc";
  const borderStyle = darkmode ? "1px solid #27272a" : "1px solid #e2e8f0";
  const innerCardBg = darkmode ? "#18181b" : "#ffffff";

  // Build breadcrumb crumbs from product category fields
  function slugify(t) { return t?.toLowerCase().replace(/\s+/g, "-") || ""; }

  const crumbs = [{ label: "Home", to: "/" }];
  if (pro.Cetagory) {
    crumbs.push({ label: pro.Cetagory, to: `/category/${slugify(pro.Cetagory)}` });
  }
  if (pro.subCetagory) {
    crumbs.push({ label: pro.subCetagory, to: `/category/${slugify(pro.Cetagory)}/${slugify(pro.subCetagory)}` });
  }
  if (pro.frsubCategory) {
    crumbs.push({ label: pro.frsubCategory, to: `/category/${slugify(pro.Cetagory)}/${slugify(pro.subCetagory)}/${slugify(pro.frsubCategory)}` });
  }
  crumbs.push({ label: pro.Title2 || pro.Title || "Product" });

  return (
    <div className="container py-4" style={{ color: textColor }}>
      <Breadcrumb items={crumbs} darkmode={darkmode} />
      <div className="row g-4 align-items-start">
        {/* Gallery Section - Only Image justification updated */}
        <div className="col-lg-6 col-12">
          {pro?.image && (
            <div className="d-flex flex-column gap-3">
              {/* Main Image View */}
              <div
                className="w-100 overflow-hidden shadow-sm d-flex justify-content-center align-items-center"
                style={{
                  borderRadius: "20px",
                  border: borderStyle,
                  background: darkmode ? "#141414" : "#f1f5f9",
                }}
              >
                <img
                  src={mainimg || pro.image}
                  alt={pro.Title2 || "Product"}
                  style={{
                    height: "420px",
                    width: "100%",
                    objectFit: "contain",
                    transition: "all 0.3s ease-in-out",
                  }}
                  className="img-fluid p-2"
                />
              </div>

              {/* Thumbnails List - Centered */}
              <div className="d-flex justify-content-center gap-2 overflow-auto py-1">
                {productImages.map((img, index) => {
                  const isSelected = mainimg === img;
                  return (
                    <img
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      onClick={() => setmainimg(img)}
                      style={{
                        width: "75px",
                        height: "75px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        cursor: "pointer",
                        border: isSelected ? "3px solid #ff6b00" : borderStyle,
                        opacity: isSelected ? 1 : 0.6,
                        transition: "all 0.2s ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="col-lg-6 col-12 d-flex flex-column gap-3">
          {/* Category & Badges */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="px-3 py-1 text-uppercase fw-bold"
              style={{
                fontSize: "12px",
                letterSpacing: "0.5px",
                backgroundColor: "#ff6b00",
                color: "#ffffff",
                borderRadius: "50px",
              }}
            >
              {pro.Cetagory}
            </span>

            <span
              className="px-3 py-1 fw-semibold"
              style={{
                fontSize: "12px",
                backgroundColor: darkmode ? "rgba(255, 107, 0, 0.15)" : "#fff3eb",
                color: "#ff6b00",
                borderRadius: "50px",
                border: "1px solid #ff6b00",
              }}
            >
              In Stock
            </span>

            <span
              className="px-3 py-1 fw-semibold"
              style={{
                fontSize: "12px",
                backgroundColor: darkmode ? "#27272a" : "#000000",
                color: "#ffffff",
                borderRadius: "50px",
              }}
            >
              Best Seller
            </span>
          </div>

          <h1 className="fw-bold m-0" style={{ letterSpacing: "-0.5px", fontSize: "clamp(1.2rem, 3vw, 1.75rem)", lineHeight: 1.3, color: textColor }}>
            {pro.Title2 || pro.Title || "Product"}
          </h1>

          {/* Customer Reviews Rating Bar */}
          <div className="d-flex align-items-center gap-2">
            <div style={{ color: "#ff6b00" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={
                    star <= Math.round(averageRating)
                      ? "bi bi-star-fill me-1 fs-6"
                      : "bi bi-star me-1 fs-6 text-muted"
                  }
                ></i>
              ))}
            </div>
            <span className="fw-bold">{averageRating}</span>
            <span style={{ color: subTextColor }}>({reviews.length} customer reviews)</span>
          </div>

          {/* Price Section */}
          <div className="d-flex align-items-baseline gap-3 my-1">
            <h2 className="fw-bold fs-1 m-0" style={{ color: "#ff6b00" }}>
              Rs {pro.price}
            </h2>
            {pro.compare && (
              <span
                className="text-decoration-line-through fs-5 fw-normal"
                style={{ color: subTextColor }}
              >
                Rs {pro.compare}
              </span>
            )}
            {pro.prst && (
              <span
                className="badge px-2 py-1"
                style={{
                  backgroundColor: "#ff6b00",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              >
                {pro.prst}
              </span>
            )}
          </div>

          {/* Availability Indicator */}
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                height: "10px",
                width: "10px",
                backgroundColor: "#ff6b00",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>
            <span className="fw-medium">Ready to ship</span>
          </div>

          {/* Feature Cards */}
          <div className="row g-2 py-2">
            <div className="col-4">
              <div
                className="p-3 text-center rounded-4 h-100 d-flex flex-column align-items-center justify-content-center gap-1"
                style={{ background: cardBg, border: borderStyle }}
              >
                <i className="bi bi-gift-fill fs-3" style={{ color: "#ff6b00" }}></i>
                <small className="fw-semibold">Free Shipping</small>
              </div>
            </div>

            <div className="col-4">
              <div
                className="p-3 text-center rounded-4 h-100 d-flex flex-column align-items-center justify-content-center gap-1"
                style={{ background: cardBg, border: borderStyle }}
              >
                <i
                  className="bi bi-truck-front-fill fs-3"
                  style={{ color: "#ff6b00" }}
                ></i>
                <small className="fw-semibold">Fast Delivery</small>
              </div>
            </div>

            <div className="col-4">
              <div
                className="p-3 text-center rounded-4 h-100 d-flex flex-column align-items-center justify-content-center gap-1"
                style={{ background: cardBg, border: borderStyle }}
              >
                <i
                  className="bi bi-shield-fill-plus fs-3"
                  style={{ color: "#ff6b00" }}
                ></i>
                <small className="fw-semibold">1 Year Warranty</small>
              </div>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="d-flex flex-column gap-2 mt-2">
            <label className="fw-semibold fs-6">Quantity</label>
            <div
              className="d-flex align-items-center justify-content-between p-1"
              style={{
                border: borderStyle,
                borderRadius: "12px",
                width: "130px",
                background: cardBg,
              }}
            >
              <button
                className="btn btn-sm border-0 fw-bold px-3"
                style={{ color: textColor }}
                onClick={() => decrease(pro.firebaseId)}
              >
                -
              </button>
              <span className="fw-bold">{currentQty}</span>
              <button
                className="btn btn-sm border-0 fw-bold px-3"
                style={{ color: textColor }}
                onClick={() => {
                  if (currentQty < pro.stock) {
                    Increas(pro.firebaseId);
                  } else {
                    toast.error(`Only ${pro.stock} items available`);
                  }
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 pt-3 flex-wrap">
            <button
              disabled={pro.stock <= 0}
              onClick={() => addtocart(pro)}
              className="btn fw-bold rounded-pill px-4 py-3 flex-grow-1 shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: pro.stock <= 0 ? "#6c757d" : "#ff6b00",
                color: "#ffffff",
                border: "none",
                transition: "all 0.2s ease",
                cursor: pro.stock <= 0 ? "not-allowed" : "pointer",
              }}
            >
              {pro.stock <= 0 ? (
                <>
                  <i className="bi bi-x-circle fs-5"></i> Out of Stock
                </>
              ) : (
                <>
                  <i className="bi bi-cart-plus fs-5"></i> Add To Cart
                </>
              )}
            </button>

            <Link to="/Order" className="flex-grow-1 text-decoration-none">
              <button
                className="btn fw-bold rounded-pill px-4 py-3 w-100"
                style={{
                  border: `2px solid ${darkmode ? "#ffffff" : "#000000"}`,
                  color: textColor,
                  backgroundColor: "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                Buy Now
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className="mt-5 d-flex flex-column gap-4">
        {/* Product Description Accordion */}
        <div
          className="p-4 rounded-4 shadow-sm"
          style={{
            border: borderStyle,
            backgroundColor: cardBg,
          }}
        >
          <div
            className="d-flex justify-content-between align-items-center cursor-pointer"
            onClick={() => setDis(!Dis)}
            style={{ cursor: "pointer" }}
          >
            <h4 className="fw-bold m-0">Product Description</h4>
            <i
              className={`bi bi-chevron-${Dis ? "up" : "down"} fs-5`}
              style={{ color: "#ff6b00" }}
            ></i>
          </div>

          {Dis && (
            <div
              className="mt-3 pt-3 border-top"
              style={{ borderColor: darkmode ? "#27272a" : "#e2e8f0" }}
            >
              <p className="m-0" style={{ lineHeight: "1.7", color: textColor }}>
                {pro.Discription}
              </p>
            </div>
          )}
        </div>

        {/* Customer Reviews */}
        <div
          className="p-4 rounded-4 shadow-sm"
          style={{
            border: borderStyle,
            backgroundColor: cardBg,
          }}
        >
          <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
            Customer Reviews <span style={{ color: "#ff6b00" }}>⭐</span>
          </h3>

          {reviews.length === 0 ? (
            <p className="m-0" style={{ color: subTextColor }}>
              No reviews yet. Be the first one to review this product.
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-3 rounded-3"
                  style={{
                    backgroundColor: innerCardBg,
                    border: borderStyle,
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold m-0">{review.userName}</h6>
                    <small style={{ color: subTextColor }}>
                      {formatReviewDate(review.createdAt)}
                    </small>
                  </div>

                  <div className="mb-2" style={{ color: "#ff6b00" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={
                          star <= Number(review.rating)
                            ? "bi bi-star-fill me-1"
                            : "bi bi-star me-1 text-muted"
                        }
                      ></i>
                    ))}
                  </div>

                  <p className="m-0" style={{ color: textColor }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}