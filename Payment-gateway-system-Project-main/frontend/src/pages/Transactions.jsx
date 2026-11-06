import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function Transactions() {
  const [payments, setPayments] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/v1/payments", {
      headers: {
        "X-Api-Key": "key_test_abc123",
        "X-Api-Secret": "secret_test_xyz789"
      }
    })
    .then(res => setPayments(res.data))
    .catch(err => console.error(err));
  }, []);

  const handleLogout = () => navigate("/login");

  return (
    <div className="dashboard-root">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

          :root {
            --primary: #3b71ca; /* Matched to the blue in your screenshot */
            --primary-light: #f0f5ff;
            --bg-main: #f8fafc;
            --sidebar: #0b0f19;
            --text-heading: #1a202c;
            --text-body: #4a5568;
            --text-muted: #718096;
            --card-border: #edf2f7;
            --success-green: #008a5e;
          }

          .dashboard-root {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            display: flex; background: var(--bg-main);
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: var(--text-body);
          }

          /* --- Sidebar --- */
          .sidebar {
            width: 260px; background: var(--sidebar); color: white;
            display: flex; flex-direction: column; padding: 32px 16px;
          }
          .logo-area {
            padding: 0 16px; margin-bottom: 40px;
            font-size: 1rem; font-weight: 800; display: flex; align-items: center; gap: 12px;
            letter-spacing: 0.5px; opacity: 0.9;
          }
          .logo-icon {
            width: 28px; height: 28px; background: var(--primary); border-radius: 6px;
            display: grid; place-items: center; font-size: 14px;
          }
          .nav-group { flex: 1; }
          .nav-item {
            display: flex; align-items: center; padding: 12px 16px; margin-bottom: 4px;
            border-radius: 10px; text-decoration: none; color: #94a3b8;
            font-size: 14px; font-weight: 500; transition: 0.2s ease;
          }
          .nav-item:hover { color: white; background: rgba(255,255,255,0.03); }
          .nav-item.active { background: rgba(255,255,255,0.08); color: white; font-weight: 600; }
          
          .logout-area { border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
          .logout-btn {
            width: 100%; padding: 10px; border: none;
            background: rgba(244,63,94,0.1); color: #fb7185; border-radius: 8px;
            font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 13px;
          }
          .logout-btn:hover { background: #fb7185; color: white; }

          /* --- Main Content Area --- */
          .content-main { flex: 1; overflow-y: auto; padding: 48px 60px; }
          .header-row { margin-bottom: 32px; }
          .header-row h1 { font-size: 24px; font-weight: 800; color: var(--text-heading); margin: 0; letter-spacing: -0.5px; }
          .header-row p { margin: 6px 0 0 0; font-size: 14px; color: var(--text-muted); }

          /* --- Professional Table --- */
          .table-container {
            background: white;
            border-radius: 16px;
            border: 1px solid var(--card-border);
            box-shadow: 0 4px 20px rgba(0,0,0,0.02);
            overflow: hidden;
          }

          table { width: 100%; border-collapse: collapse; }
          
          th {
            background: #fbfcfd;
            padding: 16px 24px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--card-border);
          }

          td {
            padding: 20px 24px;
            font-size: 14px;
            border-bottom: 1px solid var(--card-border);
            vertical-align: middle;
          }

          tr:hover td { background-color: #fafbfd; }

          /* The Blue Amount Style from your image */
          .amount-cell {
            font-weight: 700;
            font-size: 16px; 
            color: var(--primary);
            letter-spacing: -0.2px;
          }

          .mono-box {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            color: var(--text-body);
            background: #f1f5f9;
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          }

          .order-text {
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 6px;
            font-weight: 500;
          }

          /* Status Badges */
          .status-pill {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
          }

          .status-success { background: #e6fcf5; color: var(--success-green); }
          .status-pending { background: #fff9db; color: #f08c00; }
          .status-failed { background: #fff5f5; color: #fa5252; }

          .method-label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }

          .date-cell {
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 500;
          }
        `}
      </style>

      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">G</div>
          GATEWAY ADMIN
        </div>
        
        <nav className="nav-group">
          <Link to="/dashboard" className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}>
             Overview
          </Link>
          <Link to="/dashboard/transactions" className={`nav-item ${location.pathname === "/dashboard/transactions" ? "active" : ""}`}>
             Transactions
          </Link>
        </nav>

        <div className="logout-area">
          <button className="logout-btn" onClick={handleLogout}>Logout Account</button>
        </div>
      </aside>

      <main className="content-main">
        <header className="header-row">
          <h1>Transactions</h1>
          <p>Displaying your latest gateway activity and payment settlements</p>
        </header>

        <div className="table-container">
          <table data-test-id="transactions-table">
            <thead>
              <tr>
                <th>Reference & Order</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} data-test-id="transaction-row">
                    <td>
                      <span className="mono-box" data-test-id="payment-id">{p.id}</span>
                      <div className="order-text">Order: {p.order_id}</div>
                    </td>
                    <td className="amount-cell" data-test-id="amount">
                      ₹{(Number(p.amount) / 100).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="method-label" data-test-id="method">
                        {p.method}
                      </span>
                    </td>
                    <td data-test-id="status">
                      <span className={`status-pill status-${p.status}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                      <span style={{ marginLeft: '8px', opacity: 0.5 }}>
                        {new Date(p.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '100px 0', color: '#cbd5e0' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>○</div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>No transaction history found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Transactions;