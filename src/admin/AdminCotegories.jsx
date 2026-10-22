import { useState, useEffect, useContext } from "react";
import { Addtocart } from "../Components/Usercontext";
import { toast } from "react-toastify";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  updateCategoryBranch,
  deleteCategoryBranch
} from "../services/categoryService";

// Predefined Icon Collection for Production
const POPULAR_ICONS = [
  "bi-laptop", "bi-phone", "bi-watch", "bi-tv", "bi-headphones",
  "bi-camera", "bi-controller", "bi-speaker", "bi-lightning-charge",
  "bi-briefcase", "bi-gem", "bi-bag-check", "bi-basket", "bi-gift",
  "bi-cart-check", "bi-display", "bi-cpu", "bi-sunglasses", "bi-tag",
  "bi-shield-check", "bi-disc", "bi-smartwatch", "bi-plug", "bi-box-seam"
];

export function AddCotegories() {
  const { Category, setCategory } = useContext(Addtocart);

  const [categoryType, setCategoryType] = useState("main");
  const [mainId, setMainId] = useState("");
  const [subId, setSubId] = useState("");
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("bi-grid-fill");

  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategory(data || []);
      } catch (error) {
        toast.error("Failed to load categories");
      }
    }
    loadCategories();
  }, [setCategory]);

  const mainCategories = [
    ...new Set(Category.map((cat) => cat.Cetagory || cat.Category).filter(Boolean))
  ];

  const resetFormState = () => {
    setMainId("");
    setSubId("");
    setCategoryNameInput("");
    setCategoryType("main");
    setSelectedIcon("bi-grid-fill");
    setEditingItem(null);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    const mainVal = item.Cetagory || item.Category || "";
    const subVal = item.subCetagory || item.subCategory || "";
    const frsubVal = item.frsubCategory || item.frsubID || "";
    
    setSelectedIcon(item.icon || "bi-grid-fill");

    if (frsubVal) {
      setCategoryType("subsub");
      setMainId(mainVal);
      setSubId(subVal);
      setCategoryNameInput(frsubVal);
    } else if (subVal) {
      setCategoryType("sub");
      setMainId(mainVal);
      setCategoryNameInput(subVal);
    } else {
      setCategoryType("main");
      setCategoryNameInput(mainVal);
    }
  };

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!categoryNameInput || categoryNameInput.trim() === "") {
      toast.error("Please enter a category name");
      return;
    }

    const title = categoryNameInput.trim();

    try {
      if (editingItem && editingItem.id) {
        const oldMain = editingItem.Cetagory || editingItem.Category;
        const oldSub = editingItem.subCetagory || editingItem.subCategory;
        const oldFrsub = editingItem.frsubCategory || editingItem.frsubID;

        if (oldFrsub) {
          await updateCategory(editingItem.id, {
            Cetagory: mainId,
            subCetagory: subId,
            frsubCategory: title,
            icon: selectedIcon
          });
        } else if (oldSub) {
          const affectedSubBranch = Category.filter(
            (c) =>
              (c.Cetagory || c.Category) === oldMain &&
              (c.subCetagory || c.subCategory) === oldSub
          );

          await updateCategoryBranch(affectedSubBranch, {
            Cetagory: mainId,
            subCetagory: title,
            icon: selectedIcon
          });
        } else {
          const affectedMainBranch = Category.filter(
            (c) => (c.Cetagory || c.Category) === oldMain
          );

          await updateCategoryBranch(affectedMainBranch, {
            Cetagory: title,
            icon: selectedIcon
          });
        }

        toast.success("Category branch updated successfully");
      } else {
        let newCategoryObj = {};
        if (categoryType === "main") {
          newCategoryObj = { Cetagory: title, subCetagory: "", frsubCategory: "", icon: selectedIcon };
        } else if (categoryType === "sub") {
          if (!mainId) return toast.error("Select Main Category");
          newCategoryObj = { Cetagory: mainId, subCetagory: title, frsubCategory: "", icon: selectedIcon };
        } else if (categoryType === "subsub") {
          if (!mainId) return toast.error("Select Main Category");
          if (!subId) return toast.error("Select Sub Category");
          newCategoryObj = { Cetagory: mainId, subCetagory: subId, frsubCategory: title, icon: selectedIcon };
        }

        await addCategory(newCategoryObj);
        toast.success("Category saved successfully");
      }

      const updatedData = await getCategories();
      setCategory(updatedData || []);
      resetFormState();
    } catch (err) {
      toast.error("Error processing request");
    }
  }

  async function handleDeleteSubBranch(mainName, subName) {
    const subBranchItems = Category.filter(
      (c) =>
        (c.Cetagory || c.Category) === mainName &&
        (c.subCetagory || c.subCategory) === subName
    );

    if (window.confirm(`Delete sub-category "${subName}" and all its child nodes?`)) {
      try {
        await deleteCategoryBranch(subBranchItems);
        const updatedData = await getCategories();
        setCategory(updatedData || []);
        toast.success("Sub-category branch deleted");
      } catch (err) {
        toast.error("Error deleting sub-category branch");
      }
    }
  }

  async function handleDeleteBranch(categoryBranch) {
    if (!categoryBranch.length) return;
    const branchName = categoryBranch[0]?.Category || categoryBranch[0]?.Cetagory;

    if (window.confirm(`Delete entire "${branchName}" main category branch?`)) {
      try {
        await deleteCategoryBranch(categoryBranch);
        const updatedData = await getCategories();
        setCategory(updatedData || []);
        toast.success("Main category branch deleted");
      } catch (err) {
        toast.error("Error deleting category branch");
      }
    }
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Page Header */}
      <div className="admin-page-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="admin-page-title">
            <i className="bi bi-diagram-3-fill me-2" style={{ color: "var(--admin-accent)", fontSize: "1.2rem" }}></i>
            Category Architecture
          </h1>
          <p className="admin-page-subtitle">
            Organize and manage your multi-tier product category structure.
          </p>
        </div>
        <button
          className="admin-btn-primary btn"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#categoryModal"
          onClick={resetFormState}
        >
          <i className="bi bi-plus-lg"></i>
          Add Category
        </button>
      </div>

      {/* Modal */}
      <div className="modal fade admin-modal" id="categoryModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-folder-plus" style={{ color: "var(--admin-accent)" }}></i>
                {editingItem ? " Edit Category Branch" : " Add New Category"}
              </h5>
              <button type="button" className="btn-close btn-close-white shadow-none" data-bs-dismiss="modal"></button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="admin-label">Hierarchy Level</label>
                  <select
                    className="admin-select form-select"
                    value={categoryType}
                    disabled={Boolean(editingItem)}
                    onChange={(e) => {
                      setCategoryType(e.target.value);
                      setSubId("");
                      setMainId("");
                      setCategoryNameInput("");
                    }}
                  >
                    <option value="main">Main Category</option>
                    <option value="sub">Sub Category</option>
                    <option value="subsub">Further Subcategory</option>
                  </select>
                </div>

                {(categoryType === "sub" || categoryType === "subsub") && (
                  <div className="mb-3">
                    <label className="admin-label">Select Parent Main Category</label>
                    <select
                      className="admin-select form-select"
                      value={mainId}
                      disabled={Boolean(editingItem)}
                      onChange={(e) => {
                        setMainId(e.target.value);
                        setSubId("");
                      }}
                    >
                      <option value="">— Choose Main Category —</option>
                      {mainCategories.map((catName, idx) => (
                        <option key={idx} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {categoryType === "subsub" && mainId && (
                  <div className="mb-3">
                    <label className="admin-label">Select Parent Sub Category</label>
                    <select
                      className="admin-select form-select"
                      value={subId}
                      disabled={Boolean(editingItem)}
                      onChange={(e) => setSubId(e.target.value)}
                    >
                      <option value="">— Choose Sub Category —</option>
                      {[
                        ...new Set(
                          Category.filter((c) => (c.Cetagory || c.Category) === mainId)
                            .map((c) => c.subCetagory || c.subCategory)
                            .filter((s) => s && s.trim() !== "")
                        )
                      ].map((subName, idx) => (
                        <option key={idx} value={subName}>
                          {subName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-3">
                  <label className="admin-label">Category Title</label>
                  <input
                    className="admin-input form-control"
                    type="text"
                    value={categoryNameInput}
                    onChange={(e) => setCategoryNameInput(e.target.value)}
                    placeholder="e.g. Consumer Electronics / Laptops"
                  />
                </div>

                {/* VISUAL ICON PICKER GRID */}
                <div className="mb-2">
                  <label className="admin-label d-block mb-2">Select Category Icon</label>
                  <div 
                    className="d-flex flex-wrap gap-2 p-2 border rounded" 
                    style={{ 
                      maxHeight: "135px", 
                      overflowY: "auto", 
                      background: "rgba(0,0,0,0.15)",
                      borderColor: "var(--admin-border)" 
                    }}
                  >
                    {POPULAR_ICONS.map((iconClass, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedIcon(iconClass)}
                        className={`btn btn-sm ${selectedIcon === iconClass ? "btn-primary" : "btn-outline-secondary"}`}
                        style={{ width: "40px", height: "40px", borderRadius: "8px" }}
                      >
                        <i className={`bi ${iconClass} fs-5`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="admin-btn-ghost btn" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary btn" data-bs-dismiss="modal">
                  <i className="bi bi-check-lg"></i>
                  {editingItem ? " Batch Update Branch" : " Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="row g-4">
        {mainCategories.length > 0 ? (
          mainCategories.map((catName, i) => {
            const currentMainBranch = Category.filter(
              (c) => (c.Cetagory || c.Category) === catName
            );

            const subCategories = [
              ...new Set(
                currentMainBranch
                  .map((c) => c.subCetagory || c.subCategory)
                  .filter((s) => s && s.trim() !== "")
              )
            ];

            return (
              <div className="col-12 col-sm-6 col-md-4 col-xl-3 admin-animate-in" key={i}>
                <div className="admin-cat-card">
                  <div className="admin-cat-header">
                    <div style={{ overflow: "hidden", flex: 1 }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", display: "block", marginBottom: "3px" }}>
                        Main Category
                      </span>
                      <h5 style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={catName}>
                        <i className={`bi ${currentMainBranch[0]?.icon || "bi-grid-fill"} me-2`}></i>
                        {catName}
                      </h5>
                    </div>

                    <div className="d-flex align-items-center">
                      <button
                        className="admin-btn-icon btn ms-1"
                        style={{ background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.15)", color: "#fff" }}
                        data-bs-toggle="modal"
                        data-bs-target="#categoryModal"
                        onClick={() => {
                          const mainDoc = currentMainBranch.find((c) => !(c.subCetagory || c.subCategory)) || currentMainBranch[0];
                          handleEditClick(mainDoc);
                        }}
                        title="Edit Main Category Branch"
                      >
                        <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }}></i>
                      </button>

                      <button
                        className="admin-btn-icon admin-btn-icon-danger btn ms-1"
                        style={{ background: "rgba(255,255,255,0.10)", borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
                        onClick={() => handleDeleteBranch(currentMainBranch)}
                        title="Delete Entire Category Branch"
                      >
                        <i className="bi bi-trash" style={{ fontSize: "0.75rem" }}></i>
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    {subCategories.length > 0 ? (
                      subCategories.map((subName, subIdx) => {
                        const frsubDocs = currentMainBranch.filter(
                          (c) => (c.subCategory || c.subCetagory) === subName
                        );

                        const subDoc = frsubDocs.find((c) => !(c.frsubCategory || c.frsubID)) || frsubDocs[0];

                        const frsub = [
                          ...new Set(
                            frsubDocs
                              .map((c) => c.frsubCategory || c.frsubID)
                              .filter((f) => f && f.trim() !== "")
                          )
                        ];

                        return (
                          <div key={subIdx} className="admin-cat-sub-item">
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                              <div className="d-flex align-items-center gap-2" style={{ overflow: "hidden" }}>
                                <i className={`bi ${subDoc?.icon || "bi-folder2-open"}`} style={{ color: "var(--admin-accent)", fontSize: "0.8rem" }}></i>
                                <span style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--admin-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={subName}>
                                  {subName}
                                </span>
                              </div>

                              <div className="d-flex align-items-center gap-1">
                                <button
                                  className="btn p-0 border-0"
                                  style={{ color: "var(--admin-muted)" }}
                                  data-bs-toggle="modal"
                                  data-bs-target="#categoryModal"
                                  onClick={() => handleEditClick(subDoc)}
                                  title="Edit Sub Category Branch"
                                >
                                  <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }}></i>
                                </button>
                                <button
                                  className="btn p-0 border-0 text-danger ms-1"
                                  style={{ opacity: 0.7 }}
                                  onClick={() => handleDeleteSubBranch(catName, subName)}
                                  title="Delete Sub Category Branch"
                                >
                                  <i className="bi bi-x-circle" style={{ fontSize: "0.75rem" }}></i>
                                </button>
                              </div>
                            </div>

                            {frsub.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mt-2 ps-3" style={{ borderLeft: "2px solid var(--admin-border)" }}>
                                {frsub.map((fsub, fIdx) => {
                                  const frsubItem = frsubDocs.find((c) => (c.frsubCategory || c.frsubID) === fsub);
                                  return (
                                    <span
                                      key={fIdx}
                                      className="admin-badge admin-badge-primary d-inline-flex align-items-center gap-1"
                                      style={{ fontSize: "0.68rem", cursor: "pointer" }}
                                      data-bs-toggle="modal"
                                      data-bs-target="#categoryModal"
                                      onClick={() => handleEditClick(frsubItem)}
                                      title="Click to edit sub-subcategory"
                                    >
                                      {fsub}
                                      <i className="bi bi-pencil ms-1" style={{ fontSize: "0.6rem", opacity: 0.8 }}></i>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: "center", padding: "24px 16px", border: "1.5px dashed var(--admin-border)", borderRadius: "10px", color: "var(--admin-muted)" }}>
                        <i className="bi bi-folder-x d-block mb-1" style={{ fontSize: "1.3rem" }}></i>
                        <small style={{ fontSize: "0.75rem" }}>No subcategories registered</small>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="admin-badge admin-badge-primary" style={{ fontSize: "0.7rem" }}>
                      <i className="bi bi-diagram-2 me-1"></i>
                      {subCategories.length} {subCategories.length === 1 ? "Sub-node" : "Sub-nodes"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="admin-card" style={{ maxWidth: "480px", margin: "0 auto" }}>
              <div className="admin-empty-state">
                <div className="admin-empty-icon" style={{ width: "72px", height: "72px", fontSize: "2rem" }}>
                  <i className="bi bi-diagram-3"></i>
                </div>
                <p className="admin-empty-title">No Category Structure Found</p>
                <p className="admin-empty-desc">Initialize your inventory categorization by adding a main node above.</p>
                <button className="admin-btn-primary btn mt-3" type="button" data-bs-toggle="modal" data-bs-target="#categoryModal" onClick={resetFormState}>
                  <i className="bi bi-plus-lg"></i> Add First Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}