import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-viewport">
      <style>
        {`
          :root {
            --brand-primary: #6366f1;
            --brand-secondary: #4f46e5;
            --bg-deep: #0f172a;
            --text-light: #f8fafc;
            --accent-cyan: #22d3ee;
          }

          .auth-viewport {
            display: flex;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-deep);
            background-image: 
              radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 35%),
              radial-gradient(circle at 100% 100%, rgba(34, 211, 238, 0.1) 0%, transparent 35%);
            position: fixed;
            top: 0;
            left: 0;
            overflow: hidden;
          }

          /* Animated Background Elements */
          .bg-blob {
            position: absolute;
            width: 300px;
            height: 300px;
            background: var(--brand-primary);
            filter: blur(80px);
            border-radius: 50%;
            z-index: 0;
            opacity: 0.2;
            animation: move 20s infinite alternate;
          }

          @keyframes move {
            from { transform: translate(-10%, -10%); }
            to { transform: translate(20%, 20%); }
          }

          /* Left Hero Section */
          .hero-side {
            flex: 1.2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 8%;
            color: var(--text-light);
            z-index: 1;
          }

          .gateway-logo {
            width: 64px;
            height: 64px;
            margin-bottom: 40px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .portal-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 4px solid var(--accent-cyan);
            border-radius: 16px;
            animation: rotate-portal 4s linear infinite;
          }

          @keyframes rotate-portal {
            0% { transform: rotate(0deg) scale(1); border-color: var(--accent-cyan); }
            50% { transform: rotate(180deg) scale(1.1); border-color: var(--brand-primary); }
            100% { transform: rotate(360deg) scale(1); border-color: var(--accent-cyan); }
          }

          .hero-side h1 {
            font-size: 4rem;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 24px;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-side p {
            font-size: 1.25rem;
            color: #94a3b8;
            max-width: 520px;
            line-height: 1.6;
          }

          /* Right Form Section */
          .form-side {
            flex: 0.8;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(10px);
            z-index: 1;
          }

          .login-box {
            width: 100%;
            max-width: 440px;
            background: #ffffff;
            padding: 56px;
            border-radius: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            transform: translateY(${isVisible ? '0' : '40px'});
            opacity: ${isVisible ? '1' : '0'};
            transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
            position: relative;
            overflow: hidden;
          }

          /* Shimmer Effect on Box */
          .login-box::after {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.03), transparent);
            transform: rotate(45deg);
            animation: shimmer 6s infinite;
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%) rotate(45deg); }
            100% { transform: translateX(100%) rotate(45deg); }
          }

          .login-box h2 {
            font-size: 2.25rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px 0;
            letter-spacing: -0.02em;
          }

          .subtitle { color: #64748b; margin-bottom: 40px; font-size: 1.1rem; }

          .input-wrap { margin-bottom: 24px; opacity: 0; transform: translateY(10px); animation: fadeUp 0.5s forwards; }
          .input-wrap:nth-child(1) { animation-delay: 0.4s; }
          .input-wrap:nth-child(2) { animation-delay: 0.5s; }

          @keyframes fadeUp {
            to { opacity: 1; transform: translateY(0); }
          }

          .input-wrap label {
            display: block;
            font-size: 0.85rem;
            font-weight: 700;
            color: #475569;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          input {
            width: 100%;
            padding: 16px 20px;
            background: #f1f5f9;
            border: 2px solid transparent;
            border-radius: 16px;
            font-size: 1rem;
            color: #0f172a;
            transition: all 0.3s;
            box-sizing: border-box;
          }

          input:focus {
            outline: none;
            background: #fff;
            border-color: var(--brand-primary);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          }

          [data-test-id="login-button"] {
            width: 100%;
            padding: 18px;
            background: var(--brand-primary);
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 12px;
            box-shadow: 0 8px 20px -6px rgba(99, 102, 241, 0.6);
            position: relative;
          }

          [data-test-id="login-button"]:hover {
            background: var(--brand-secondary);
            transform: translateY(-2px);
            box-shadow: 0 12px 24px -6px rgba(99, 102, 241, 0.7);
          }

          [data-test-id="login-button"]:active { transform: scale(0.98); }

          @media (max-width: 1100px) {
            .hero-side { display: none; }
            .form-side { flex: 1; background: var(--bg-deep); }
          }
        `}
      </style>

      <div className="bg-blob"></div>

      <div className="hero-side">
        <div className="gateway-logo">
           <div className="portal-ring"></div>
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-cyan)'}}>
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
           </svg>
        </div>
        <h1>Gateway <br/>System.</h1>
        <p>
          The next generation of high-speed payment infrastructure. 
          Seamlessly bridging UPI, Cards, and Digital Assets for the global economy.
        </p>
      </div>

      <div className="form-side">
        <div className="login-box">
          <h2>Merchant Login</h2>
          <p className="subtitle">Securely access your Gateway dashboard</p>

          <form data-test-id="login-form" onSubmit={handleLogin}>
            <div className="input-wrap">
              <label>Merchant Email</label>
              <input
                data-test-id="email-input"
                type="email"
                placeholder="admin@gateway.io"
                defaultValue="test@example.com"
                required
              />
            </div>

            <div className="input-wrap">
              <label>Private Key / Password</label>
              <input
                data-test-id="password-input"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button data-test-id="login-button" type="submit">
              Open Gateway
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;