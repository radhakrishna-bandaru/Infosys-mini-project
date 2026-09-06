import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingCart,
  Warehouse,
  UserRound,
} from "lucide-react";

import { loginUser as saveLogin } from "../utils/auth";
import { loginUser as apiLogin } from "../services/api";

const roles = [
  {
    id: "farmer",
    label: "Farmer",
    description: "Crops & markets",
    icon: Leaf,
    color: "mint",
  },
  {
    id: "storage",
    label: "Storage Owner",
    description: "Capacity & bookings",
    icon: Warehouse,
    color: "blue",
  },
  {
    id: "buyer",
    label: "Buyer",
    description: "Crops & orders",
    icon: ShoppingCart,
    color: "coral",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Platform control",
    icon: ShieldCheck,
    color: "violet",
  },
];

const dashboardRoutes = {
  farmer: "/farmer",
  storage: "/storage",
  buyer: "/buyer",
  admin: "/admin",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("farmer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = roles.find((item) => item.id === role);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your email/phone and password.");
      return;
    }

    setLoading(true);

    try {
      const isEmail = identifier.includes("@");

      const response = await apiLogin({
        ...(isEmail
          ? { email: identifier.trim() }
          : { phone: identifier.trim() }),
        password,
        role,
      });

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      saveLogin(role, response.user, response.token);

      const requestedPath = location.state?.from;

      const validPath =
        requestedPath &&
        requestedPath.startsWith(`/${role}`);

      navigate(
        validPath
          ? requestedPath
          : dashboardRoutes[role],
        { replace: true }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to Smart Farmer server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <><style>{`
.login-page {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f7faf5;
  color: #17221b;
  overflow-x: hidden;
}

/* =========================
   LEFT PANEL
   ========================= */

.login-left {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 70px;
  overflow: hidden;

  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(117, 218, 145, 0.25),
      transparent 35%
    ),
    radial-gradient(
      circle at 85% 80%,
      rgba(75, 190, 112, 0.18),
      transparent 35%
    ),
    linear-gradient(
      145deg,
      #0b4425 0%,
      #126331 48%,
      #23834a 100%
    );
}

.login-left::before {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  right: -180px;
  top: -180px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.login-left::after {
  content: "";
  position: absolute;
  width: 520px;
  height: 520px;
  left: -300px;
  bottom: -300px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.07);
}

/* =========================
   BRAND
   ========================= */

.brand {
  position: absolute;
  top: 38px;
  left: 60px;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 12px;

  color: #ffffff;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.brand svg {
  width: 34px;
  height: 34px;
  color: #b9f5c8;
  flex-shrink: 0;
}

/* =========================
   LEFT CONTENT
   ========================= */

.left-content {
  position: relative;
  z-index: 2;
  max-width: 560px;
  margin: auto 0;
}

.left-content h1 {
  margin: 0;
  color: #ffffff;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -2.5px;
}

.left-content h1 span {
  color: #aaf0bc;
}

.left-content p {
  max-width: 500px;
  margin: 24px 0 0;

  color: rgba(255, 255, 255, 0.82);
  font-size: 17px;
  line-height: 1.7;
}

/* =========================
   PRODUCT POINTS
   ========================= */

.product-points {
  display: grid;
  gap: 15px;
  margin-top: 34px;
}

.product-points > div {
  display: flex;
  align-items: center;
  gap: 13px;

  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600;
}

.product-points svg {
  width: 21px;
  height: 21px;
  padding: 3px;

  color: #0f6b32;
  background: #baf4c8;
  border-radius: 50%;

  flex-shrink: 0;
}

/* =========================
   RIGHT PANEL
   ========================= */

.login-right {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 60px 55px;

  background: #f7faf5;
}

/* =========================
   FORM WRAPPER
   ========================= */

.form-wrap {
  width: 100%;
  max-width: 500px;
}

/* =========================
   FORM HEADER
   ========================= */

.form-header {
  margin-bottom: 26px;
}

.form-header h2 {
  margin: 0;

  color: #17221b;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -1px;
}

.form-header p {
  margin: 9px 0 0;

  color: #718078;
  font-size: 15px;
  line-height: 1.6;
}

/* =========================
   ROLE CARDS
   ========================= */

.roles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.roles button {
  min-width: 0;
  min-height: 76px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;

  padding: 10px 6px;

  color: #607068;
  background: #ffffff;

  border: 1px solid #dce8df;
  border-radius: 15px;

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.roles button:hover {
  transform: translateY(-2px);
  border-color: #8dcca1;
  box-shadow: 0 8px 20px rgba(27, 105, 54, 0.08);
}

.roles button.active {
  color: #126331;
  background: #e8f7ec;
  border-color: #5db879;
  box-shadow: 0 8px 22px rgba(28, 122, 62, 0.12);
}

.roles button svg {
  width: 21px;
  height: 21px;
  flex-shrink: 0;
}

/* =========================
   FORM CARD
   ========================= */

.form-card {
  padding: 30px;

  background: #ffffff;

  border: 1px solid #e1ebe4;
  border-radius: 22px;

  box-shadow:
    0 20px 50px rgba(25, 70, 39, 0.08),
    0 3px 10px rgba(25, 70, 39, 0.03);
}

/* =========================
   SELECTED ROLE
   ========================= */

.selected-role {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-bottom: 22px;
  padding: 13px 15px;

  color: #176638;
  background: #edf9f0;

  border: 1px solid #d5eddc;
  border-radius: 13px;

  font-size: 14px;
  font-weight: 800;
}

.selected-role svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* =========================
   FIELDS
   ========================= */

.field {
  margin-bottom: 20px;
  position: relative;
}

.field label {
  display: block;
  margin-bottom: 8px;
  color: #17221b;
  font-size: 14px;
  font-weight: 800;
}

.input {
  width: 100%;
  height: 54px;
  padding: 0 48px 0 52px;

  color: #17221b;
  background: #ffffff;

  border: 1px solid #d8e4db;
  border-radius: 14px;

  outline: none;
  font-size: 15px;
}

.input::placeholder {
  color: #9aa79f;
}

.input:focus {
  border-color: #23904b;
  box-shadow: 0 0 0 4px rgba(35, 144, 75, 0.10);
}
  /* =========================
   INPUT ICONS - FIXED
   ========================= */

.input-wrap {
  position: relative;
  width: 100%;
}

.input-wrap .input-icon {
  position: absolute;
  left: 17px;
  top: 50%;
  transform: translateY(-50%);

  width: 20px;
  height: 20px;

  color: #26352c;
  stroke-width: 2;

  pointer-events: none;
  z-index: 2;
}

.input-wrap .input {
  width: 100%;
  height: 54px;

  padding-left: 52px;
  padding-right: 52px;
}

.password-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);

  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  color: #26352c;
  background: transparent;

  border: none;
  border-radius: 8px;

  cursor: pointer;
  z-index: 3;
}

.password-button:hover {
  color: #126b35;
  background: #edf8f0;
}

.password-button svg {
  width: 20px;
  height: 20px;
  position: static;
}
  .small-label {
  color: #9af0ae !important;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 14px;
}
/* =========================
   SUBMIT BUTTON
   ========================= */

.submit {
  width: 100%;
  min-height: 52px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  margin-top: 7px;

  color: #ffffff;

  background: linear-gradient(
    135deg,
    #0f6331,
    #23834a
  );

  border: none;
  border-radius: 13px;

  font-size: 15px;
  font-weight: 900;

  cursor: pointer;

  box-shadow:
    0 10px 22px rgba(20, 111, 52, 0.22);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.submit:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 28px rgba(20, 111, 52, 0.28);
}

.submit:active {
  transform: translateY(0);
}

.submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* =========================
   SECURITY
   ========================= */

.security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  margin-top: 18px;

  color: #829088;
  font-size: 12px;
  text-align: center;
}

.security svg {
  width: 15px;
  height: 15px;
  color: #299052;
  flex-shrink: 0;
}

/* =========================
   CREATE ACCOUNT
   ========================= */

.create-account {
  margin-top: 22px;

  color: #718078;
  font-size: 14px;
  text-align: center;
}

.create-account a {
  color: #16703a;
  font-weight: 900;
  text-decoration: none;
}

.create-account a:hover {
  text-decoration: underline;
}

/* =========================
   BACK BUTTON
   ========================= */

.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  margin-top: 18px;

  color: #64736b;
  background: transparent;

  border: none;

  font-size: 13px;
  font-weight: 800;

  cursor: pointer;
}

.back:hover {
  color: #126331;
}

.back svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* =========================
   GENERAL SAFETY
   ========================= */

.login-page *,
.login-page *::before,
.login-page *::after {
  box-sizing: border-box;
}

.login-page h1,
.login-page h2,
.login-page h3,
.login-page p {
  overflow-wrap: break-word;
}

.login-page button,
.login-page input {
  font-family: inherit;
}

.login-page button {
  flex-shrink: 0;
}

.login-page svg {
  flex-shrink: 0;
}

/* =========================
   TABLET
   ========================= */

@media (max-width: 1000px) {
  .login-left {
    padding: 50px 45px;
  }

  .login-right {
    padding: 50px 35px;
  }

  .brand {
    left: 40px;
  }

  .left-content h1 {
    font-size: 48px;
  }

  .roles {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* =========================
   MOBILE
   ========================= */

@media (max-width: 820px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    min-height: auto;
    padding: 110px 28px 50px;
  }

  .brand {
    top: 28px;
    left: 28px;
  }

  .left-content {
    margin: 0;
  }

  .left-content h1 {
    font-size: 44px;
  }

  .login-right {
    min-height: auto;
    padding: 45px 22px 55px;
  }

  .form-wrap {
    max-width: 560px;
  }
}
  .login-options {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 8px 0 20px;
}

.remember-option {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  color: #26352c;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.remember-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: #16803f;
  cursor: pointer;
}

.forgot-password {
  flex-shrink: 0;
  padding: 0;
  color: #126b35;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.forgot-password:hover {
  color: #0b4d26;
  text-decoration: underline;
}

/* =========================
   SMALL MOBILE
   ========================= */

@media (max-width: 480px) {
  .login-left {
    padding: 100px 20px 40px;
  }

  .brand {
    left: 20px;
    font-size: 20px;
  }

  .left-content h1 {
    font-size: 37px;
    letter-spacing: -1.5px;
  }

  .left-content p {
    font-size: 15px;
  }

  .login-right {
    padding: 35px 16px 45px;
  }

  .form-header h2 {
    font-size: 29px;
  }

  .form-card {
    padding: 21px 17px;
    border-radius: 18px;
  }

  .roles {
    gap: 8px;
  }

  .roles button {
    min-height: 70px;
  }
`}</style>

      <div className="login-page">

        {/* ================= LEFT ================= */}

        <section className="login-left">

          <Link
            to="/"
            className="brand"
          >
            <div className="brand-mark">
              <Leaf size={23} />
            </div>

            <div>
              <div className="brand-name">
                Smart Farmer
              </div>

              <div className="brand-sub">
                AI-powered agriculture
              </div>
            </div>
          </Link>


          <div className="left-content">

            <div className="small-label">
              Smart agriculture platform
            </div>

            <h1 className="left-title">
              Grow better.
              <br />
              <span>Sell smarter.</span>
            </h1>

            <p className="left-description">
              One place to manage your crops, understand
              market prices, find storage and make better
              selling decisions.
            </p>

            <div className="product-points">

              <div className="product-point">
                <Leaf size={14} />
                Crop management
              </div>

              <div className="product-point">
                <TrendingIcon />
                Market intelligence
              </div>

              <div className="product-point">
                <Warehouse size={14} />
                Cold storage
              </div>

            </div>

          </div>


          <div className="left-bottom">
            <span>
              SMART FARMER
            </span>

            <span>
              GROW • STORE • SELL
            </span>
          </div>

        </section>


        {/* ================= RIGHT ================= */}

        <section className="login-right">

          <div className="form-wrap">

            <div className="form-header">

              <div className="welcome">
                Welcome back
              </div>

              <h2 className="form-title">
                Sign in to your account
              </h2>

              <p className="form-description">
                Select your role and continue to your
                Smart Farmer workspace.
              </p>

            </div>


            <div className="section-label">
              Continue as
            </div>


            <div className="roles">

              {roles.map((item) => {

                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRole(item.id);
                      setError("");
                    }}
                    className={`role ${
                      role === item.id
                        ? "active"
                        : ""
                    }`}
                  >

                    <div
                      className={`role-icon role-${item.color}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div>
                      <div className="role-name">
                        {item.label}
                      </div>

                      <div className="role-description">
                        {item.description}
                      </div>
                    </div>

                  </button>
                );

              })}

            </div>


            <form
              className="form-card"
              onSubmit={handleLogin}
            >

              <div className="selected-role">

                <div className="selected-role-icon">
                  <UserRound size={17} />
                </div>

                <div>
                  <div className="selected-label">
                    Signing in as
                  </div>

                  <div className="selected-name">
                    {selectedRole?.label}
                  </div>
                </div>

              </div>


              {error && (
                <div className="error">
                  {error}
                </div>
              )}


              <div className="field">

                <label className="field-label">
                  Email or phone
                </label>

                <div className="input-wrap">

                  <Mail
                    className="input-icon"
                    size={16}
                  />

                  <input
                    className="input"
                    value={identifier}
                    onChange={(e) =>
                      setIdentifier(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="username"
                  />

                </div>

              </div>


              <div className="field">

                <label className="field-label">
                  Password
                </label>

                <div className="input-wrap">

                  <LockKeyhole
                    className="input-icon"
                    size={16}
                  />

                  <input
                    className="input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>

                </div>

              </div>


            <div className="login-options">
  <label className="remember-option">
    <input
      type="checkbox"
      checked={remember}
      onChange={(e) => setRemember(e.target.checked)}
    />
    <span>Keep me signed in</span>
  </label>

  <button
    type="button"
    className="forgot-password"
    onClick={() =>
      setError("Password reset feature is coming soon.")
    }
  >
    Forgot password?
  </button>
</div>


              <button
                type="submit"
                className="submit"
                disabled={loading}
              >

                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}

              </button>


              <div className="security">

                <ShieldCheck size={12} />

                Secure Smart Farmer authentication

              </div>

            </form>


            <div className="create-account">

              Don't have an account?{" "}

              <Link to="/register">
                Create one
              </Link>

            </div>


            <Link
              to="/"
              className="back"
            >
              ← Back to Smart Farmer
            </Link>

          </div>

        </section>

      </div>
    </>
  );
}


/* Small local icon so no extra dependency is needed */
function TrendingIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  );
}