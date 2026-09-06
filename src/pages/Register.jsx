import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  Warehouse,
  TrendingUp,
} from "lucide-react";

import { loginUser as saveLogin } from "../utils/auth";
import { registerUser as apiRegister } from "../services/api";
import { setStorage } from "../utils/storage";

const roles = [
  {
    id: "farmer",
    label: "Farmer",
    description: "Grow & sell crops",
    icon: Leaf,
    color: "mint",
  },
  {
    id: "storage",
    label: "Storage Owner",
    description: "Manage cold storage",
    icon: Warehouse,
    color: "blue",
  },
  {
    id: "buyer",
    label: "Buyer",
    description: "Source agricultural produce",
    icon: ShoppingCart,
    color: "coral",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Manage the platform",
    icon: ShieldCheck,
    color: "violet",
  },
];

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("farmer");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    farmName: "",
    businessName: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  const validateStepOne = () => {
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return false;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      setError("Please enter an email or phone number.");
      return false;
    }

    if (form.email && !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const validateStepTwo = () => {
    if (!form.password) {
      setError("Please create a password.");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (!form.location.trim()) {
      setError("Please enter your location.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStepOne()) return;

    setStep(2);
    setError("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!validateStepTwo()) return;

    setLoading(true);
    setError("");

    try {
      const response = await apiRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role,
        location: form.location.trim(),
        farmName: form.farmName.trim(),
        businessName: form.businessName.trim(),
      });

      if (!response.success) {
        throw new Error(
          response.message || "Registration failed"
        );
      }

      const user = {
        ...response.user,
        location: form.location.trim(),
        farmName: form.farmName.trim(),
        businessName: form.businessName.trim(),
      };

      /* Farmer profile */

      if (role === "farmer") {
        setStorage("farmerProfile", {
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          farmName: user.farmName,
          farmSize: "",
          crops: [],
          language: "English",
          notifications: true,
          voiceAssistant: true,
          marketAlerts: true,
        });
      }

      /* Storage profile */

      if (role === "storage") {
        setStorage("storageProfile", {
          ownerName: user.name,
          email: user.email,
          phone: user.phone,
          facilityName:
            user.businessName ||
            `${user.name}'s Storage`,
          location: user.location,
          capacity: 1000,
          temperature: "2–8°C",
          storageType: "Cold Storage",
          description: "",
          verified: false,
          active: true,
        });
      }

      /* Buyer profile */

      if (role === "buyer") {
        setStorage("buyerProfile", {
          name: user.name,
          email: user.email,
          phone: user.phone,
          businessName:
            user.businessName ||
            `${user.name}'s Business`,
          location: user.location,
          procurementType: "Wholesale",
          preferredCrops: [],
          notifications: true,
          priceAlerts: true,
        });
      }

      saveLogin(
        role,
        user,
        response.token
      );

      setLoading(false);

      const dashboard = {
        farmer: "/farmer",
        storage: "/storage",
        buyer: "/buyer",
        admin: "/admin",
      };

      navigate(
        dashboard[role] || "/login",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to Smart Farmer server."
      );

      setLoading(false);
    }
  };

  const selectedRole = roles.find(
    (item) => item.id === role
  );

  const RoleIcon = selectedRole?.icon || Leaf;

  return (
    <>
      <style>{`
/* =====================================================
   SMART FARMER REGISTER - GREEN + WHITE THEME
===================================================== */

.register-page {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f7faf5;
  color: #17221b;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
}

/* =====================================================
   LEFT
===================================================== */

.register-left {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 38px 60px;

  background:
    radial-gradient(
      circle at 85% 18%,
      rgba(120, 225, 145, .20),
      transparent 32%
    ),
    radial-gradient(
      circle at 10% 85%,
      rgba(82, 190, 110, .18),
      transparent 35%
    ),
    linear-gradient(
      145deg,
      #0b4425 0%,
      #126331 50%,
      #23834a 100%
    );

  overflow: hidden;
}

.register-left::before {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  right: -260px;
  bottom: -270px;
  border: 1px solid rgba(180, 255, 195, .16);
  border-radius: 50%;
}

.register-left::after {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  left: -250px;
  bottom: -280px;
  border: 1px solid rgba(180, 255, 195, .10);
  border-radius: 50%;
}

/* =====================================================
   BRAND
===================================================== */

.register-brand {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  gap: 12px;

  width: fit-content;

  color: #ffffff;
  text-decoration: none;
}

.register-brand-icon {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #126331;
  background: #d9f8df;

  border-radius: 14px;
}

.register-brand-icon svg {
  width: 25px;
  height: 25px;
}

.register-brand-name {
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -.04em;
}

.register-brand-sub {
  margin-top: 3px;
  color: #b9edc5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
}

/* =====================================================
   LEFT CONTENT
===================================================== */

.register-left-content {
  position: relative;
  z-index: 2;
  max-width: 570px;
  margin: auto 0;
}

.register-kicker {
  display: flex;
  align-items: center;
  gap: 9px;

  color: #a8f1b8;
  font-size: 16px;
  font-weight: 700;
}

.register-kicker::before {
  content: "";
  width: 8px;
  height: 8px;
  flex-shrink: 0;

  background: #a8f1b8;
  border-radius: 50%;
}

.register-left-title {
  margin: 18px 0 0;

  color: #ffffff;

  font-size: clamp(43px, 5vw, 68px);
  line-height: 1.03;
  letter-spacing: -2.5px;
  font-weight: 950;
}

.register-left-title span {
  color: #a8f1b8;
}

.register-left-description {
  max-width: 500px;
  margin-top: 22px;

  color: rgba(255,255,255,.84);

  font-size: 16px;
  line-height: 1.7;
}

/* =====================================================
   FEATURES
===================================================== */

.register-features {
  margin-top: 30px;
  display: grid;
  gap: 12px;
}

.register-feature {
  width: fit-content;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 9px 13px;

  color: #ffffff;
  background: rgba(255,255,255,.055);

  border: 1px solid rgba(255,255,255,.10);
  border-radius: 12px;

  font-size: 13px;
  font-weight: 700;
}

.register-feature-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #126331;
  background: #d9f8df;

  border-radius: 9px;
}

/* =====================================================
   LEFT FOOTER
===================================================== */

.register-left-footer {
  position: relative;
  z-index: 2;

  display: flex;
  justify-content: space-between;
  gap: 15px;

  color: rgba(255,255,255,.72);

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

/* =====================================================
   RIGHT
===================================================== */

.register-right {
  min-height: 100vh;

  display: flex;
  justify-content: center;

  padding: 42px 55px;

  background: #f7faf5;
  overflow-y: auto;
}

.register-content {
  width: 100%;
  max-width: 600px;
  margin: auto 0;

  animation: registerEnter .4s ease-out both;
}

@keyframes registerEnter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =====================================================
   HEADER
===================================================== */

.register-welcome {
  color: #23834a;
  font-size: 13px;
  font-weight: 900;
}

.register-title {
  margin-top: 7px;

  color: #17221b;

  font-size: 35px;
  line-height: 1.12;
  letter-spacing: -1.2px;
  font-weight: 950;
}

.register-subtitle {
  margin-top: 8px;

  color: #718078;

  font-size: 14px;
  line-height: 1.6;
}

/* =====================================================
   PROGRESS
===================================================== */

.register-progress {
  margin-top: 25px;

  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.progress-circle {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #718078;
  background: #ffffff;

  border: 1px solid #d8e5dc;
  border-radius: 50%;

  font-size: 11px;
  font-weight: 900;
}

.progress-circle.active,
.progress-circle.completed {
  color: #ffffff;
  background: #188044;
  border-color: #188044;
}

.progress-line {
  height: 2px;
  flex: 1;

  background: #dbe7de;
  border-radius: 999px;
}

.progress-line.completed {
  background: #188044;
}

.progress-text {
  color: #8a978f;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.progress-text.active {
  color: #176638;
}

/* =====================================================
   ROLE
===================================================== */

.register-section-label {
  margin-top: 25px;
  margin-bottom: 10px;

  color: #26352c;

  font-size: 13px;
  font-weight: 900;
}

.register-roles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.register-role {
  min-width: 0;
  min-height: 82px;

  padding: 10px 7px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 7px;

  color: #425048;
  background: #ffffff;

  border: 1px solid #dce8df;
  border-radius: 15px;

  cursor: pointer;

  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}

.register-role:hover {
  transform: translateY(-2px);
  border-color: #7bc792;

  box-shadow: 0 8px 22px rgba(27,105,54,.08);
}

.register-role.active {
  color: #126331;
  background: #e8f7ec;
  border-color: #5db879;

  box-shadow: 0 8px 22px rgba(28,122,62,.11);
}

.register-role-icon {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.register-role-icon-mint,
.register-role-icon-blue,
.register-role-icon-coral,
.register-role-icon-violet {
  color: #17713b;
  background: #e8f7ec;
}

.register-role.active .register-role-icon {
  color: #ffffff;
  background: #188044;
}

.register-role-name {
  color: inherit;
  font-size: 11px;
  font-weight: 900;
  text-align: center;
  overflow-wrap: break-word;
}

/* =====================================================
   FORM
===================================================== */

.register-form {
  margin-top: 17px;
  padding: 25px;

  background: #ffffff;

  border: 1px solid #e0ebe3;
  border-radius: 20px;

  box-shadow:
    0 20px 50px rgba(25,70,39,.08),
    0 3px 10px rgba(25,70,39,.03);
}

/* =====================================================
   SELECTED ROLE
===================================================== */

.selected-role {
  margin-bottom: 18px;
  padding: 13px 14px;

  display: flex;
  align-items: center;
  gap: 11px;

  background: #edf9f0;
  border: 1px solid #d5eddc;
  border-radius: 13px;
}

.selected-role-icon {
  width: 37px;
  height: 37px;
  flex: 0 0 37px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #16713a;
  background: #d9f4df;

  border-radius: 10px;
}

.selected-role-small {
  color: #718078;
  font-size: 10px;
}

.selected-role-name {
  margin-top: 2px;

  color: #176638;

  font-size: 14px;
  font-weight: 900;
}

/* =====================================================
   ERROR
===================================================== */

.register-error {
  margin-bottom: 15px;
  padding: 11px 13px;

  color: #a33d35;
  background: #fff3f1;

  border: 1px solid #f0cbc6;
  border-radius: 11px;

  font-size: 12px;
  line-height: 1.5;
}

/* =====================================================
   FIELDS
===================================================== */

.register-field {
  margin-top: 17px;
}

.register-field:first-child {
  margin-top: 0;
}

.register-label {
  display: block;

  margin-bottom: 8px;

  color: #26352c;

  font-size: 12px;
  font-weight: 900;
}

.register-input-wrap {
  position: relative;
  width: 100%;
}

.register-input-icon {
  position: absolute;

  left: 16px;
  top: 50%;

  width: 19px;
  height: 19px;

  transform: translateY(-50%);

  color: #53635a;

  pointer-events: none;
  z-index: 2;
}

.register-input {
  width: 100%;
  height: 50px;

  padding: 0 48px 0 48px;

  color: #17221b;
  background: #fbfdfb;

  border: 1px solid #d8e4db;
  border-radius: 12px;

  outline: none;

  font-size: 14px;

  transition:
    border-color .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}

.register-input::placeholder {
  color: #9aa79f;
}

.register-input:hover {
  border-color: #a8cbb1;
}

.register-input:focus {
  background: #ffffff;
  border-color: #23904b;

  box-shadow:
    0 0 0 4px rgba(35,144,75,.10);
}

/* =====================================================
   PASSWORD EYE
===================================================== */

.register-password-button {
  position: absolute;

  right: 10px;
  top: 50%;

  width: 34px;
  height: 34px;

  transform: translateY(-50%);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  color: #53635a;
  background: transparent;

  border: none;
  border-radius: 8px;

  cursor: pointer;

  z-index: 3;
}

.register-password-button:hover {
  color: #126331;
  background: #edf8f0;
}

.register-password-button svg {
  width: 19px;
  height: 19px;
}

/* =====================================================
   GRID
===================================================== */

.register-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* =====================================================
   SECURITY
===================================================== */

.security-box {
  margin-top: 17px;
  padding: 13px;

  display: flex;
  gap: 10px;

  background: #edf9f0;
  border: 1px solid #d5eddc;
  border-radius: 12px;
}

.security-box svg {
  flex: 0 0 auto;
  color: #23834a;
}

.security-title {
  color: #27623d;
  font-size: 11px;
  font-weight: 900;
}

.security-text {
  margin-top: 3px;

  color: #718078;

  font-size: 10px;
  line-height: 1.5;
}

/* =====================================================
   BUTTONS
===================================================== */

.register-actions {
  margin-top: 19px;

  display: flex;
  gap: 10px;
}

.register-button {
  height: 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;

  border-radius: 12px;

  font-size: 13px;
  font-weight: 900;

  cursor: pointer;

  transition:
    transform .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.register-button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.register-back-button {
  flex: 1;

  color: #53635a;
  background: #f2f6f3;

  border: 1px solid #dbe6df;
}

.register-back-button:hover:not(:disabled) {
  background: #e9f2ec;
}

.register-next-button {
  flex: 1.7;

  color: #ffffff;
  background: linear-gradient(
    135deg,
    #0f6331,
    #23834a
  );

  border: none;

  box-shadow:
    0 10px 22px rgba(20,111,52,.20);
}

.register-next-button:hover:not(:disabled) {
  box-shadow:
    0 14px 28px rgba(20,111,52,.27);
}

/* =====================================================
   BOTTOM LINKS
===================================================== */

.register-login {
  margin-top: 20px;

  color: #718078;

  text-align: center;

  font-size: 13px;
}

.register-login a {
  color: #16703a;
  font-weight: 900;
  text-decoration: none;
}

.register-login a:hover {
  text-decoration: underline;
}

.register-back-home {
  display: block;

  margin-top: 12px;

  color: #607068;

  text-align: center;

  font-size: 12px;
  font-weight: 700;

  text-decoration: none;
}

.register-back-home:hover {
  color: #126331;
}

/* =====================================================
   SAFETY
===================================================== */

.register-page *,
.register-page *::before,
.register-page *::after {
  box-sizing: border-box;
}

.register-page svg {
  flex-shrink: 0;
}

.register-page input,
.register-page button {
  font-family: inherit;
}

.register-page h1,
.register-page h2,
.register-page p,
.register-page span,
.register-page label {
  overflow-wrap: break-word;
}

/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1050px) {
  .register-left {
    padding: 35px 40px;
  }

  .register-right {
    padding: 35px 30px;
  }

  .register-left-title {
    font-size: 50px;
  }
}

@media (max-width: 850px) {
  .register-page {
    grid-template-columns: 1fr;
  }

  .register-left {
    min-height: auto;
    padding: 45px 28px;
  }

  .register-left-content {
    margin-top: 55px;
  }

  .register-left-footer {
    margin-top: 40px;
  }

  .register-right {
    min-height: auto;
    padding: 40px 22px 55px;
  }

  .register-content {
    max-width: 600px;
  }
}

@media (max-width: 560px) {
  .register-left {
    padding: 35px 20px;
  }

  .register-left-title {
    font-size: 40px;
    letter-spacing: -1.5px;
  }

  .register-left-description {
    font-size: 14px;
  }

  .register-left-footer {
    font-size: 8px;
  }

  .register-right {
    padding: 30px 15px 45px;
  }

  .register-title {
    font-size: 29px;
  }

  .register-form {
    padding: 19px 16px;
    border-radius: 17px;
  }

  .register-roles {
    grid-template-columns: repeat(2, 1fr);
  }

  .register-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .register-role {
    min-height: 70px;
  }

  .register-actions {
    flex-direction: column;
  }

  .register-back-button,
  .register-next-button {
    flex: none;
    width: 100%;
  }
}
`}</style>


      <div className="register-page">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <section className="register-left">

          <Link
            to="/"
            className="register-brand"
          >

            <div className="register-brand-icon">
              <Leaf size={22} />
            </div>

            <div>

              <div className="register-brand-name">
                Smart Farmer
              </div>

              <div className="register-brand-sub">
                AI-powered agriculture
              </div>

            </div>

          </Link>


          <div className="register-left-content">

            <div className="register-kicker">
              Smart agriculture platform
            </div>

            <h1 className="register-left-title">
              Start growing.
              <br />
              <span>Start smarter.</span>
            </h1>

            <p className="register-left-description">
              Create your Smart Farmer workspace and bring
              crops, markets, storage, buyers and profit
              decisions together in one place.
            </p>


            <div className="register-features">

              <div className="register-feature">

                <div className="register-feature-icon">
                  <Leaf size={15} />
                </div>

                Manage your crops

              </div>


              <div className="register-feature">

                <div className="register-feature-icon">
                  <TrendingUp size={15} />
                </div>

                Understand market opportunities

              </div>


              <div className="register-feature">

                <div className="register-feature-icon">
                  <Warehouse size={15} />
                </div>

                Find and manage cold storage

              </div>

            </div>

          </div>


          <div className="register-left-footer">

            <span>
              SMART FARMER
            </span>

            <span>
              GROW • STORE • SELL
            </span>

          </div>

        </section>


        {/* =================================================
            RIGHT PANEL
        ================================================= */}

        <section className="register-right">

          <div className="register-content">

            <div>

              <div className="register-welcome">
                Create your account
              </div>

              <h2 className="register-title">
                Join Smart Farmer
              </h2>

              <p className="register-subtitle">
                Set up your workspace in two simple steps.
              </p>

            </div>


            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="register-progress">

              <div className="progress-step">

                <div
                  className={`progress-circle ${
                    step === 1
                      ? "active"
                      : "completed"
                  }`}
                >
                  {step > 1 ? (
                    <Check size={13} />
                  ) : (
                    "1"
                  )}
                </div>

                <div
                  className={`progress-text ${
                    step === 1
                      ? "active"
                      : ""
                  }`}
                >
                  Your details
                </div>

              </div>


              <div
                className={`progress-line ${
                  step > 1
                    ? "completed"
                    : ""
                }`}
              />


              <div className="progress-step">

                <div
                  className={`progress-circle ${
                    step === 2
                      ? "active"
                      : ""
                  }`}
                >
                  2
                </div>

                <div
                  className={`progress-text ${
                    step === 2
                      ? "active"
                      : ""
                  }`}
                >
                  Secure account
                </div>

              </div>

            </div>


            {/* =================================================
                ROLE
            ================================================= */}

            <div className="register-section-label">
              I am joining as
            </div>

            <div className="register-roles">

              {roles.map((item) => {

                const Icon = item.icon;

                const active =
                  role === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRole(item.id);
                      setError("");
                    }}
                    className={`
                      register-role
                      ${active ? "active" : ""}
                      ${
                        active
                          ? `active-${item.color}`
                          : ""
                      }
                    `}
                  >

                    <div
                      className={`
                        register-role-icon
                        register-role-icon-${item.color}
                      `}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="register-role-name">
                      {item.label}
                    </div>

                  </button>
                );

              })}

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleRegister}
              className="register-form"
            >

              {/* SELECTED ROLE */}

              <div className="selected-role">

                <div className="selected-role-icon">
                  <RoleIcon size={16} />
                </div>

                <div>

                  <div className="selected-role-small">
                    Creating workspace as
                  </div>

                  <div className="selected-role-name">
                    {selectedRole?.label}
                  </div>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}


              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <div>

                  {/* NAME */}

                  <div className="register-field">

                    <label className="register-label">
                      Full name
                    </label>

                    <div className="register-input-wrap">

                      <UserRound
                        className="register-input-icon"
                        size={16}
                      />

                      <input
                        className="register-input"
                        value={form.name}
                        onChange={(e) =>
                          updateField(
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Enter your full name"
                      />

                    </div>

                  </div>


                  {/* EMAIL + PHONE */}

                  <div className="register-grid">

                    <div className="register-field">

                      <label className="register-label">
                        Email
                      </label>

                      <div className="register-input-wrap">

                        <Mail
                          className="register-input-icon"
                          size={16}
                        />

                        <input
                          type="email"
                          className="register-input"
                          value={form.email}
                          onChange={(e) =>
                            updateField(
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="you@example.com"
                        />

                      </div>

                    </div>


                    <div className="register-field">

                      <label className="register-label">
                        Phone
                      </label>

                      <div className="register-input-wrap">

                        <Phone
                          className="register-input-icon"
                          size={16}
                        />

                        <input
                          className="register-input"
                          value={form.phone}
                          onChange={(e) =>
                            updateField(
                              "phone",
                              e.target.value
                            )
                          }
                          placeholder="+91 98765 43210"
                        />

                      </div>

                    </div>

                  </div>


                  {/* LOCATION */}

                  <div className="register-field">

                    <label className="register-label">
                      Location
                    </label>

                    <div className="register-input-wrap">

                      <MapPin
                        className="register-input-icon"
                        size={16}
                      />

                      <input
                        className="register-input"
                        value={form.location}
                        onChange={(e) =>
                          updateField(
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="Village, district, state"
                      />

                    </div>

                  </div>


                  {/* FARM NAME */}

                  {role === "farmer" && (
                    <div className="register-field">

                      <label className="register-label">
                        Farm name
                      </label>

                      <div className="register-input-wrap">

                        <Leaf
                          className="register-input-icon"
                          size={16}
                        />

                        <input
                          className="register-input"
                          value={form.farmName}
                          onChange={(e) =>
                            updateField(
                              "farmName",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Green Valley Farm"
                        />

                      </div>

                    </div>
                  )}


                  {/* BUSINESS */}

                  {(role === "storage" ||
                    role === "buyer") && (
                    <div className="register-field">

                      <label className="register-label">
                        {role === "storage"
                          ? "Facility name"
                          : "Business name"}
                      </label>

                      <div className="register-input-wrap">

                        {role === "storage" ? (
                          <Warehouse
                            className="register-input-icon"
                            size={16}
                          />
                        ) : (
                          <ShoppingCart
                            className="register-input-icon"
                            size={16}
                          />
                        )}

                        <input
                          className="register-input"
                          value={form.businessName}
                          onChange={(e) =>
                            updateField(
                              "businessName",
                              e.target.value
                            )
                          }
                          placeholder={
                            role === "storage"
                              ? "e.g. Green Cold Storage"
                              : "e.g. Fresh Foods Pvt Ltd"
                          }
                        />

                      </div>

                    </div>
                  )}


                  <button
                    type="button"
                    onClick={handleNext}
                    className="
                      register-button
                      register-next-button
                      w-full
                    "
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>

                </div>
              )}


              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <div>

                  {/* PASSWORD */}

                  <div className="register-field">

                    <label className="register-label">
                      Create password
                    </label>

                    <div className="register-input-wrap">

                      <LockKeyhole
                        className="register-input-icon"
                        size={16}
                      />

                      <input
                        className="register-input"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={form.password}
                        onChange={(e) =>
                          updateField(
                            "password",
                            e.target.value
                          )
                        }
                        placeholder="Minimum 6 characters"
                      />

                      <button
                        type="button"
                        className="register-password-button"
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


                  {/* CONFIRM PASSWORD */}

                  <div className="register-field">

                    <label className="register-label">
                      Confirm password
                    </label>

                    <div className="register-input-wrap">

                      <LockKeyhole
                        className="register-input-icon"
                        size={16}
                      />

                      <input
                        className="register-input"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={form.confirmPassword}
                        onChange={(e) =>
                          updateField(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                        placeholder="Repeat your password"
                      />

                      <button
                        type="button"
                        className="register-password-button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                    </div>

                  </div>


                  {/* SECURITY */}

                  <div className="security-box">

                    <ShieldCheck size={16} />

                    <div>

                      <div className="security-title">
                        Secure Smart Farmer account
                      </div>

                      <div className="security-text">
                        Your account is securely registered
                        through the Smart Farmer server.
                      </div>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="register-actions">

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                      className="
                        register-button
                        register-back-button
                      "
                    >
                      <ArrowLeft size={15} />
                      Back
                    </button>


                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        register-button
                        register-next-button
                      "
                    >

                      {loading ? (
                        <>
                          <span
                            style={{
                              width: 13,
                              height: 13,
                              borderRadius: "50%",
                              border:
                                "2px solid rgba(0,0,0,.20)",
                              borderTopColor:
                                "#071613",
                              animation:
                                "registerSpin .7s linear infinite",
                            }}
                          />

                          Creating...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight size={16} />
                        </>
                      )}

                    </button>

                  </div>

                </div>
              )}

            </form>


            {/* LINKS */}

            <div className="register-login">

              Already have an account?{" "}

              <Link to="/login">
                Sign in
              </Link>

            </div>

            <Link
              to="/"
              className="register-back-home"
            >
              ← Back to Smart Farmer
            </Link>

          </div>

        </section>

      </div>


      <style>{`
        @keyframes registerSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}