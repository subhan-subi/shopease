import Product from "../models/Product.js";

// ==========================================
// GET ALL PRODUCTS
// ==========================================
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products.",
    });
  }
};

// ==========================================
// GET PRODUCT BY ID
// ==========================================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product.",
    });
  }
};

// ==========================================
// CREATE PRODUCT (Admin)
// ==========================================
export const createProduct = async (req, res) => {
  try {
    const {
      Title,
      Title2,
      Discription,
      image,
      images,
      Cetagory,
      subCetagory,
      frsubCategory,
      price,
      discount,
      status,
      stock,
      rating,
      reviewCount,
    } = req.body;

    if (!Title || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product Title, price, and stock are required.",
      });
    }

    const newProduct = await Product.create({
      Title: Title.trim(),
      Title2: Title2 ? Title2.trim() : "",
      Discription: Discription ? Discription.trim() : "",
      image: image || (images && images[0]) || "",
      images: Array.isArray(images) ? images : image ? [image] : [],
      Cetagory: Cetagory ? Cetagory.trim() : "",
      subCetagory: subCetagory ? subCetagory.trim() : "",
      frsubCategory: frsubCategory ? frsubCategory.trim() : "",
      price: Number(price),
      discount: Number(discount) || 0,
      status: status || "active",
      stock: Number(stock) || 0,
      rating: Number(rating) || 0,
      reviewCount: Number(reviewCount) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating product.",
    });
  }
};

// ==========================================
// UPDATE PRODUCT (Admin)
// ==========================================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = [
      "Title", "Title2", "Discription", "image", "images",
      "Cetagory", "subCetagory", "frsubCategory",
      "price", "discount", "status", "stock",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.discount !== undefined) updateData.discount = Number(updateData.discount);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product.",
    });
  }
};


// ==========================================
// DELETE PRODUCT (Admin)
// ==========================================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting product.",
    });
  }
};

// ==========================================
// UPDATE PRODUCT RATING
// ==========================================
export const updateProductRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, reviewCount } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        rating: Number(rating),
        reviewCount: Number(reviewCount),
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product rating updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("UPDATE RATING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product rating.",
    });
  }
};

// ==========================================
// REDUCE STOCK (Atomic and Safe)
// ==========================================
export const reduceProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    const quantityToReduce = Number(qty) || 1;

    // Atomic update preventing negative stock
    const product = await Product.findOneAndUpdate(
      { _id: id, stock: { $gte: quantityToReduce } },
      { $inc: { stock: -quantityToReduce } },
      { new: true }
    );

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock or product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("REDUCE STOCK ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating stock.",
    });
  }
};
