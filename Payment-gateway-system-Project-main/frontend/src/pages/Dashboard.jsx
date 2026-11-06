import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import api from "../api"; 

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, amount: 0, successRate: 0 });
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
  api
    .get("/api/v1/payments", {
      headers: {
        "X-Api-Key": "key_test_abc123",
        "X-Api-Secret": "secret_test_xyz789"
      }
    })
    .then((res) => {
      const payments = res.data;

      const total = payments.length;

      const successfulPayments = payments.filter(
        (p) => p.status === "success"
      );

      const totalAmount = successfulPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const successRate =
        total === 0
          ? 0
          : Math.round((successfulPayments.length / total) * 100);

      setStats({
        total,
        amount: totalAmount / 100, // convert paise → INR
        successRate
      });
    })
    .catch((err) => {
      console.error("Failed to fetch payments", err);
    });
}, []);


  const handleLogout = () => navigate("/login");

  return (
    <div className="dashboard-root" data-test-id="dashboard">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap');

          :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --bg-main: #fcfcfd;
            --sidebar: #0b0f19;
            --card-border: #f2f4f7;
            --text-heading: #101828;
            --text-body: #475467;
          }

          .dashboard-root {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            display: flex; background: var(--bg-main);
            font-family: 'Plus Jakarta Sans', sans-serif;
          }

          /* --- Modern Sidebar --- */
          .sidebar {
            width: 280px; background: var(--sidebar); color: white;
            display: flex; flex-direction: column; padding: 32px 16px;
          }

          .logo-area {
            padding: 0 16px; margin-bottom: 40px;
            font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 12px;
          }

          .logo-icon {
            width: 32px; height: 32px; background: var(--primary); border-radius: 8px;
            display: grid; place-items: center; font-size: 18px;
          }

          .nav-group { flex: 1; }
          .nav-item {
            display: flex; align-items: center; padding: 12px 16px; margin-bottom: 4px;
            border-radius: 8px; text-decoration: none; color: #94a3b8;
            font-size: 14px; font-weight: 500; transition: 0.2s;
          }
          .nav-item:hover { color: white; background: rgba(255,255,255,0.05); }
          .nav-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }

          .logout-area { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
          .logout-btn {
            width: 100%; padding: 12px; border: 1px solid rgba(244,63,94,0.3);
            background: rgba(244,63,94,0.05); color: #fb7185; border-radius: 8px;
            font-weight: 600; cursor: pointer; transition: 0.2s;
          }
          .logout-btn:hover { background: #fb7185; color: white; }

          /* --- Main Content --- */
          .content-main { flex: 1; overflow-y: auto; padding: 48px 64px; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .header-row h1 { font-size: 30px; font-weight: 800; color: var(--text-heading); margin: 0; }
          .header-row p { color: var(--text-body); margin-top: 8px; }

          /* --- Credentials Card --- */
          .credentials-card {
            background: white; border: 1px solid var(--card-border); border-radius: 16px;
            padding: 24px; margin-bottom: 32px; box-shadow: 0 1px 3px rgba(16,24,40,0.1);
          }
          .card-title { font-size: 14px; font-weight: 600; color: var(--text-heading); margin-bottom: 20px; }
          
          .api-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          .field-label { font-size: 12px; font-weight: 600; color: var(--text-body); margin-bottom: 8px; display: block; }
          
          .key-input-wrapper {
            background: #f9fafb; border: 1px solid #d0d5dd; border-radius: 8px;
            padding: 10px 14px; display: flex; align-items: center; gap: 12px;
          }
          .key-text {
            flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #344054;
            overflow: hidden; text-overflow: ellipsis;
          }
          .eye-btn {
            background: none; border: none; cursor: pointer; color: #667085;
            display: flex; align-items: center; padding: 4px; border-radius: 4px;
          }
          .eye-btn:hover { background: #f2f4f7; color: var(--primary); }

          /* --- Metric Grid --- */
          .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .stat-card {
            background: white; border: 1px solid var(--card-border); border-radius: 16px;
            padding: 24px; position: relative; overflow: hidden;
          }
          .stat-card::after {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px;
          }
          .stat-card.blue::after { background: var(--primary); }
          .stat-card.green::after { background: #12b76a; }
          
          .stat-label { font-size: 14px; font-weight: 600; color: var(--text-body); margin-bottom: 12px; }
          .stat-value { font-size: 28px; font-weight: 800; color: var(--text-heading); }
          .stat-subtext { font-size: 12px; color: #12b76a; font-weight: 600; margin-top: 8px; }
        `}
      </style>

      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo-icon">G</div>
          GATEWAY SYSTEM
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
          <div>
            <h1>Dashboard</h1>
            <p>Monitor your payment performance and API health.</p>
          </div>
        </header>

        <section className="credentials-card">
          <div className="card-title">API Credentials</div>
          <div className="api-row">
            <div>
              <span className="field-label">PUBLIC KEY</span>
              <div className="key-input-wrapper">
                <span className="key-text">
                  {showKey ? "key_test_abc123" : "••••••••••••••••••••"}
                </span>
                <button className="eye-btn" onClick={() => setShowKey(!showKey)}>
                  {showKey ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div>
              <span className="field-label">SECRET KEY</span>
              <div className="key-input-wrapper">
                <span className="key-text">
                  {showSecret ? "secret_test_xyz789" : "••••••••••••••••••••"}
                </span>
                <button className="eye-btn" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          <div className="stat-card">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-subtext">↑ 12% from last month</div>
          </div>

          <div className="stat-card blue">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{stats.amount}</div>
            <div className="stat-subtext">Verified Credits</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">{stats.successRate}%</div>
            <div className="stat-subtext">System is stable</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;