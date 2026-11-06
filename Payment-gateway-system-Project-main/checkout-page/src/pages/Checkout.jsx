import { useEffect, useState } from "react";
import api from "../api";

function Checkout() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("upi");
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  const [paymentId, setPaymentId] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    api
      .get(`/api/v1/orders/${orderId}/public`)
      .then((res) => setOrder(res.data))
      .catch(() => setStatus("failed"));
  }, [orderId]);

  useEffect(() => {
    if (!paymentId) return;

    const interval = setInterval(() => {
      api
        .get(`/api/v1/payments/${paymentId}`, {
          headers: {
            "X-Api-Key": "key_test_abc123",
            "X-Api-Secret": "secret_test_xyz789"
          }
        })
        .then((res) => {
          if (res.data.status === "success") {
            setStatus("success");
            clearInterval(interval);
          }
          if (res.data.status === "failed") {
            setStatus("failed");
            clearInterval(interval);
          }
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const pay = async (e) => {
    e.preventDefault();
    setStatus("processing");

    const payload =
      method === "upi"
        ? { order_id: orderId, method: "upi", vpa }
        : {
            order_id: orderId,
            method: "card",
            card: {
              number: card.number,
              expiry_month: card.expiry.split("/")[0],
              expiry_year: card.expiry.split("/")[1],
              cvv: card.cvv,
              holder_name: card.name
            }
          };

    try {
      const res = await api.post("/api/v1/payments/public", payload);
      setPaymentId(res.data.id);
    } catch (err) {
      setStatus("failed");
    }
  };

  if (!order) return <div className="loading">Loading Order...</div>;

  return (
    <div className="checkout-wrapper">
      <div className="checkout-card" data-test-id="checkout-container">
        
        {/* IMPROVED ORDER SUMMARY */}
        <div className="order-header">
          <div className="header-top">
             <h2>Complete Payment</h2>
             <div className="secure-badge">
               <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
               Secure
             </div>
          </div>
          
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">Amount Due</span>
              <span className="value amount" data-test-id="order-amount">₹{order.amount / 100}</span>
            </div>
            <div className="summary-item right-align">
              <span className="label">Order ID</span>
              <span className="value order-id" data-test-id="order-id">{order.id}</span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Form State */}
        {status === "idle" && (
          <div className="form-content">
            <div className="method-selector" data-test-id="payment-methods">
              <button type="button" className={method === "upi" ? "active" : ""} onClick={() => setMethod("upi")}>UPI</button>
              <button type="button" className={method === "card" ? "active" : ""} onClick={() => setMethod("card")}>Card</button>
            </div>

            <form className="payment-form" onSubmit={pay}>
              {method === "upi" ? (
                <div className="input-field">
                  <label>Virtual Payment Address</label>
                  <input required placeholder="vpa@bank" value={vpa} onChange={(e) => setVpa(e.target.value)} />
                </div>
              ) : (
                <>
                  <div className="input-field">
                    <label>Card Number</label>
                    <input required placeholder="0000 0000 0000 0000" maxLength="16" onChange={(e) => setCard({ ...card, number: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <div className="input-field">
                        <label>Expiry</label>
                        <input required placeholder="MM/YY" onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                    </div>
                    <div className="input-field">
                        <label>CVV</label>
                        <input required type="password" placeholder="123" maxLength="3" onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-field">
                    <label>Cardholder Name</label>
                    <input required placeholder="John Doe" onChange={(e) => setCard({ ...card, name: e.target.value })} />
                  </div>
                </>
              )}
              <button className="pay-btn">Confirm & Pay ₹{order.amount / 100}</button>
            </form>
          </div>
        )}

        {/* PROCESSING STATE (Animation untouched) */}
        {status === "processing" && (
          <div className="state-view">
            <div className="razorpay-scene">
               <div className="coin c1">₹</div>
               <div className="coin c2">₹</div>
               <div className="coin c3">₹</div>
               <div className="bank-icon">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M3 21h18M3 10h18M5 21V10M19 21V10M9 21V10M15 21V10M12 3l9 7H3l9-7z" />
                 </svg>
               </div>
               <div className="base-line"></div>
            </div>
            <p className="loading-text">Securing your payment...</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === "success" && (
          <div className="state-view success">
            <div className="icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2>Payment Successful!</h2>
            <p className="ref-text">Ref: {paymentId}</p>
          </div>
        )}

        {/* FAILURE */}
        {status === "failed" && (
          <div className="state-view error">
            <div className="icon-circle">✕</div>
            <h2>Payment Failed</h2>
            <p className="ref-text">Something went wrong with your transaction.</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}
      </div>

      <style>{`
        .checkout-wrapper {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #f1f5f9;
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        }
        .checkout-card {
          background: white; width: 100%; max-width: 440px; padding: 32px;
          border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        
        /* HEADER REFRESH */
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-top h2 { margin: 0; font-size: 18px; color: #0f172a; font-weight: 800; }
        .secure-badge { 
          display: flex; align-items: center; gap: 4px; font-size: 11px; 
          font-weight: 700; color: #10b981; background: #ecfdf5; 
          padding: 4px 8px; border-radius: 20px; text-transform: uppercase;
        }
        .secure-badge svg { width: 12px; height: 12px; }

        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .summary-item { display: flex; flex-direction: column; gap: 4px; }
        .right-align { text-align: right; }
        .label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { color: #1e293b; font-weight: 700; font-size: 16px; }
        .amount { color: #3b71ca; font-size: 22px; font-weight: 800; }
        .order-id { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 6px; display: inline-block; }
        
        .divider { height: 1px; background: #e2e8f0; margin: 0 -32px 24px -32px; }

        .method-selector { display: flex; gap: 8px; margin-bottom: 24px; background: #f1f5f9; padding: 4px; border-radius: 12px; }
        .method-selector button { 
            flex: 1; padding: 10px; border: none; background: transparent; 
            border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px; 
            color: #64748b; transition: all 0.2s; 
        }
        .method-selector button.active { background: white; color: #3b71ca; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .payment-form { display: flex; flex-direction: column; gap: 20px; text-align: left; }
        .input-field label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; }
        .input-group { display: flex; gap: 16px; }
        input { 
            width: 100%; padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; 
            font-size: 15px; box-sizing: border-box; transition: all 0.2s;
        }
        input:focus { outline: none; border-color: #3b71ca; ring: 3px rgba(59, 113, 202, 0.1); }
        
        .pay-btn { 
            background: #3b71ca; color: white; border: none; padding: 16px; 
            border-radius: 12px; font-weight: 800; cursor: pointer;
            width: 100%; font-size: 16px; transition: all 0.2s; margin-top: 8px;
        }
        .pay-btn:hover { background: #2c5aa0; box-shadow: 0 10px 15px -3px rgba(59, 113, 202, 0.3); }

        /* --- COIN ANIMATION CSS (UNTOUCHED AS REQUESTED) --- */
        .razorpay-scene { position: relative; height: 120px; width: 120px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
        .bank-icon { width: 50px; height: 50px; color: #3b71ca; z-index: 2; animation: bank-shake 2s infinite ease-in-out; }
        .base-line { position: absolute; bottom: 20px; width: 80px; height: 2px; background: #e3e8ee; border-radius: 2px; }
        .coin {
          position: absolute; width: 24px; height: 24px; background: #ffd700;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #b8860b; border: 2px solid #daa520;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1; opacity: 0;
        }
        .c1 { animation: coin-fly 2s infinite 0s; left: 20px; }
        .c2 { animation: coin-fly 2s infinite 0.6s; left: 45px; }
        .c3 { animation: coin-fly 2s infinite 1.2s; left: 70px; }

        @keyframes coin-fly {
          0% { bottom: 0; opacity: 0; transform: translateY(0) scale(0.5); }
          20% { opacity: 1; transform: translateY(-10px) scale(1); }
          80% { opacity: 1; }
          100% { bottom: 60px; opacity: 0; transform: translateY(-40px) scale(0.5); }
        }
        @keyframes bank-shake { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .loading-text { font-weight: 700; color: #4a5568; animation: pulse 1.5s infinite; font-size: 15px; text-align: center; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        /* Success/Error States */
        .icon-circle {
          width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 24px;
          display: flex; align-items: center; justify-content: center; font-size: 32px; color: white;
        }
        .success .icon-circle { background: #10b981; }
        .success .icon-circle svg { width: 32px; height: 32px; }
        .error .icon-circle { background: #ef4444; }
        .success h2 { color: #10b981; margin: 0 0 8px 0; text-align: center; }
        .error h2 { color: #ef4444; margin: 0 0 8px 0; text-align: center; }
        .ref-text { font-size: 14px; color: #718096; font-weight: 500; text-align: center; }
        .retry-btn { margin-top: 20px; background: #fff; border: 1.5px solid #e2e8f0; padding: 10px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; color: #4a5568; width: 100%; }
      `}</style>
    </div>
  );
}

export default Checkout;