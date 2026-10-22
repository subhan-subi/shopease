import { Link } from "react-router-dom";
import { useRef, useState, useContext } from "react";
import { Addtocart } from "./Usercontext";
import { toast } from "react-toastify";

export function Slider() {
  const { products, addtocart, darkmode } = useContext(Addtocart);
  const scrollref = useRef(null);
  const [dot, setdot] = useState(0);

  function handledot() {
    if (scrollref.current) {
      const { scrollLeft, clientWidth } = scrollref.current;
      const index = Math.round(scrollLeft / clientWidth);
      if (index <= 10) {
        setdot(index);
      } else {
        setdot(1);
      }
    }
  }

  function handlearrow(direction) {
    if (scrollref.current) {
      const { clientWidth } = scrollref.current;
      const samount = direction === "left" ? -clientWidth : clientWidth;
      scrollref.current.scrollBy({ left: samount, behavior: "smooth" });
    }
  }

  function scrollToProduct(dotindex) {
    if (scrollref.current) {
      const { clientWidth } = scrollref.current;
      scrollref.current.scrollTo({
        left: clientWidth * dotindex,
        behavior: "smooth",
      });
      setdot(dotindex);
    }
  }

  // Filter ONLY active products that have a discount (> 0)
  const activeProductsDisplay = products.filter(
    (item) =>
      (item.status === "active" ||
        item.status === undefined ||
        item.status === "") &&
      Number(item.discount || 0) > 0
  );

  return (
    <div className="container pt-5">
      <h4
        className="fw-bold mb-4"
        style={{ color: darkmode ? "white" : "black" }}
      >
        <i className="bi bi-fire text-warning"></i> Hot Discounted Products
      </h4>

      {/* Flex container wrapping Left Button + Cards Container + Right Button */}
      <div className="d-flex align-items-center gap-2">
        {/* Left Arrow Button */}
        <button
          className="btn rounded-circle shadow-sm flex-shrink-0"
          onClick={() => handlearrow("left")}
          style={{
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ff6b00",
            border: "none",
          }}
          aria-label="Scroll Left"
        >
          <i className="bi bi-chevron-left fw-bold fs-5 text-white"></i>
        </button>

        {/* Cards Scroll Container */}
        <div
          ref={scrollref}
          onScroll={handledot}
          className="d-flex scroll-smooth flex-nowrap overflow-x-auto p-2 gap-3 flex-grow-1 scrol"
          style={{
            scrollSnapType: "x mandatory",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {activeProductsDisplay.map((product) => {
            const isOutOfStock = Number(product.stock) <= 0;
            const originslprice = Number(product.price || 0);
            const discountPercentage = Number(product.discount || 0);
            const Finaleprice =
              discountPercentage > 0
                ? originslprice - (originslprice * discountPercentage) / 100
                : originslprice;

            return (
              <div
                key={product.id || product.firebaseId}
                className="col-11 col-sm-6 col-md-4 col-lg-3 flex-shrink-0"
                style={{ scrollSnapAlign: "start" }}
              >
                <div
                  className="card h-100 shadow-sm border-0"
                  style={{
                    background: darkmode
                      ? "rgba(230, 236, 236, 0.1)"
                      : "#ffffff",
                    color: darkmode ? "white" : "black",
                    borderRadius: "16px",
                    border: darkmode
                      ? "1px solid rgba(255,255,255,0.1)"
                      : "1px solid #eee",
                  }}
                >
                  {/* Original Image Background Container Restored */}
                  <div
                    style={{
                      background: darkmode ? "rgb(254, 254, 254)" : "#f0f0f0ff",
                      borderRadius: "14px 14px 0 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      height: "180px",
                      overflow: "hidden",
                    }}
                  >
                    {Number(product.discount) > 0 && (
                      <span
                        className="badge bg-danger position-absolute top-0 start-0 m-2 fw-semibold"
                        style={{ zIndex: 3 }}
                      >
                        {product.discount}% OFF
                      </span>
                    )}
                    <Link
                      to={`/product/${product.firebaseId}`}
                      className="d-flex align-items-center justify-content-center w-100 h-100"
                    >
                      <img
                        className="img-fluid object-fit-contain p-2"
                        src={
                          Array.isArray(product.image)
                            ? product.image[0]
                            : product.image
                        }
                        alt={product.Title}
                        style={{ maxHeight: "160px" }}
                      />
                    </Link>

                    {/* Out of Stock Badge */}
                    {isOutOfStock && (
                      <span
                        className="badge bg-danger position-absolute"
                        style={{
                          top: "10px",
                          left: "10px",
                          zIndex: 2,
                          fontSize: "11px",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="px-3 py-3 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <h5
                        className="fw-bold fs-6 text-truncate mb-1"
                        title={product.Title}
                      >
                        {product.Title}
                      </h5>
                      <div
                        className="text-warning d-flex gap-1 mb-1"
                        style={{ fontSize: "13px" }}
                      >
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
                        <small
                          className=" ms-auto mb-2"
                          style={{ fontSize: "12px", color: darkmode ? "#f0f0f0ff" : "black" }}
                        >
                          {product.rating || 0} ({product.reviewCount || 0}{" "}
                          Reviews)
                        </small>
                      </div>

                      <div
                        className="fw-bold d-flex align-items-center gap-2 mb-3 mt-1"
                        style={{ color: darkmode ? "#ff6b00" : "#ff6b00" }}
                      >
                        Rs: {Finaleprice.toFixed(2)}
                        {discountPercentage > 0 && (
                          <span
                            className="text-decoration-line-through ms-auto"
                            style={{ fontSize: "12px",color: darkmode ? "#f0f0f0ff" : "black" }}
                          >
                            Rs: {originslprice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className={`btn w-100 fw-bold rounded-pill shadow-sm ${
                        isOutOfStock
                          ? "btn-secondary"
                          : product.added
                          ? "btn-success"
                          : ""
                      }`}
                      style={{
                        background: isOutOfStock
                          ? "#6c757d"
                          : product.added
                          ? ""
                          : "#ff6b00",
                        color: "white",
                        border: "none",
                        opacity: isOutOfStock ? 0.7 : 1,
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        fontSize: "13px",
                      }}
                      onClick={() => {
                        if (isOutOfStock) {
                          toast.error(`${product.Title} is out of stock`);
                          return;
                        }

                        addtocart(product);
                      }}
                    >
                      {isOutOfStock ? (
                        <>
                          <i className="bi bi-x-circle me-2"></i>
                          Out of Stock
                        </>
                      ) : product.added ? (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Added ✓
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-2"></i>
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          className="btn rounded-circle shadow-sm flex-shrink-0"
          onClick={() => handlearrow("right")}
          style={{
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ff6b00",
            border: "none",
          }}
          aria-label="Scroll Right"
        >
          <i className="bi bi-chevron-right fw-bold fs-5 text-white"></i>
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            onClick={() => scrollToProduct(d)}
            style={{
              width: dot === d ? "22px" : "8px",
              height: "8px",
              background: dot === d ? "#ff6b00" : "#cbd5e1",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
            }}
          ></span>
        ))}
      </div>
    </div>
  );
}