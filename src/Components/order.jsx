import { useContext, useState, useEffect } from "react";
import { Addtocart } from "./Usercontext";
import { auth, onAuthStateChanged } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { addOrder } from "../services/orderService";
import { clearCart, removeCartItem } from "../services/cartService";
import { reduceProductStock } from "../services/productService";
import { toast } from "react-toastify";

function Breadcrumb({ items, darkmode }) {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb mb-0 d-flex flex-wrap align-items-center gap-1" style={{ fontSize: "13px" }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className={`breadcrumb-item${isLast ? " active" : ""}`}>
              {isLast ? (
                <span style={{ color: "#ff6b00", fontWeight: 600 }}>{item.label}</span>
              ) : (
                <>
                  <Link
                    to={item.to}
                    style={{ color: darkmode ? "#a1a1aa" : "#64748b", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.target.style.color = "#ff6b00")}
                    onMouseLeave={e => (e.target.style.color = darkmode ? "#a1a1aa" : "#64748b")}
                  >
                    {item.label}
                  </Link>
                  <i className="bi bi-chevron-right mx-2" style={{ fontSize: "10px", color: darkmode ? "#52525b" : "#cbd5e1" }} />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function FormInput({ label, icon, error, darkmode, ...props }) {
  const bg = darkmode ? "#18181b" : "#ffffff";
  const border = error ? "1.5px solid #ef4444" : darkmode ? "1.5px solid #27272a" : "1.5px solid #e2e8f0";
  return (
    <div>
      <label className="d-block mb-1 fw-semibold" style={{ fontSize: "12px", color: darkmode ? "#a1a1aa" : "#64748b", letterSpacing: "0.3px" }}>
        {label}
      </label>
      <div className="position-relative">
        {icon && (
          <i className={`bi bi-${icon} position-absolute`} style={{ left: "14px", top: "50%", transform: "translateY(-50%)", color: "#ff6b00", fontSize: "14px", pointerEvents: "none" }} />
        )}
        <input
          {...props}
          className="w-100 rounded-3"
          style={{ background: bg, border, color: darkmode ? "#f4f4f5" : "#0f172a", padding: icon ? "10px 14px 10px 38px" : "10px 14px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => (e.target.style.borderColor = "#ff6b00")}
          onBlur={e => (e.target.style.borderColor = error ? "#ef4444" : darkmode ? "#27272a" : "#e2e8f0")}
        />
      </div>
      {error && (
        <p className="mt-1 mb-0 d-flex align-items-center gap-1" style={{ color: "#ef4444", fontSize: "11px" }}>
          <i className="bi bi-exclamation-circle-fill" /> {error}
        </p>
      )}
    </div>
  );
}

function PaymentCard({ value, label, icon, color, selected, onClick, darkmode }) {
  const isSelected = selected === value;
  return (
    <div
      onClick={() => onClick(value)}
      className="d-flex flex-column align-items-center justify-content-center gap-2 rounded-4 p-3"
      style={{
        cursor: "pointer",
        border: isSelected ? "2px solid #ff6b00" : darkmode ? "1.5px solid #27272a" : "1.5px solid #e2e8f0",
        background: isSelected ? (darkmode ? "rgba(255,107,0,0.1)" : "#fff8f3") : darkmode ? "#18181b" : "#f8fafc",
        transition: "all 0.2s ease",
        minHeight: "90px",
        transform: isSelected ? "translateY(-2px)" : "none",
        boxShadow: isSelected ? "0 4px 16px rgba(255,107,0,0.2)" : "none",
      }}
    >
      <i className={`bi bi-${icon}`} style={{ fontSize: "22px", color: isSelected ? "#ff6b00" : color }} />
      <span className="fw-semibold text-center" style={{ fontSize: "12px", color: isSelected ? "#ff6b00" : darkmode ? "#d4d4d8" : "#334155" }}>
        {label}
      </span>
      {isSelected && (
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "18px", height: "18px", background: "#ff6b00" }}>
          <i className="bi bi-check text-white" style={{ fontSize: "11px" }} />
        </div>
      )}
    </div>
  );
}

export function Order() {
  const { cartItems, setCartItems, darkmode } = useContext(Addtocart);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MERCHANTS_ACCOUNTS = {
    JazzCash: { accountTitle: "Muhammad Subhan", accountNumber: "03369865130" },
    Easypaisa: { accountTitle: "Muhammad Usman", accountNumber: "03196376355" },
  };

  const totalcart = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalprice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const [orderform, setorderform] = useState({ firstame: "", Sname: "", Email: "", phone: "", adress: "", city: "", postal: "" });
  const [payment, setpayment] = useState("");
  const [trxId, setTrxId] = useState("");
  const [error, seterror] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged((user) => { if (!user) navigate("/Login"); else setLoading(false); });
    return () => unsub();
  }, [navigate]);

  const cardBg = darkmode ? "#111111" : "#ffffff";
  const textColor = darkmode ? "#f4f4f5" : "#0f172a";
  const subText = darkmode ? "#a1a1aa" : "#64748b";
  const border = darkmode ? "1px solid #27272a" : "1px solid #e2e8f0";

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border" style={{ color: "#ff6b00" }} role="status"><span className="visually-hidden">Loading...</span></div>
        <h4 className="ms-3 mb-0 fw-semibold" style={{ color: textColor }}>Loading checkout...</h4>
      </div>
    );
  }

  function handleformdata(e) { setorderform({ ...orderform, [e.target.name]: e.target.value }); }

  async function handaleformsubmit(e) {
    e.preventDefault();
    if (cartItems.length === 0) { toast.warning("Your cart is empty!"); return; }

    const Formerror = {};
    if (!orderform.firstame.trim()) Formerror.firstame = "First name is required";
    if (!orderform.Sname.trim()) Formerror.Sname = "Last name is required";
    if (!orderform.Email.trim()) Formerror.Email = "Email is required";
    if (!orderform.phone.trim()) Formerror.phone = "Phone number is required";
    if (!orderform.adress.trim()) Formerror.adress = "Address is required";
    if (!orderform.city.trim()) Formerror.city = "City is required";
    if (!payment) Formerror.payment = "Please select a payment method";
    if ((payment === "JazzCash" || payment === "Easypaisa") && (!trxId.trim() || trxId.trim().length < 5)) {
      Formerror.trxId = `Please enter a valid ${payment} Transaction ID`;
    }
    seterror(Formerror);

    if (Object.keys(Formerror).length === 0) {
      setIsSubmitting(true);
      try {
        const newOrder = {
          id: Date.now(),
          userId: auth.currentUser?.uid || null,
          customer: `${orderform.firstame.trim()} ${orderform.Sname.trim()}`,
          Email: auth.currentUser?.email || orderform.Email,
          phone: orderform.phone,
          Address: orderform.adress,
          City: orderform.city,
          Postal: orderform.postal,
          status: "Pending",
          payment,
          paymentStatus: payment === "Cash on Delivery" ? "Unpaid" : "Verification Pending",
          paymentDetails: { method: payment, transactionId: payment !== "Cash on Delivery" ? trxId.trim() : null, verified: false },
          products: cartItems.map((item) => ({ firebaseId: item.firebaseId, Title: item.Title, image: item.image || item.images?.[0] || "", price: item.price, qty: item.qty, reviewed: false })),
          TotalProducts: totalcart,
          TotalAmount: totalprice,
          orderdate: new Date().toLocaleDateString(),
          ordertime: new Date().toLocaleTimeString(),
        };
        await addOrder(newOrder);
        for (const item of cartItems) await reduceProductStock(item.firebaseId, item.qty);
        if (auth.currentUser?.uid) await clearCart(auth.currentUser.uid);
        setCartItems([]);
        toast.success("Order placed successfully!");
        navigate(auth.currentUser?.role === "admin" ? "/Adminorders" : "/UserDashboard");
      } catch (err) {
        console.error("Order Submission Error:", err);
        toast.error("Failed to place order. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => seterror({}), 4000);
    }
  }

  async function removeItem(id) {
    const user = auth.currentUser;
    if (user) {
      await removeCartItem(user.uid, id);
      setCartItems(cartItems.filter((item) => item.firebaseId !== id));
    }
  }

  return (
    <div className="min-vh-100 py-4" style={{ background: darkmode ? "#09090b" : "#f8fafc", color: textColor }}>
      <div className="container" style={{ maxWidth: "1100px" }}>

        <Breadcrumb darkmode={darkmode} items={[{ label: "Home", to: "/" }, { label: "Cart", to: "/ItemCart" }, { label: "Checkout" }]} />

        <div className="mb-4">
          <h1 className="fw-bold mb-1" style={{ fontSize: "clamp(1.5rem,4vw,2rem)", letterSpacing: "-0.5px", color: textColor }}>
            Secure Checkout
          </h1>
          <p style={{ color: subText, fontSize: "14px" }}>
            <i className="bi bi-shield-check me-1" style={{ color: "#10b981" }} />
            SSL encrypted &bull; Safe &amp; Secure Payment
          </p>
        </div>

        <div className="row g-4 align-items-start">
          {/* LEFT FORM */}
          <form className="col-lg-7" onSubmit={handaleformsubmit}>

            {/* Step 1: Contact */}
            <div className="p-4 rounded-4 mb-4" style={{ background: cardBg, border }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0" style={{ width: "28px", height: "28px", background: "#ff6b00", fontSize: "13px" }}>1</div>
                <h5 className="fw-bold mb-0" style={{ color: textColor }}>Contact Information</h5>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <FormInput label="First Name" icon="person" name="firstame" type="text" placeholder="Muhammad" value={orderform.firstame} onChange={handleformdata} error={error.firstame} darkmode={darkmode} />
                </div>
                <div className="col-md-6">
                  <FormInput label="Last Name" icon="person" name="Sname" type="text" placeholder="Ahmed" value={orderform.Sname} onChange={handleformdata} error={error.Sname} darkmode={darkmode} />
                </div>
                <div className="col-12">
                  <FormInput label="Email Address" icon="envelope" name="Email" type="email" placeholder="you@example.com" value={orderform.Email} onChange={handleformdata} error={error.Email} darkmode={darkmode} />
                </div>
                <div className="col-12">
                  <FormInput label="Phone Number" icon="telephone" name="phone" type="tel" placeholder="+92 300 1234567" value={orderform.phone} onChange={handleformdata} error={error.phone} darkmode={darkmode} />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping */}
            <div className="p-4 rounded-4 mb-4" style={{ background: cardBg, border }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0" style={{ width: "28px", height: "28px", background: "#ff6b00", fontSize: "13px" }}>2</div>
                <h5 className="fw-bold mb-0" style={{ color: textColor }}>Shipping Address</h5>
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <FormInput label="Street Address" icon="geo-alt" name="adress" type="text" placeholder="House #, Street, Area" value={orderform.adress} onChange={handleformdata} error={error.adress} darkmode={darkmode} />
                </div>
                <div className="col-md-6">
                  <FormInput label="City" icon="building" name="city" type="text" placeholder="Lahore" value={orderform.city} onChange={handleformdata} error={error.city} darkmode={darkmode} />
                </div>
                <div className="col-md-6">
                  <FormInput label="Postal Code (Optional)" icon="mailbox" name="postal" type="text" placeholder="54000" value={orderform.postal} onChange={handleformdata} darkmode={darkmode} />
                </div>
              </div>
            </div>

            {/* Step 3: Payment */}
            <div className="p-4 rounded-4 mb-4" style={{ background: cardBg, border }}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0" style={{ width: "28px", height: "28px", background: "#ff6b00", fontSize: "13px" }}>3</div>
                <h5 className="fw-bold mb-0" style={{ color: textColor }}>Payment Method</h5>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-4"><PaymentCard value="Cash on Delivery" label="Cash on Delivery" icon="cash-stack" color="#10b981" selected={payment} onClick={setpayment} darkmode={darkmode} /></div>
                <div className="col-4"><PaymentCard value="JazzCash" label="JazzCash" icon="phone" color="#e11d48" selected={payment} onClick={setpayment} darkmode={darkmode} /></div>
                <div className="col-4"><PaymentCard value="Easypaisa" label="Easypaisa" icon="wallet2" color="#059669" selected={payment} onClick={setpayment} darkmode={darkmode} /></div>
              </div>

              {error.payment && (
                <p className="mb-3 d-flex align-items-center gap-1" style={{ color: "#ef4444", fontSize: "12px" }}>
                  <i className="bi bi-exclamation-circle-fill" /> {error.payment}
                </p>
              )}

              {(payment === "JazzCash" || payment === "Easypaisa") && (
                <div className="rounded-4 p-4 mt-2" style={{ background: darkmode ? "rgba(255,193,7,0.05)" : "#fffbeb", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-info-circle-fill" style={{ color: "#f59e0b" }} />
                    <h6 className="fw-bold mb-0" style={{ color: "#f59e0b" }}>{payment} Instructions</h6>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-sm-6">
                      <div className="rounded-3 p-3" style={{ background: darkmode ? "rgba(255,255,255,0.05)" : "#ffffff", border }}>
                        <span className="d-block" style={{ fontSize: "11px", color: subText }}>Account Title</span>
                        <span className="fw-bold" style={{ fontSize: "14px", color: textColor }}>{MERCHANTS_ACCOUNTS[payment].accountTitle}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="rounded-3 p-3" style={{ background: darkmode ? "rgba(255,255,255,0.05)" : "#ffffff", border }}>
                        <span className="d-block" style={{ fontSize: "11px", color: subText }}>Account Number</span>
                        <span className="fw-bold" style={{ fontSize: "14px", color: "#10b981", letterSpacing: "0.5px" }}>{MERCHANTS_ACCOUNTS[payment].accountNumber}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: "13px", color: subText }} className="mb-3">
                    Send <strong style={{ color: "#ff6b00" }}>Rs {totalprice}</strong> to the number above, then enter your Transaction ID below.
                  </p>
                  <FormInput label="Transaction ID (Trx ID)" icon="upc-scan" type="text" placeholder="e.g. TXN0123456789" value={trxId} onChange={e => setTrxId(e.target.value.toUpperCase())} error={error.trxId} darkmode={darkmode} />
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="btn w-100 fw-bold rounded-pill py-3 d-flex align-items-center justify-content-center gap-2"
              style={{
                background: cartItems.length === 0 || isSubmitting ? (darkmode ? "#27272a" : "#e2e8f0") : "linear-gradient(135deg, #ff6b00, #e05e00)",
                color: cartItems.length === 0 || isSubmitting ? (darkmode ? "#71717a" : "#94a3b8") : "#ffffff",
                border: "none", fontSize: "16px",
                boxShadow: cartItems.length > 0 && !isSubmitting ? "0 8px 24px rgba(255,107,0,0.35)" : "none",
                transition: "all 0.2s ease",
                cursor: cartItems.length === 0 || isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <><div className="spinner-border spinner-border-sm" role="status" /> Processing...</>
              ) : (
                <><i className="bi bi-bag-check-fill fs-5" /> Place Order &bull; Rs {totalprice}</>
              )}
            </button>

            <div className="d-flex justify-content-center gap-4 mt-3 flex-wrap">
              {[{ icon: "shield-lock-fill", text: "Secure SSL", color: "#10b981" }, { icon: "truck", text: "Free Delivery", color: "#3b82f6" }, { icon: "arrow-counterclockwise", text: "Easy Returns", color: "#f59e0b" }].map((t, i) => (
                <div key={i} className="d-flex align-items-center gap-1" style={{ fontSize: "12px", color: subText }}>
                  <i className={`bi bi-${t.icon}`} style={{ color: t.color }} /> {t.text}
                </div>
              ))}
            </div>
          </form>

          {/* RIGHT: Order Summary */}
          <div className="col-lg-5">
            <div className="rounded-4 overflow-hidden" style={{ background: darkmode ? "linear-gradient(180deg, #18181b, #0f0f0f)" : "linear-gradient(180deg, #0f172a, #1e293b)", border: "1px solid rgba(255,107,0,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", position: "sticky", top: "80px" }}>

              <div className="px-4 py-3 d-flex align-items-center justify-content-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-bag-heart-fill" style={{ color: "#ff6b00", fontSize: "18px" }} />
                  <h5 className="fw-bold mb-0 text-white">Order Summary</h5>
                </div>
                <span className="px-3 py-1 rounded-pill fw-bold" style={{ background: "rgba(255,107,0,0.15)", color: "#ff6b00", fontSize: "12px", border: "1px solid rgba(255,107,0,0.3)" }}>
                  {totalcart} {totalcart === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="px-4 py-3" style={{ maxHeight: "320px", overflowY: "auto", scrollbarWidth: "thin" }}>
                {cartItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-cart-x fs-1 d-block mb-2" style={{ color: "#52525b" }} />
                    <p style={{ color: "#71717a", fontSize: "14px" }}>Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {cartItems.map((item) => (
                      <div key={item.firebaseId} className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="rounded-2 overflow-hidden flex-shrink-0" style={{ width: "52px", height: "52px", background: "#ffffff" }}>
                          <img src={item.images?.length ? item.images[0] : item.image} alt={item.Title} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }} />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="mb-0 fw-semibold text-white text-truncate" style={{ fontSize: "13px" }} title={item.Title}>{item.Title}</h6>
                          <span style={{ fontSize: "12px", color: "#71717a" }}>Qty: <strong className="text-white">{item.qty}</strong></span>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                          <span className="fw-bold text-white" style={{ fontSize: "13px" }}>Rs {item.price * item.qty}</span>
                          <button type="button" onClick={() => removeItem(item.firebaseId)} className="btn p-0 border-0 d-flex align-items-center justify-content-center rounded-circle" style={{ width: "22px", height: "22px", background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: "13px" }}>
                            <i className="bi bi-x" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Subtotal</span>
                  <span className="text-white fw-semibold">Rs {totalprice}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span style={{ color: "#94a3b8", fontSize: "14px" }}>Shipping</span>
                  <span className="fw-bold" style={{ color: "#10b981" }}><i className="bi bi-truck me-1" />FREE</span>
                </div>
                <div className="rounded-3 p-3 d-flex justify-content-between align-items-center" style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.2)" }}>
                  <span className="fw-bold text-white fs-6">Total</span>
                  <span className="fw-bold fs-4" style={{ color: "#ff6b00" }}>Rs {totalprice}</span>
                </div>
                {payment && (
                  <div className="mt-3 d-flex align-items-center gap-2 rounded-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <i className="bi bi-check-circle-fill" style={{ color: "#10b981", fontSize: "14px" }} />
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>Paying via <strong className="text-white">{payment}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}