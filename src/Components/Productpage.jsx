import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Addtocart } from './Usercontext';

export function Productpage({ limit, customproducts }) {
  const { 
    products, 
    addtocart, 
    searchfilter, 
    searchword, 
    darkmode,  
    wishlist, 
    addtowislist, 
    remove 
  } = useContext(Addtocart);
  
  const [searchp] = useSearchParams();
  const newrl = searchp.get("search") || "";
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  let listdisplay;
  if (customproducts && customproducts.length > 0) {
    listdisplay = customproducts.filter((item) => {
      return item.Title?.toLowerCase().includes(newrl || searchword.toLocaleLowerCase());
    });
  } else if (searchword !== "") {
    listdisplay = searchfilter;
  } else {
    listdisplay = products;
  }

  const activeProductsDisplay = listdisplay.filter((item) => 
    item.status === "active" || item.status === undefined || item.status === ""
  );

  // Search ya Filter change hone par Page 1 par reset
  useEffect(() => {
    setCurrentPage(1);
  }, [searchword, newrl, customproducts]);

  // Pagination Logic
  const effectiveProducts = limit ? activeProductsDisplay.slice(0, limit) : activeProductsDisplay;
  const totalPages = Math.ceil(effectiveProducts.length / productsPerPage);
  
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = effectiveProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className='container py-2 py-md-4 px-2 px-md-3'>
      {/* Mobile standard grid: 2 cards per row (col-6) and Desktop: 4 cards per row (col-lg-3) */}
      <div className='row g-2 g-md-4'>
        {currentProducts && currentProducts.map((product) => {
          const isOutOfStock = Number(product.stock) <= 0;
          const originslprice = Number(product.price || 0);
          const discountPercentage = Number(product.discount || 0);
          const Finaleprice = discountPercentage > 0 ? originslprice - (originslprice * discountPercentage / 100) : originslprice; 
          const isWishlist = wishlist.includes(product.firebaseId);

          return (
            <div key={product.firebaseId} className='col-6 col-md-4 col-lg-3 d-flex align-items-stretch'>
              <div 
                className='card h-100 border-0 shadow-sm w-100 position-relative d-flex flex-column' 
                style={{ 
                  backgroundColor: darkmode ? "#18181b" : "#ffffff",
                  color: darkmode ? "#f0f0f0" : "#0f172a",
                  borderRadius: "14px",
                  overflow: "hidden"
                }} 
              >
                {/* Image Container */}
                <div 
                  className="position-relative d-flex align-items-center justify-content-center p-2"
                  style={{
                    background: darkmode ? "rgba(255, 255, 255, 0.05)" : "#f8fafc", 
                    height: "140px"
                  }}
                >
                  {/* Responsive Discount Badge */}
                  {discountPercentage > 0 && (
                    <span
                      className="badge bg-danger position-absolute top-0 start-0 m-2 fw-semibold"
                      style={{ zIndex: 3, fontSize: "10px" }}
                    >
                      {product.discount}% OFF
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

                  <Link to={`/product/${product.firebaseId}`} className="d-flex align-items-center justify-content-center w-100 h-100">
                    <img 
                      className='img-fluid object-fit-contain p-1' 
                      src={product.image} 
                      alt={product.Title} 
                      style={{ maxHeight: "120px", width: "auto" }} 
                    />
                  </Link>

                  {/* Wishlist Button Overlay */}
                  <button
                    type="button"
                    onClick={() => isWishlist ? remove(product.firebaseId) : addtowislist(product)}
                    className="btn border-0 p-0 position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      top: "8px",
                      right: "8px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: darkmode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                      zIndex: 3
                    }}
                    aria-label="Add to Wishlist"
                  >
                    <i 
                      className={`bi ${isWishlist ? 'bi-heart-fill text-danger' : 'bi-heart'}`}
                      style={{ fontSize: "13px" }}
                    ></i>
                  </button>
                </div>

                {/* Content Container */}
                <div className='p-2 p-md-3 d-flex flex-column flex-grow-1'>
                  <h6 
                    className="fw-bold text-truncate mb-1" 
                    title={product.Title}
                    style={{ fontSize: "13px" }}
                  >
                    {product.Title}
                  </h6>
                  
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
                    <span className="text-muted" style={{ fontSize: "10px" }}>
                      ({product.reviewCount || 0})
                    </span>
                  </div>

                  {/* Price & Stock status */}
                  <div className="mt-auto">
                    <div className="d-flex align-items-baseline gap-1 flex-wrap">
                      <span className="fw-bold" style={{ color: "#ff6b00", fontSize: "14px" }}>
                        Rs: {Finaleprice}
                      </span>
                      {discountPercentage > 0 && (
                        <span className="text-decoration-line-through text-muted" style={{ fontSize: "10px" }}>
                          {product.price}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 mb-2">
                      {isOutOfStock ? (
                        <span className="text-danger fw-medium" style={{ fontSize: "11px" }}>Out of Stock</span>
                      ) : (
                        <span className="text-success fw-medium" style={{ fontSize: "11px" }}>In Stock</span>
                      )}
                    </div>

                    {/* Action Button */}
                    {!isOutOfStock ? (
                      <button
                        className="btn w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center p-1 p-md-2"
                        style={{
                          background: "#ff6b00",
                          color: "white",
                          border: "none",
                          fontSize: "12px"
                        }}
                        onClick={() => {
                          if (product.stock <= 0) {
                            toast.error(`${product.Title} is out of stock`);
                            return;
                          }
                          addtocart(product);
                        }}
                      >
                        <i className="bi bi-cart-plus me-1"></i> Add
                      </button>
                    ) : (
                      <button 
                        className="btn w-100 rounded-pill p-1 p-md-2 fw-bold"
                        disabled
                        style={{
                          background: darkmode ? "#27272a" : "#e2e8f0",
                          color: darkmode ? "#71717a" : "#94a3b8",
                          border: "none",
                          fontSize: "12px"
                        }}
                      >
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {listdisplay.length === 0 && (
          <div className="col-12 text-center py-5">
            <i className="bi bi-search fs-1 text-muted d-block mb-2"></i>
            <h5 className="text-muted">No products match your search.</h5>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-1 gap-md-2 mt-4">
          <button
            className="btn btn-sm rounded-pill px-2 px-md-3 shadow-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              backgroundColor: darkmode ? "#27272a" : "#ffffff",
              color: darkmode ? "#ffffff" : "#000000",
              border: "1px solid #e4e4e7",
              opacity: currentPage === 1 ? 0.5 : 1,
              fontSize: "12px"
            }}
          >
            <i className="bi bi-chevron-left me-1"></i> Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className="btn btn-sm rounded-circle fw-bold shadow-sm p-0"
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: currentPage === pageNum ? "#ff6b00" : (darkmode ? "#27272a" : "#ffffff"),
                color: currentPage === pageNum ? "#ffffff" : (darkmode ? "#ffffff" : "#000000"),
                border: currentPage === pageNum ? "none" : "1px solid #e4e4e7",
                fontSize: "12px",
                transition: "all 0.2s ease"
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            className="btn btn-sm rounded-pill px-2 px-md-3 shadow-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              backgroundColor: darkmode ? "#27272a" : "#ffffff",
              color: darkmode ? "#ffffff" : "#000000",
              border: "1px solid #e4e4e7",
              opacity: currentPage === totalPages ? 0.5 : 1,
              fontSize: "12px"
            }}
          >
            Next <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      )}
    </div>
  );
}