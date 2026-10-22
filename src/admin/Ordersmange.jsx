import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  getOrders, 
  updateOrderStatus, 
  deleteOrder,
  updateOrderPayment,
  updatePaymentStatus
} from "../services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export function Ordersmange() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const orders = await getOrders();
      const foundOrder = orders.find(
        item => String(item.firebaseId) === String(id)
      );
      setOrder(foundOrder || null);
      setLoading(false);
    }
    loadOrder();
  }, [id]);

 async function updatestatus(newstatus) {

  console.log("FIREBASE ID:", order.firebaseId);
  console.log("STATUS:", newstatus);

  // Order status update
  await updateOrderStatus(order.firebaseId, newstatus);

  // COD order delivered => Payment automatically Paid
 setOrder({
  ...order,
  status:newstatus
});

}
    async function changePaymentStatus(status){

  await updatePaymentStatus(
    order.firebaseId,
    status
  );

  setOrder({
    ...order,
    paymentStatus: status
  });

}

  async function verifyPayment() {
    await updateOrderPayment(order.firebaseId);

    setOrder({
      ...order,
      paymentDetails: {
        ...order.paymentDetails,
        verified: true
      },
      paymentStatus: "Paid"
    });
  }

  async function delorder(orderId) {
    console.log("orderId:", orderId);
    console.log("order:", order);

    if (window.confirm("Are you sure?")) {
      await deleteOrder(orderId);
      navigate("/Adminorders");
    }
  }
  async function downloadInvoice(){

  const invoice = document.getElementById("invoice");

  const canvas = await html2canvas(invoice);

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF(
    "p",
    "mm",
    "a4"
  );

  const imgWidth = 190;
  const imgHeight =
    (canvas.height * imgWidth) / canvas.width;


  pdf.addImage(
    imgData,
    "PNG",
    10,
    10,
    imgWidth,
    imgHeight
  );


  pdf.save(
    `Order-${order.id}.pdf`
  );

}

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-success-subtle text-success border border-success-subtle";
      case "shipped":
        return "bg-info-subtle text-info border border-info-subtle";
      case "proccessing":
      case "processing":
        return "bg-primary-subtle text-primary border border-primary-subtle";
      case "cancelled":
        return "bg-danger-subtle text-danger border border-danger-subtle";
      default:
        return "bg-warning-subtle text-warning border border-warning-subtle";
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary me-2" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary fw-medium">Fetching Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-light min-vh-100 py-5">
        <div className="container text-center py-5">
          <div className="mb-3 text-muted opacity-50">
            <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
          </div>
          <h3 className="fw-bold text-dark mb-2">Order Not Found</h3>
          <p className="text-muted mb-4">The order you are looking for does not exist or has been removed.</p>
          <Link to="/Adminorders" className="btn btn-dark rounded-pill px-4 py-2 shadow-sm">
            <i className="bi bi-arrow-left me-2"></i>Back to Orders Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container"  id="invoice" style={{ maxWidth: "1200px" }}>
        
        {/* Top Header Navigation Bar */}
        <div className="d-flex justify-content-between align-items-center bg-white p-3 px-4 rounded-4 shadow-sm mb-4 border border-light">
          <div className="d-flex align-items-center gap-3">
            <Link to="/Adminorders" className="btn btn-outline-secondary btn-sm text-secondary fw-semibold rounded-pill px-3 shadow-sm d-flex align-items-center gap-1">
              <i className="bi bi-arrow-left"></i> Back to Dashboard
            </Link>
            <h5 className="mb-0 fw-bold text-dark d-none d-sm-block">Order Fulfillment Hub</h5>
          </div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill font-monospace small">
            Portal v2.4
          </span>
        </div>

        <div className="row g-4">
          {/* Left Column: Order Breakdown & Line Items */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-white">
              
              {/* Order Header Info Bar */}
              <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <span className="text-muted small d-block">Order Reference</span>
                  <span className="fw-bold text-dark fs-5 font-monospace">#{order.id}</span>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className={`badge px-3 py-2 rounded-pill text-uppercase small fw-semibold ${getStatusBadge(order.status)}`}>
                    {order.status || "Pending"}
                  </span>
                  <button 
                    onClick={() => delorder(order.firebaseId)}
                    className="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-1"
                    title="Remove Order Record"
                  >
                    <i className="bi bi-trash"></i> Delete Order
                  </button>
                  <button
 onClick={downloadInvoice}
 className="btn btn-success btn-sm rounded-pill"
>
<i className="bi bi-download"></i>
 Download Invoice
</button>
                </div>
              </div>

              {/* Items Table */}
              <div className="card-body p-4">
                <h6 className="text-uppercase text-secondary fs-7 fw-bold mb-3 tracking-wide d-flex align-items-center gap-2">
                  <i className="bi bi-box-seam text-primary"></i> Line Items ({order.products?.length || 0})
                </h6>
                
                <div className="table-responsive">
                  <table className="table table-borderless align-middle mb-0">
                    <thead className="table-light text-secondary fs-7">
                      <tr>
                        <th className="py-2 px-3 rounded-start">Product Description</th>
                        <th className="py-2 text-center">Quantity</th>
                        <th className="py-2 text-end rounded-end px-3">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.products?.map((i, idx) => (
                        <tr key={idx} className="border-bottom">
                          <td className="py-3 px-3">
                            <div className="d-flex align-items-center gap-3">
                              <img 
                                src={i.images?.length ? i.images[0] : i.image} 
                                alt={i.Title || "Product"} 
                                className="rounded-3 border shadow-sm"
                                style={{ height: "70px", width: "70px", objectFit: "cover" }} 
                              />
                              <div>
                                <span className="fw-bold text-dark d-block mb-1">{i.Title}</span>
                                <small className="text-muted font-monospace bg-light px-2 py-1 rounded">
                                  SKU-REF-{i.firebaseId}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center fw-bold text-secondary">{i.qty}</td>
                          <td className="text-end fw-bold text-dark px-3">{i.price} <span className="small text-muted fw-normal">Rs</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary Card Box */}
                <div className="bg-light p-4 rounded-4 mt-4 border border-1 border-light">
                  <div className="d-flex justify-content-between mb-2 text-secondary small">
                    <span>Total Units Ordered:</span>
                    <span className="fw-semibold text-dark">{order.TotalProducts}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span className="fw-bold text-dark fs-6">Gross Order Amount:</span>
                    <span className="fw-bold text-success fs-4">
                      {order.TotalAmount} <span className="small text-muted fw-normal">Rs</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Customer & Logistics Panel */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white sticky-top" style={{ top: "90px" }}>
              <div className="card-body p-4">
                
                {/* Status Controller Box */}
                <div className="bg-primary-subtle p-3 rounded-4 mb-4 border border-primary-subtle">
                  <label className="form-label text-uppercase text-primary fs-7 fw-bold mb-2 d-flex align-items-center gap-1">
                    <i className="bi bi-sliders"></i> Fulfillment Status Control
                  </label>
                  <select 
                    className="form-select border-primary-subtle shadow-sm bg-white fw-medium rounded-pill px-3"
                    value={order.status || ""} 
                    onChange={(e) => updatestatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="Proccessing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Customer Information */}
                <div className="mb-4">
                  <span className="text-uppercase text-muted fs-7 fw-bold d-block mb-2">Customer Profile</span>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-primary text-white rounded-circle fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: "42px", height: "42px" }}>
                      {order.customer ? order.customer.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{order.customer}</h6>
                      <small className="text-muted font-monospace">Verified Buyer</small>
                    </div>
                  </div>
                  <div className="text-secondary small mb-2 d-flex align-items-center gap-2">
                    <i className="bi bi-envelope text-muted"></i>
                    <span className="fw-semibold text-dark">{order.Email}</span>
                  </div>
                  <div className="text-secondary small d-flex align-items-center gap-2">
                    <i className="bi bi-telephone text-muted"></i>
                    <span className="fw-semibold text-dark">{order.phone}</span>
                  </div>
                </div>

                <hr className="text-muted opacity-25" />

                {/* Payment Information */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-credit-card text-success"></i> Payment Details
                  </h6>

                  <p className="mb-2 text-secondary small">
                    Method: <strong className="text-dark">{order.paymentDetails?.method || "Cash on Delivery"}</strong>
                  </p>

                  {order.paymentDetails?.transactionId && (
                    <p className="mb-2 text-secondary small">
                      Transaction ID: <span className="text-primary fw-bold font-monospace">{order.paymentDetails.transactionId}</span>
                    </p>
                  )}

               <div className="mt-3">

<label className="small text-muted fw-medium mb-2">
  Payment Status
</label>

<select
  className="form-select rounded-pill"
  value={order.paymentStatus || "Unpaid"}
  onChange={(e)=>changePaymentStatus(e.target.value)}
>

<option value="Unpaid">
Unpaid
</option>

<option value="Pending Verification">
Pending Verification
</option>

<option value="Paid">
Paid
</option>

</select>

</div>
                </div>

                {order.paymentDetails?.method !== "Cash on Delivery" && !order.paymentDetails?.verified && (
                  <button
                    className="btn btn-success w-100 rounded-pill py-2 fw-semibold mb-4 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    onClick={verifyPayment}
                  >
                    <i className="bi bi-check-circle-fill"></i> Approve Payment
                  </button>
                )}

                {/* Shipping Address Details */}
                <div className="mb-2">
                  <span className="text-uppercase text-muted fs-7 fw-bold d-block mb-2">Shipping Destination</span>
                  <div className="bg-light p-3 rounded-4 border border-light">
                    <p className="text-dark mb-1 fw-medium small d-flex align-items-start gap-2">
                      <i className="bi bi-geo-alt-fill text-danger mt-1"></i>
                      <span>{order.Address}</span>
                    </p>
                    <p className="text-secondary mb-0 small fw-bold text-uppercase ms-4">{order.City}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}