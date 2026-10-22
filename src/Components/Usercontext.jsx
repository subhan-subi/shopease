import { createContext, useState, useEffect, useCallback } from "react";
import { ProdctsArray } from "./PArray";
import { toast } from "react-toastify";
import { subscribeProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import {
  onAuthStateChanged,
  getCurrentUser,
} from "../services/authService";
import {
  getCartItems,
  removeCartItem,
  updateCartQty,
  addCartItem,
  clearCart,
} from "../services/cartService";
import {
  addWishlistItem,
  removeWishlistItem,
  getWishlistItems,
} from "../services/wishlistService";

export const Addtocart = createContext();

export function Cartprovider({ children }) {
  const [side, setside] = useState(false);
  const [islogedin, setisloggedin] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const { products, setproducts } = ProdctsArray();
  const [allcategories, setallcategoris] = useState([]);
  const [Category, setCategory] = useState([]);
  const [productLoading, setProductLoading] = useState(true);

  // Search and Wishlist states
  const [searchword, setword] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Subscribe to live products stream
  useEffect(() => {
    const unsubscribe = subscribeProducts((data) => {
      setproducts(data || []);
      setProductLoading(false);
    });
    return () => unsubscribe();
  }, [setproducts]);

  // Load categories on startup
  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategory(data || []);
      setallcategoris(data || []);
    } catch (err) {
      console.error("LOAD CATEGORIES ERROR:", err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load User Cart from MongoDB
  const loadCart = useCallback(async () => {
    const user = getCurrentUser();

    if (!user) {
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    try {
      setCartLoading(true);
      const data = await getCartItems(user.id || user._id);
      setCartItems(data || []);
    } catch (error) {
      console.error("LOAD CART ERROR:", error);
    } finally {
      setCartLoading(false);
    }
  }, []);

  // Add Item To Cart (MongoDB Persistent)
  async function addtocart(product, qtyToAdd = 1) {
    const user = getCurrentUser();

    if (!user) {
      toast.error("Please login first to add items to your cart.");
      return;
    }

    try {
      const safeQty = Number(qtyToAdd) > 0 ? Number(qtyToAdd) : 1;
      const updatedCart = await addCartItem(user.id || user._id, {
        ...product,
        qty: safeQty,
      });
      setCartItems(updatedCart);
      toast.success("Added to cart");
    } catch (error) {
      console.error("CART ADD ERROR:", error);
      const msg = error.response?.data?.message || "Could not add item to cart. Please try again.";
      toast.error(msg);
    }
  }

  // Remove Item From Cart (MongoDB Persistent)
  async function removeFromCart(productId) {
    const user = getCurrentUser();
    if (!user) return;

    try {
      await removeCartItem(user.id || user._id, productId);
      setCartItems((prev) => prev.filter((item) => item.firebaseId !== productId && item.id !== productId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("CART REMOVE ERROR:", error);
      toast.error("Failed to remove item from cart.");
    }
  }

  // Update Cart Item Quantity (MongoDB Persistent)
  async function updateCartQuantity(productId, newQty) {
    const user = getCurrentUser();
    if (!user) return;

    const parsedQty = Number(newQty);
    if (!parsedQty || parsedQty < 1) return;

    // Optimistic snapshot for rollback if API fails
    const previousItems = [...cartItems];

    setCartItems((prev) =>
      prev.map((item) =>
        item.firebaseId === productId || item.id === productId
          ? { ...item, qty: parsedQty }
          : item
      )
    );

    try {
      const res = await updateCartQty(user.id || user._id, productId, parsedQty);
      if (res?.data) {
        setCartItems(res.data);
      }
    } catch (error) {
      console.error("CART QTY UPDATE ERROR:", error);
      setCartItems(previousItems);
      toast.error("Failed to update quantity. Please try again.");
    }
  }

  // Clear Cart completely (MongoDB Persistent)
  async function clearUserCart() {
    const user = getCurrentUser();
    if (!user) {
      setCartItems([]);
      return;
    }

    try {
      await clearCart(user.id || user._id);
      setCartItems([]);
    } catch (error) {
      console.error("CLEAR CART ERROR:", error);
      setCartItems([]);
    }
  }

  // Load User Wishlist from MongoDB
  const loadWishlist = useCallback(async () => {
    const user = getCurrentUser();

    if (!user) {
      setWishlist([]);
      setWishlistItems([]);
      setWishlistLoading(false);
      return;
    }

    try {
      setWishlistLoading(true);
      const data = await getWishlistItems(user.id || user._id);
      const items = Array.isArray(data) ? data : [];
      setWishlistItems(items);
      setWishlist(items.map((item) => item.firebaseId || item._id || item.id));
    } catch (err) {
      console.error("LOAD WISHLIST ERROR:", err);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  // Add Item to Wishlist (MongoDB Persistent)
  async function addtowislist(product) {
    const user = getCurrentUser();

    if (!user) {
      toast.error("Please login first to save items to your wishlist.");
      return;
    }

    try {
      await addWishlistItem(user.id || user._id, product);
      await loadWishlist();
      toast.success("Added to wishlist");
    } catch (err) {
      console.error("ADD WISHLIST ERROR:", err);
      const msg = err.response?.data?.message || "Could not save to wishlist.";
      toast.error(msg);
    }
  }

  // Remove Item from Wishlist (MongoDB Persistent)
  async function remove(productId) {
    const user = getCurrentUser();

    if (!user) return;

    try {
      await removeWishlistItem(user.id || user._id, productId);
      await loadWishlist();
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("REMOVE WISHLIST ERROR:", err);
      toast.error("Could not remove from wishlist.");
    }
  }

  // Helper: check if product is in wishlist
  const isProductInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      const pid = String(productId);
      return (
        wishlist.includes(pid) ||
        wishlistItems.some((item) => String(item.firebaseId) === pid || String(item.id) === pid)
      );
    },
    [wishlist, wishlistItems]
  );

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setisloggedin(true);
        loadCart();
        loadWishlist();
      } else {
        setisloggedin(false);
        setCartItems([]);
        setWishlist([]);
        setWishlistItems([]);
        setCartLoading(false);
      }
    });

    return () => unsubscribe();
  }, [loadCart, loadWishlist]);

  // Darkmode Theme Handler
  const [darkmode, setdarkmode] = useState(() => {
    const savemode = localStorage.getItem("darkmode");
    return savemode === "false";
  });

  function changeclr() {
    setdarkmode((prev) => !prev);
  }

  useEffect(() => {
    localStorage.setItem("darkmode", JSON.stringify(!darkmode));
    document.body.className = darkmode ? "dark-theme" : "light-theme";
  }, [darkmode]);

  const searchfilter = products.filter((item) => {
    return item.Title?.toLowerCase().includes(searchword.toLowerCase());
  });

  return (
    <Addtocart.Provider
      value={{
        products,
        setproducts,
        productLoading,
        // Cart
        cartItems,
        setCartItems,
        cartLoading,
        loadCart,
        addtocart,
        removeFromCart,
        updateCartQuantity,
        clearUserCart,
        // Wishlist
        wishlist,
        wishlistItems,
        wishlistLoading,
        setWishlist,
        loadWishlist,
        addtowislist,
        remove,
        isProductInWishlist,
        // Navigation & Search
        side,
        setside,
        searchword,
        setword,
        searchfilter,
        // Theme
        darkmode,
        setdarkmode,
        changeclr,
        // Categories
        allcategories,
        setallcategoris,
        Category,
        setCategory,
        loadCategories,
        // Auth
        islogedin,
        setisloggedin,
      }}
    >
      {children}
    </Addtocart.Provider>
  );
}

export default Cartprovider;
