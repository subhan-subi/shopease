import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { Addtocart } from "../Components/Usercontext";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  addProduct,
  getProducts,
  updateProduct,
} from "../services/productService";
import { getCategories } from "../services/categoryService";

// ─── Accepted image MIME types & max size ──────────────────────────────────
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_FILE_SIZE_MB = 10;

// ─── Star rating renderer (read-only) ──────────────────────────────────────
function StarRating({ value = 0 }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: "13px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <i key={s} className={`bi bi-star${s <= Math.round(value) ? "-fill" : s - 0.5 <= value ? "-half" : ""}`} />
      ))}
      <span className="text-muted ms-1" style={{ fontSize: "11px" }}>({value.toFixed(1)})</span>
    </span>
  );
}

// ─── Image thumbnail card ───────────────────────────────────────────────────
function ImageThumb({ src, index, total, onRemove, onDragStart, onDragOver, onDrop, isDragging }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      style={{
        width: "100px",
        flexShrink: 0,
        cursor: "grab",
        opacity: isDragging ? 0.45 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div
        className="position-relative rounded-2 overflow-hidden border"
        style={{ height: "90px", background: "#f8f9fa" }}
      >
        {/* Main badge */}
        {index === 0 && (
          <span
            className="position-absolute bottom-0 start-0 end-0 text-center py-1 fw-bold"
            style={{
              background: "rgba(255,107,0,0.88)",
              color: "#fff",
              fontSize: "9px",
              letterSpacing: "0.5px",
              zIndex: 3,
            }}
          >
            MAIN
          </span>
        )}
        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="position-absolute top-0 end-0 m-1 btn btn-sm p-0 d-flex align-items-center justify-content-center"
          style={{
            width: "20px", height: "20px",
            background: "rgba(0,0,0,0.6)",
            color: "#fff", borderRadius: "50%",
            fontSize: "11px", zIndex: 4,
          }}
        >
          <i className="bi bi-x" />
        </button>
        {/* Drag handle */}
        <div
          className="position-absolute top-0 start-0 m-1"
          style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", zIndex: 4, cursor: "grab" }}
        >
          <i className="bi bi-grip-vertical" />
        </div>
        <img
          src={src}
          alt={`img-${index}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='90'%3E%3Crect fill='%23e9ecef' width='100' height='90'/%3E%3Ctext x='50%25' y='50%25' fill='%23adb5bd' font-size='11' text-anchor='middle' dy='.3em'%3EError%3C/text%3E%3C/svg%3E"; }}
        />
      </div>
      <div className="text-center mt-1" style={{ fontSize: "10px", color: "#6c757d" }}>
        #{index + 1} of {total}
      </div>
    </div>
  );
}

// ─── No-image placeholder SVG ──────────────────────────────────────────────
const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f1f3f5' width='400' height='300'/%3E%3Ctext x='50%25' y='45%25' fill='%23adb5bd' font-size='18' text-anchor='middle' dy='.3em'%3E📷%3C/text%3E%3Ctext x='50%25' y='62%25' fill='%23ced4da' font-size='13' text-anchor='middle'%3ENo image selected%3C/text%3E%3C/svg%3E";

export function Addform() {
  const { id } = useParams();
  const { setproducts, allcategories, setallcategoris } = useContext(Addtocart);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const Navigate = useNavigate();

  // ── Image state: array of { file?: File, url: string, isExisting: bool }
  const [imageItems, setImageItems] = useState([]);
  // ── Preview image index (for preview panel clicking thumbnail)
  const [previewIdx, setPreviewIdx] = useState(0);
  // ── Drag state
  const dragSrc = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  // ── Dropzone hover
  const [dropzoneHover, setDropzoneHover] = useState(false);
  const fileInputRef = useRef(null);

  const [product, setProduct] = useState({
    Title: "",
    Title2: "",
    Discription: "",
    Cetagory: "",
    subCetagory: "",
    frsubCategory: "",
    price: "",
    discount: 0,
    status: "active",
    stock: 0,
  });

  // ── Load categories
  useEffect(() => {
    getCategories().then((data) => setallcategoris(data)).catch(() => {});
  }, [setallcategoris]);

  // ── Load product if editing
  useEffect(() => {
    if (!id) return;
    getProducts().then((data) => {
      const found = data.find((item) => item.firebaseId === id || item._id === id);
      if (found) {
        setProduct({
          Title: found.Title || "",
          Title2: found.Title2 || "",
          Discription: found.Discription || "",
          Cetagory: found.Cetagory || "",
          subCetagory: found.subCetagory || "",
          frsubCategory: found.frsubCategory || "",
          price: found.price ?? "",
          discount: found.discount ?? 0,
          status: found.status || "active",
          stock: found.stock ?? 0,
        });
        // Pre-populate existing images
        const existingImgs = found.images?.length
          ? found.images
          : found.image
          ? [found.image]
          : [];
        setImageItems(existingImgs.map((url) => ({ url, isExisting: true })));
      }
    }).catch(() => {});
  }, [id]);

  // ─── Category derived lists ───────────────────────────────────────────────
  const mainCategories = [...new Set(
    allcategories.map((i) => i.Cetagory).filter(Boolean)
  )];
  const subCategories = [...new Set(
    allcategories
      .filter((i) => i.Cetagory === product.Cetagory)
      .map((i) => i.subCetagory)
      .filter(Boolean)
  )];
  const frSubCategories = [...new Set(
    allcategories
      .filter((i) => i.Cetagory === product.Cetagory && i.subCetagory === product.subCetagory)
      .map((i) => i.frsubCategory)
      .filter(Boolean)
  )];

  // ─── Field change handler ─────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setProduct((prev) => {
      if (name === "Cetagory") return { ...prev, Cetagory: value, subCetagory: "", frsubCategory: "" };
      if (name === "subCetagory") return { ...prev, subCetagory: value, frsubCategory: "" };
      return { ...prev, [name]: value };
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  // ─── Image file validation ────────────────────────────────────────────────
  function validateFiles(files) {
    const valid = [];
    const rejected = [];
    for (const f of files) {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        rejected.push(`${f.name} (unsupported type — use JPG, PNG, or WEBP)`);
      } else if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${f.name} (exceeds ${MAX_FILE_SIZE_MB}MB)`);
      } else {
        valid.push(f);
      }
    }
    if (rejected.length) {
      toast.error(`Skipped: ${rejected.join("; ")}`, { autoClose: 6000 });
    }
    return valid;
  }

  // ─── Add images ──────────────────────────────────────────────────────────
  const handleFileSelect = useCallback((files) => {
    const valid = validateFiles(Array.from(files));
    if (!valid.length) return;
    const newItems = valid.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    }));
    setImageItems((prev) => [...prev, ...newItems]);
    setErrors((prev) => ({ ...prev, image: "" }));
  }, []);

  // ─── Remove image ─────────────────────────────────────────────────────────
  function removeImage(idx) {
    setImageItems((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated;
    });
    if (previewIdx >= imageItems.length - 1) setPreviewIdx(Math.max(0, previewIdx - 1));
  }

  // ─── Drag-and-drop reorder ───────────────────────────────────────────────
  function handleDragStart(e, idx) {
    dragSrc.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }
  function handleDragOver(idx) {
    setDragOver(idx);
  }
  function handleDrop(idx) {
    const src = dragSrc.current;
    if (src === null || src === idx) { setDragOver(null); return; }
    setImageItems((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(src, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    setPreviewIdx(idx === 0 ? 0 : previewIdx);
    dragSrc.current = null;
    setDragOver(null);
  }

  // ─── Dropzone drag events ─────────────────────────────────────────────────
  function onDropzoneDrop(e) {
    e.preventDefault();
    setDropzoneHover(false);
    if (e.dataTransfer.files?.length) handleFileSelect(e.dataTransfer.files);
  }

  // ─── Upload single file to Cloudinary ────────────────────────────────────
  async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "admin_profile");
    const res = await fetch("https://api.cloudinary.com/v1_1/wzzvrku7/image/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    if (!data.secure_url) throw new Error("No URL returned from Cloudinary");
    return data.secure_url;
  }

  // ─── Upload all new images, keep existing URLs ────────────────────────────
  async function resolveAllImages() {
    const results = await Promise.all(
      imageItems.map(async (item) => {
        if (item.isExisting) return item.url;
        return await uploadToCloudinary(item.file);
      })
    );
    return results;
  }

  // ─── Validation ───────────────────────────────────────────────────────────
  function validate() {
    const e = {};
    if (!product.Title.trim()) e.Title = "Product name is required";
    if (product.price === "" || Number(product.price) < 0) e.price = "Valid price is required";
    if (imageItems.length === 0) e.image = "At least one product image is required";
    if (!product.Discription.trim()) e.Discription = "Product description is required";
    if (product.stock === "" || Number(product.stock) < 0) e.stock = "Valid stock quantity is required";
    if (Number(product.discount) < 0 || Number(product.discount) > 100) e.discount = "Discount must be 0–100";
    return e;
  }

  // ─── Reset ────────────────────────────────────────────────────────────────
  function resetForm() {
    setProduct({ Title: "", Title2: "", Discription: "", Cetagory: "", subCetagory: "", frsubCategory: "", price: "", discount: 0, status: "active", stock: 0 });
    setImageItems([]);
    setErrors({});
    setPreviewIdx(0);
  }

  // ─── Submit (Create) ──────────────────────────────────────────────────────
  async function handleSubmit(e) {
    if (e) e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before saving.");
      return;
    }

    if (isSubmitting) return; // prevent double submission
    setIsSubmitting(true);

    try {
      let uploadedUrls;
      try {
        uploadedUrls = await resolveAllImages();
      } catch (uploadErr) {
        toast.error("Image upload failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...product,
        image: uploadedUrls[0] || "",
        images: uploadedUrls,
        price: Number(product.price),
        discount: Number(product.discount || 0),
        stock: Number(product.stock),
        rating: 0,
        reviewCount: 0,
      };

      await addProduct(payload);
      const all = await getProducts();
      setproducts(all);
      toast.success("Product created successfully! 🎉");
      resetForm();
      Navigate("/Productpage");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create product. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Submit (Update) ──────────────────────────────────────────────────────
  async function handleUpdate(e) {
    if (e) e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before saving.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let uploadedUrls;
      try {
        uploadedUrls = await resolveAllImages();
      } catch (uploadErr) {
        toast.error("Image upload failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...product,
        image: uploadedUrls[0] || "",
        images: uploadedUrls,
        price: Number(product.price),
        discount: Number(product.discount || 0),
        stock: Number(product.stock),
      };

      await updateProduct(id, payload);
      const all = await getProducts();
      setproducts(all);
      toast.success("Product updated successfully! ✅");
      Navigate("/Productpage");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update product. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Computed preview values ──────────────────────────────────────────────
  const origPrice = Number(product.price || 0);
  const disc = Number(product.discount || 0);
  const finalPrice = disc > 0 ? origPrice - (origPrice * disc) / 100 : origPrice;
  const previewImageUrl =
    imageItems.length > 0 ? imageItems[previewIdx]?.url || imageItems[0]?.url : null;

  return (
    <div className="container-fluid p-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-4 bg-white p-4 rounded-3 shadow-sm border border-light-subtle">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            <i className={`bi bi-${id ? "pencil-square" : "plus-circle"} me-2 text-warning`} />
            {id ? "Edit Product" : "Add New Product"}
          </h4>
          <p className="text-muted mb-0 small">
            {id ? "Update product details and images below." : "Fill in the details below to add a product to your catalog."}
          </p>
        </div>
        <Link to="/Productpage" className="btn btn-outline-secondary px-3 py-2 fw-medium shadow-sm">
          <i className="bi bi-arrow-left me-2" />Back to Products
        </Link>
      </div>

      <div className="row g-4">
        {/* ── LEFT: Form ─────────────────────────────────────────────── */}
        <div className="col-lg-8">
          <form onSubmit={(e) => { e.preventDefault(); id ? handleUpdate(e) : handleSubmit(e); }} noValidate>

            {/* SECTION: Product Information */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <span className="badge text-white" style={{ background: "#ff6b00", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "12px" }}>1</span>
                Product Information
              </h6>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold text-secondary small">Product Name <span className="text-danger">*</span></label>
                  <input
                    className={`form-control ${errors.Title ? "is-invalid" : ""}`}
                    name="Title" type="text"
                    placeholder="e.g. Wireless Headphones"
                    value={product.Title}
                    onChange={handleChange}
                  />
                  {errors.Title && <div className="invalid-feedback">{errors.Title}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold text-secondary small">Subtitle / Secondary Name <span className="text-muted fw-normal">(Optional)</span></label>
                  <input
                    className="form-control"
                    name="Title2" type="text"
                    placeholder="e.g. Noise Cancelling – Bluetooth 5.0"
                    value={product.Title2}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* SECTION: Pricing & Inventory */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <span className="badge text-white" style={{ background: "#ff6b00", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "12px" }}>2</span>
                Pricing &amp; Inventory
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary small">Original Price (Rs.) <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-secondary">Rs.</span>
                    <input
                      type="number" min="0" step="1"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      name="price" placeholder="0"
                      value={product.price}
                      onChange={handleChange}
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary small">Discount (%)</label>
                  <div className="input-group">
                    <input
                      type="number" min="0" max="100"
                      className={`form-control ${errors.discount ? "is-invalid" : ""}`}
                      name="discount" placeholder="0"
                      value={product.discount}
                      onChange={handleChange}
                    />
                    <span className="input-group-text bg-light text-secondary">% OFF</span>
                    {errors.discount && <div className="invalid-feedback">{errors.discount}</div>}
                  </div>
                  {disc > 0 && origPrice > 0 && (
                    <small className="text-success fw-semibold mt-1 d-block">
                      Final price: Rs. {finalPrice.toLocaleString("en-PK", { maximumFractionDigits: 0 })}
                    </small>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary small">Stock Quantity <span className="text-danger">*</span></label>
                  <input
                    type="number" min="0"
                    className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                    name="stock" placeholder="0"
                    value={product.stock}
                    onChange={handleChange}
                  />
                  {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary small">Product Status</label>
                  <select className="form-select" name="status" value={product.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION: Category */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <span className="badge text-white" style={{ background: "#ff6b00", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "12px" }}>3</span>
                Category
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-secondary small">Main Category</label>
                  <select
                    className={`form-select ${errors.Cetagory ? "is-invalid" : ""}`}
                    name="Cetagory" value={product.Cetagory} onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {mainCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                {product.Cetagory && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-secondary small">Sub-Category</label>
                    <select className="form-select" name="subCetagory" value={product.subCetagory} onChange={handleChange}>
                      <option value="">Select Sub-Category</option>
                      {subCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                {product.Cetagory && product.subCetagory && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold text-secondary small">Further Sub-Category</label>
                    <select className="form-select" name="frsubCategory" value={product.frsubCategory} onChange={handleChange}>
                      <option value="">Select Further Category</option>
                      {frSubCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION: Product Images */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <span className="badge text-white" style={{ background: "#ff6b00", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "12px" }}>4</span>
                Product Images
              </h6>
              <p className="text-muted small mb-3">First image will be used as the Main product image. Drag to reorder.</p>

              {/* Drop zone */}
              <div
                className={`rounded-3 border-2 border-dashed d-flex flex-column align-items-center justify-content-center p-4 mb-3 transition`}
                style={{
                  border: `2px dashed ${dropzoneHover || errors.image ? (errors.image ? "#dc3545" : "#ff6b00") : "#dee2e6"}`,
                  background: dropzoneHover ? "#fff7f0" : "#f8f9fa",
                  cursor: "pointer",
                  minHeight: "130px",
                  transition: "all 0.2s",
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDropzoneHover(true); }}
                onDragLeave={() => setDropzoneHover(false)}
                onDrop={onDropzoneDrop}
              >
                <i className="bi bi-cloud-upload fs-2 mb-2" style={{ color: dropzoneHover ? "#ff6b00" : "#adb5bd" }} />
                <p className="mb-0 fw-semibold text-secondary small">
                  {dropzoneHover ? "Drop images here" : "Click to select or drag & drop images"}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: "11px" }}>
                  JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB}MB per file · Multiple files supported
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                className="d-none"
                onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ""; }}
              />

              {errors.image && (
                <div className="text-danger small mb-2">
                  <i className="bi bi-exclamation-circle me-1" />{errors.image}
                </div>
              )}

              {/* Thumbnails */}
              {imageItems.length > 0 && (
                <>
                  <div className="d-flex gap-2 flex-wrap mt-1">
                    {imageItems.map((item, idx) => (
                      <ImageThumb
                        key={idx}
                        src={item.url}
                        index={idx}
                        total={imageItems.length}
                        onRemove={removeImage}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragging={dragOver === idx && dragSrc.current !== null && dragSrc.current !== idx}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary mt-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="bi bi-plus-lg me-1" />Add More Images
                  </button>
                </>
              )}
            </div>

            {/* SECTION: Description */}
            <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <span className="badge text-white" style={{ background: "#ff6b00", width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: "12px" }}>5</span>
                Description <span className="text-danger">*</span>
              </h6>
              <textarea
                className={`form-control ${errors.Discription ? "is-invalid" : ""}`}
                name="Discription"
                rows="5"
                placeholder="Write a detailed product description here..."
                value={product.Discription}
                onChange={handleChange}
              />
              {errors.Discription && <div className="invalid-feedback">{errors.Discription}</div>}
              <div className="text-end mt-1">
                <small className="text-muted">{product.Discription.length} characters</small>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Link to="/Productpage" className="btn btn-light text-secondary border px-4 fw-medium">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn fw-semibold px-5 text-white shadow-sm"
                style={{ background: isSubmitting ? "#cc5500" : "#ff6b00" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    {id ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <i className={`bi bi-${id ? "check-circle" : "cloud-upload"} me-2`} />
                    {id ? "Update Product" : "Save Product"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Live Preview ─────────────────────────────────────── */}
        <div className="col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-3 overflow-hidden sticky-top"
            style={{ top: "20px", background: "#ffffff" }}
          >
            <div className="px-3 pt-3 pb-2 border-bottom">
              <h6 className="fw-bold text-dark mb-0">
                <i className="bi bi-eye me-2 text-primary" />Live Product Preview
              </h6>
              <small className="text-muted">Updates as you type</small>
            </div>

            {/* Main image */}
            <div
              className="position-relative overflow-hidden"
              style={{ height: "220px", background: "#f1f3f5" }}
            >
              {disc > 0 && (
                <span className="badge bg-danger position-absolute top-0 start-0 m-2 fw-bold" style={{ zIndex: 3, fontSize: "11px" }}>
                  {disc}% OFF
                </span>
              )}
              <span
                className={`position-absolute top-0 end-0 m-2 badge text-capitalize ${product.status === "active" ? "bg-success" : product.status === "inactive" ? "bg-danger" : "bg-secondary"}`}
                style={{ zIndex: 3, fontSize: "10px" }}
              >
                {product.status || "active"}
              </span>
              <img
                src={previewImageUrl || PLACEHOLDER_SVG}
                alt={product.Title || "Product preview"}
                style={{ width: "100%", height: "100%", objectFit: previewImageUrl ? "cover" : "contain" }}
                onError={(e) => { e.target.src = PLACEHOLDER_SVG; }}
              />
            </div>

            {/* Thumbnail strip (clickable) */}
            {imageItems.length > 1 && (
              <div className="d-flex gap-1 px-3 pt-2 pb-1 overflow-auto">
                {imageItems.map((item, idx) => (
                  <img
                    key={idx}
                    src={item.url}
                    alt={`thumb-${idx}`}
                    onClick={() => setPreviewIdx(idx)}
                    onError={(e) => { e.target.src = PLACEHOLDER_SVG; }}
                    style={{
                      width: "40px", height: "40px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      cursor: "pointer",
                      border: previewIdx === idx ? "2px solid #ff6b00" : "2px solid #dee2e6",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Product info */}
            <div className="p-3">
              {/* Category badge */}
              <span className="badge px-2 py-1 mb-2 fw-semibold" style={{ background: "#fff3e0", color: "#e65c00", fontSize: "10px" }}>
                {product.Cetagory || "Category"}
              </span>

              {/* Title */}
              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", lineHeight: "1.3" }}>
                {product.Title || "Product Title"}
              </h6>

              {/* Subtitle */}
              {product.Title2 && (
                <small className="text-muted d-block mb-1">{product.Title2}</small>
              )}

              {/* Stars */}
              <div className="mb-2">
                <StarRating value={0} />
              </div>

              {/* Description */}
              <p
                className="text-muted mb-2"
                style={{
                  fontSize: "12px",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: "1.5",
                }}
              >
                {product.Discription || "Product description will appear here..."}
              </p>

              {/* Pricing */}
              <div className="d-flex align-items-baseline gap-2 mb-1">
                <span className="fw-bold" style={{ fontSize: "18px", color: "#ff6b00" }}>
                  Rs. {finalPrice > 0 ? finalPrice.toLocaleString("en-PK", { maximumFractionDigits: 0 }) : "0"}
                </span>
                {disc > 0 && origPrice > 0 && (
                  <span className="text-muted text-decoration-line-through" style={{ fontSize: "13px" }}>
                    Rs. {origPrice.toLocaleString("en-PK", { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <i
                  className={`bi bi-circle-fill`}
                  style={{ fontSize: "8px", color: Number(product.stock) > 5 ? "#22c55e" : Number(product.stock) > 0 ? "#f59e0b" : "#ef4444" }}
                />
                <small className="text-muted">
                  {Number(product.stock) > 5
                    ? `${product.stock} in stock`
                    : Number(product.stock) > 0
                    ? `Only ${product.stock} left!`
                    : "Out of stock"}
                </small>
              </div>

              {/* Action buttons — display only, non-functional in admin context */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm flex-grow-1 fw-semibold text-white"
                  style={{ background: "#ff6b00", pointerEvents: "none", fontSize: "12px" }}
                  tabIndex="-1"
                >
                  <i className="bi bi-cart-plus me-1" />Add to Cart
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  style={{ pointerEvents: "none" }}
                  tabIndex="-1"
                >
                  <i className="bi bi-heart" />
                </button>
              </div>
              <p className="text-center text-muted mt-2 mb-0" style={{ fontSize: "10px" }}>
                Preview only — buttons are disabled in admin mode
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}