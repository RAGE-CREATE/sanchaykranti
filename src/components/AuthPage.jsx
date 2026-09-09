import { useState } from "react";

import {
  ArrowLeft,
  Building2,
  Factory,
  Leaf,
  Loader2,
  LogIn,
  Recycle,
  Truck,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";

import {
  loginUser,
  registerUser,
  PUBLIC_REGISTRATION_ROLES,
} from "../services/authService";

/* =========================================================
   ROLE ICONS
========================================================= */

function RoleIcon({ role, size = 18 }) {
  if (role === "waste_generator") {
    return <Building2 size={size} />;
  }

  if (role === "collection_partner") {
    return <Truck size={size} />;
  }

  if (role === "material_aggregator") {
    return <Warehouse size={size} />;
  }

  if (role === "recovery_facility") {
    return <Recycle size={size} />;
  }

  if (role === "buyer") {
    return <Factory size={size} />;
  }

  return <UserRound size={size} />;
}

/* =========================================================
   ROLE DESCRIPTIONS
========================================================= */

const ROLE_DESCRIPTIONS = {
  waste_generator:
    "Request waste pickup and track your material journey.",

  collection_partner:
    "Accept nearby pickup jobs, collect waste and track earnings.",

  material_aggregator:
    "Manage independently sourced scrap, inventory and dispatch.",

  recovery_facility:
    "Receive, verify, grade and process recovered material.",

  buyer:
    "Find recovered material, create demand and place orders.",
};

/* =========================================================
   LANGUAGES
========================================================= */

const LANGUAGES = [
  {
    id: "en",
    label: "English",
  },
  {
    id: "hi",
    label: "हिन्दी",
  },
  {
    id: "mr",
    label: "मराठी",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function AuthPage({
  initialMode = "login",
  onBack,
}) {
  const [mode, setMode] = useState(initialMode);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    fullName: "",
    organizationName: "",
    phone: "",
    email: "",
    password: "",
    role: "waste_generator",
    preferredLanguage: "en",
    city: "",
    state: "Maharashtra",
  });

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =======================================================
     CHANGE MODE
  ======================================================= */

  function changeMode(nextMode) {
    setMode(nextMode);

    setError("");
    setSuccess("");
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      /* ===================================================
         LOGIN
      =================================================== */

      if (mode === "login") {
        const result =
          await loginUser(
            form.email,
            form.password,
          );

        if (!result.success) {
          setError(result.message);
        }

        /*
          We DO NOT manually redirect here.

          Firebase's auth state listener will detect
          the logged-in user in App.jsx in the next step
          and automatically open the correct dashboard.
        */

        return;
      }

      /* ===================================================
         REGISTER VALIDATION
      =================================================== */

      if (!form.fullName.trim()) {
        setError(
          "Please enter your full name.",
        );

        return;
      }

      if (!form.email.trim()) {
        setError(
          "Please enter your email address.",
        );

        return;
      }

      if (!form.password) {
        setError(
          "Please enter a password.",
        );

        return;
      }

      if (form.password.length < 6) {
        setError(
          "Password must contain at least 6 characters.",
        );

        return;
      }

      if (!form.role) {
        setError(
          "Please select your role.",
        );

        return;
      }

      /* ===================================================
         REGISTER
      =================================================== */

      const result =
        await registerUser({
          email: form.email,
          password: form.password,

          fullName:
            form.fullName,

          organizationName:
            form.organizationName,

          phone:
            form.phone,

          role:
            form.role,

          preferredLanguage:
            form.preferredLanguage,

          city:
            form.city,

          state:
            form.state,
        });

      if (!result.success) {
        setError(result.message);

        return;
      }

      setSuccess(
        "Account created successfully.",
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="auth-page">

      {/* ===================================================
          LEFT SIDE
      =================================================== */}

      <section className="auth-left">

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />

          Back
        </button>

        <div className="auth-brand">

          <div className="brand-mark large">
            <Leaf size={27} />
          </div>

          <div>
            <strong>
              SanchayKranti
            </strong>

            <span>
              Circular Economy Network
            </span>
          </div>

        </div>


        <div className="auth-message">

          <span className="eyebrow">
            COLLECT • RECOVER • REUSE
          </span>

          <h1>
            Making waste valuable,
            traceable and reusable.
          </h1>

          <p>
            A simple digital network connecting
            waste generators, collection partners,
            material aggregators, recovery facilities
            and manufacturers.
          </p>

        </div>


        <div
          style={{
            marginTop: "32px",
            display: "grid",
            gap: "12px",
          }}
        >

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >

            <Truck size={19} />

            <span>
              Simple collection workflow
            </span>

          </div>


          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >

            <Recycle size={19} />

            <span>
              Verified material recovery
            </span>

          </div>


          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >

            <Factory size={19} />

            <span>
              Direct recovered-material marketplace
            </span>

          </div>

        </div>

      </section>


      {/* ===================================================
          RIGHT SIDE
      =================================================== */}

      <section className="auth-right">

        <div className="auth-card">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="auth-header">

            <span className="eyebrow">
              SANCHAYKRANTI NETWORK
            </span>

            <h2>
              {mode === "login"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p>
              {mode === "login"
                ? "Sign in to continue to your workspace."
                : "Join the circular economy network."}
            </p>

          </div>


          {/* =================================================
              LOGIN / REGISTER TABS
          ================================================= */}

          <div className="auth-tabs">

            <button
              type="button"
              className={
                mode === "login"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeMode("login")
              }
            >
              Login
            </button>

            <button
              type="button"
              className={
                mode === "register"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeMode("register")
              }
            >
              Register
            </button>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* ===============================================
                REGISTER FIELDS
            =============================================== */}

            {mode === "register" && (
              <>

                <label>
                  Full Name *

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.fullName}
                    onChange={(event) =>
                      updateField(
                        "fullName",
                        event.target.value,
                      )
                    }
                  />

                </label>


                <label>
                  Organization / Business Name

                  <input
                    type="text"
                    placeholder="Optional"
                    value={
                      form.organizationName
                    }
                    onChange={(event) =>
                      updateField(
                        "organizationName",
                        event.target.value,
                      )
                    }
                  />

                </label>


                {/* ===========================================
                    ROLE
                =========================================== */}

                <div>

                  <span className="field-label">
                    Select your role *
                  </span>


                  <div
                    className="role-selection"
                    style={{
                      gridTemplateColumns:
                        "repeat(1, minmax(0, 1fr))",
                    }}
                  >

                    {PUBLIC_REGISTRATION_ROLES.map(
                      (item) => (
                        <button
                          type="button"
                          key={item.id}
                          className={`role-select ${
                            form.role === item.id
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            updateField(
                              "role",
                              item.id,
                            )
                          }
                          style={{
                            justifyContent:
                              "flex-start",

                            textAlign:
                              "left",

                            padding:
                              "14px",
                          }}
                        >

                          <RoleIcon
                            role={item.id}
                            size={19}
                          />


                          <div
                            style={{
                              display:
                                "flex",

                              flexDirection:
                                "column",

                              alignItems:
                                "flex-start",

                              gap: "3px",
                            }}
                          >

                            <strong>
                              {item.label}
                            </strong>

                            <span
                              style={{
                                fontSize:
                                  "12px",

                                opacity:
                                  0.72,

                                fontWeight:
                                  400,
                              }}
                            >

                              {
                                ROLE_DESCRIPTIONS[
                                  item.id
                                ]
                              }

                            </span>

                          </div>

                        </button>
                      ),
                    )}

                  </div>

                </div>


                {/* ===========================================
                    PHONE
                =========================================== */}

                <label>
                  Mobile Number

                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                  />

                </label>


                {/* ===========================================
                    CITY
                =========================================== */}

                <label>
                  City

                  <input
                    type="text"
                    placeholder="Pune"
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value,
                      )
                    }
                  />

                </label>


                {/* ===========================================
                    STATE
                =========================================== */}

                <label>
                  State

                  <input
                    type="text"
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value,
                      )
                    }
                  />

                </label>


                {/* ===========================================
                    LANGUAGE
                =========================================== */}

                <div>

                  <span className="field-label">
                    Preferred Language
                  </span>


                  <div
                    style={{
                      display:
                        "grid",

                      gridTemplateColumns:
                        "repeat(3, 1fr)",

                      gap:
                        "8px",

                      marginTop:
                        "8px",
                    }}
                  >

                    {LANGUAGES.map(
                      (language) => (
                        <button
                          type="button"
                          key={
                            language.id
                          }
                          className={`role-select ${
                            form.preferredLanguage ===
                            language.id
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            updateField(
                              "preferredLanguage",
                              language.id,
                            )
                          }
                        >

                          {
                            language.label
                          }

                        </button>
                      ),
                    )}

                  </div>

                </div>

              </>
            )}


            {/* ===============================================
                EMAIL
            =============================================== */}

            <label>
              Email Address *

              <input
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
              />

            </label>


            {/* ===============================================
                PASSWORD
            =============================================== */}

            <label>
              Password *

              <input
                type="password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                placeholder={
                  mode === "register"
                    ? "Minimum 6 characters"
                    : "Enter your password"
                }
                value={form.password}
                onChange={(event) =>
                  updateField(
                    "password",
                    event.target.value,
                  )
                }
              />

            </label>


            {/* ===============================================
                ERROR
            =============================================== */}

            {error && (
              <div className="error-message">

                <X size={16} />

                <span>
                  {error}
                </span>

              </div>
            )}


            {/* ===============================================
                SUCCESS
            =============================================== */}

            {success && (
              <div
                style={{
                  padding:
                    "12px 14px",

                  border:
                    "1px solid #b9dec9",

                  borderRadius:
                    "10px",

                  background:
                    "#effaf4",

                  color:
                    "#17643a",

                  fontSize:
                    "14px",
                }}
              >

                {success}

              </div>
            )}


            {/* ===============================================
                SUBMIT
            =============================================== */}

            <button
              type="submit"
              className="button button-primary button-full"
              disabled={loading}
            >

              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="spin"
                  />

                  Please wait...
                </>
              ) : (
                <>
                  <LogIn size={17} />

                  {mode === "login"
                    ? "Login"
                    : "Create Account"}
                </>
              )}

            </button>

          </form>


          {/* =================================================
              NOTE
          ================================================= */}

          <div
            style={{
              marginTop:
                "18px",

              paddingTop:
                "16px",

              borderTop:
                "1px solid #e6e8e4",

              fontSize:
                "12px",

              lineHeight:
                1.6,

              color:
                "#6d756e",
            }}
          >

            Administrator accounts are not available
            through public registration.

          </div>

        </div>

      </section>

    </div>
  );
}