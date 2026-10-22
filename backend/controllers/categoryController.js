import Category from "../models/Category.js";

// ==========================================
// GET ALL CATEGORIES
// ==========================================
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching categories.",
    });
  }
};

// ==========================================
// GET CATEGORY BY ID
// ==========================================
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching category.",
    });
  }
};

// ==========================================
// CREATE CATEGORY (Admin)
// ==========================================
export const createCategory = async (req, res) => {
  try {
    const { Cetagory, subCetagory, frsubCategory, icon } = req.body;

    if (!Cetagory || Cetagory.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const newCategory = await Category.create({
      Cetagory: Cetagory.trim(),
      subCetagory: subCetagory ? subCetagory.trim() : "",
      frsubCategory: frsubCategory ? frsubCategory.trim() : "",
      icon: icon || "bi-grid-fill",
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: newCategory,
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating category.",
    });
  }
};

// ==========================================
// UPDATE CATEGORY (Admin)
// ==========================================
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ["Cetagory", "subCetagory", "frsubCategory", "icon"];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = typeof req.body[field] === "string"
          ? req.body[field].trim()
          : req.body[field];
      }
    }

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating category.",
    });
  }
};


// ==========================================
// DELETE CATEGORY (Admin)
// ==========================================
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting category.",
    });
  }
};

// ==========================================
// BATCH UPDATE CATEGORY BRANCH (Admin)
// ==========================================
export const updateCategoryBranch = async (req, res) => {
  try {
    const { itemsToUpdate, updatedFields } = req.body;

    if (!Array.isArray(itemsToUpdate) || itemsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "itemsToUpdate array is required.",
      });
    }

    if (!updatedFields || typeof updatedFields !== "object" || Array.isArray(updatedFields)) {
      return res.status(400).json({
        success: false,
        message: "updatedFields must be a valid object.",
      });
    }

    // Whitelist fields that can be batch-updated to prevent $operator injection
    const allowedBatchFields = ["Cetagory", "subCetagory", "frsubCategory", "icon"];
    const safeUpdatedFields = {};
    for (const field of allowedBatchFields) {
      if (updatedFields[field] !== undefined) {
        safeUpdatedFields[field] = updatedFields[field];
      }
    }

    if (Object.keys(safeUpdatedFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
    }

    const ids = itemsToUpdate.map((item) => item.id || item._id).filter(Boolean);

    await Category.updateMany(
      { _id: { $in: ids } },
      { $set: safeUpdatedFields }
    );

    return res.status(200).json({
      success: true,
      message: "Category branch updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE CATEGORY BRANCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating category branch.",
    });
  }
};


// ==========================================
// BATCH DELETE CATEGORY BRANCH (Admin)
// ==========================================
export const deleteCategoryBranch = async (req, res) => {
  try {
    const { itemsToDelete } = req.body;

    if (!Array.isArray(itemsToDelete) || itemsToDelete.length === 0) {
      return res.status(400).json({
        success: false,
        message: "itemsToDelete array is required.",
      });
    }

    const ids = itemsToDelete.map((item) => item.id || item._id).filter(Boolean);

    await Category.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: "Category branch deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CATEGORY BRANCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting category branch.",
    });
  }
};
