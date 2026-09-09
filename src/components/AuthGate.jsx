import { useEffect, useState } from "react";

import {
  Building2,
  Factory,
  Leaf,
  Loader2,
  LogOut,
  Recycle,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

import AuthPage from "./AuthPage.jsx";
import CollectionPartnerDashboard from "./CollectionPartnerDashboard.jsx";
import WasteGeneratorDashboard from "./WasteGeneratorDashboard.jsx";
import MaterialAggregatorDashboard from "./MaterialAggregatorDashboard.jsx";
import RecoveryFacilityDashboard from "./RecoveryFacilityDashboard.jsx";
import BuyerDashboard from "./BuyerDashboard.jsx";
import PublicPassportPage from "./PublicPassportPage.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

import {
  observeAuthState,
  logoutUser,
  ROLE_LABELS,
} from "../services/authService.js";

/* =========================================================
   ROLE ICON
========================================================= */

function RoleIcon({
  role,
  size = 28,
}) {
  if (
    role ===
    "waste_generator"
  ) {
    return (
      <Building2
        size={size}
      />
    );
  }

  if (
    role ===
    "collection_partner"
  ) {
    return (
      <Truck
        size={size}
      />
    );
  }

  if (
    role ===
    "material_aggregator"
  ) {
    return (
      <Warehouse
        size={size}
      />
    );
  }

  if (
    role ===
    "recovery_facility"
  ) {
    return (
      <Recycle
        size={size}
      />
    );
  }

  if (role === "buyer") {
    return (
      <Factory
        size={size}
      />
    );
  }

  if (role === "admin") {
    return (
      <ShieldCheck
        size={size}
      />
    );
  }

  return (
    <Leaf
      size={size}
    />
  );
}

/* =========================================================
   FALLBACK DASHBOARD
========================================================= */

function TemporaryDashboard({
  user,
  onLogout,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f4ee",
      }}
    >
      <header
        style={{
          minHeight: "72px",
          padding: "0 5%",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          background: "#fffdf8",
          borderBottom:
            "1px solid #dedfd8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Leaf
            size={24}
            color="#1f6b45"
          />

          <strong>
            SanchayKranti
          </strong>
        </div>

        <button
          type="button"
          className="button button-outline"
          onClick={onLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      <main
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          padding: "70px 24px",
        }}
      >
        <div
          style={{
            background: "#fffdf8",
            border: "1px solid #dedfd8",
            borderRadius: "14px",
            padding: "32px",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              display: "grid",
              placeItems: "center",
              borderRadius: "12px",
              background: "#e8f2eb",
              color: "#1f6b45",
              marginBottom: "20px",
            }}
          >
            <RoleIcon
              role={user.role}
            />
          </div>

          <span className="eyebrow">
            ACCOUNT CONNECTED
          </span>

          <h1>
            Welcome, {user.fullName}
          </h1>

          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              background: "#f4f5ef",
              borderRadius: "10px",
            }}
          >
            <strong>
              Role:
            </strong>{" "}
            {ROLE_LABELS[user.role] ||
              user.role}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   AUTH GATE
========================================================= */

export default function AuthGate() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    showAuth,
    setShowAuth,
  ] = useState(false);

  const [
    authMode,
    setAuthMode,
  ] = useState("login");

  const [
    collectorProfile,
    setCollectorProfile,
  ] = useState(null);

  const [
    collectorLoading,
    setCollectorLoading,
  ] = useState(false);

  /* =======================================================
     PUBLIC MATERIAL PASSPORT URL
  ======================================================= */

  const params =
    new URLSearchParams(
      window.location.search,
    );

  const passportId =
    params.get("passport");

  /* =======================================================
     AUTH LISTENER
  ======================================================= */

  useEffect(() => {
    if (passportId) {
      setLoading(false);
      return;
    }

    const unsubscribe =
      observeAuthState(
        (profile) => {
          setUser(profile);
          setLoading(false);
        },
      );

    return unsubscribe;
  }, [passportId]);

  /* =======================================================
     COLLECTOR PROFILE LISTENER
  ======================================================= */

  useEffect(() => {
    setCollectorProfile(null);

    if (
      passportId ||
      !user ||
      user.role !==
        "collection_partner"
    ) {
      setCollectorLoading(false);
      return;
    }

    setCollectorLoading(true);

    const collectorRef =
      doc(
        db,
        "collectorProfiles",
        user.uid,
      );

    const unsubscribe =
      onSnapshot(
        collectorRef,

        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            setCollectorProfile({
              id:
                snapshot.id,

              ...snapshot.data(),
            });
          } else {
            setCollectorProfile(
              null,
            );
          }

          setCollectorLoading(
            false,
          );
        },

        (error) => {
          console.error(
            "Collector profile error:",
            error,
          );

          setCollectorProfile(
            null,
          );

          setCollectorLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, [
    user,
    passportId,
  ]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await logoutUser();

      setUser(null);
      setCollectorProfile(null);
      setShowAuth(false);
    } catch (error) {
      console.error(
        "Logout error:",
        error,
      );
    }
  }

  /* =======================================================
     PUBLIC PASSPORT
  ======================================================= */

  if (passportId) {
    return (
      <PublicPassportPage
        passportId={
          passportId
        }
      />
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
          background: "#f6f4ee",
          color: "#1f6b45",
        }}
      >
        <Loader2
          size={32}
          className="spin"
        />

        <strong>
          Loading SanchayKranti...
        </strong>
      </div>
    );
  }

  /* =======================================================
     AUTH PAGE
  ======================================================= */

  if (
    !user &&
    showAuth
  ) {
    return (
      <AuthPage
        key={authMode}
        initialMode={
          authMode
        }
        onBack={() =>
          setShowAuth(false)
        }
      />
    );
  }

  /* =======================================================
     PUBLIC LANDING
  ======================================================= */

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f4ee",
          color: "#26352d",
        }}
      >
        <nav
          style={{
            minHeight: "74px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            padding: "0 6%",
            borderBottom:
              "1px solid #dedfd8",
            background: "#fffdf8",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                display: "grid",
                placeItems: "center",
                borderRadius: "10px",
                background: "#1f6b45",
                color: "white",
              }}
            >
              <Leaf size={23} />
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "18px",
                }}
              >
                SanchayKranti
              </strong>

              <span
                style={{
                  fontSize: "12px",
                  color: "#747c76",
                }}
              >
                Circular Economy Network
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setAuthMode(
                  "login",
                );

                setShowAuth(
                  true,
                );
              }}
            >
              Login
            </button>

            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                setAuthMode(
                  "register",
                );

                setShowAuth(
                  true,
                );
              }}
            >
              Register
            </button>
          </div>
        </nav>

        <main
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "100px 24px 60px",
          }}
        >
          <span className="eyebrow">
            DIGITAL CIRCULAR ECONOMY
          </span>

          <h1
            style={{
              maxWidth: "760px",
              fontSize:
                "clamp(42px, 7vw, 74px)",
              lineHeight: 1,
              margin: "18px 0 24px",
              letterSpacing:
                "-0.04em",
            }}
          >
            Waste becomes a valuable resource.
          </h1>

          <p
            style={{
              maxWidth: "650px",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "#677069",
            }}
          >
            Connect waste generators,
            collection partners,
            material aggregators,
            recovery facilities,
            manufacturers and
            administrators through one
            traceable circular material network.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "30px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="button button-primary button-large"
              onClick={() => {
                setAuthMode(
                  "register",
                );

                setShowAuth(
                  true,
                );
              }}
            >
              Join Network
            </button>

            <button
              type="button"
              className="button button-outline button-large"
              onClick={() => {
                setAuthMode(
                  "login",
                );

                setShowAuth(
                  true,
                );
              }}
            >
              Partner Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     ADMIN
  ======================================================= */

  if (
    user.role ===
    "admin"
  ) {
    return (
      <AdminDashboard
        user={user}
      />
    );
  }

  /* =======================================================
     WASTE GENERATOR
  ======================================================= */

  if (
    user.role ===
    "waste_generator"
  ) {
    return (
      <WasteGeneratorDashboard
        user={user}
      />
    );
  }

  /* =======================================================
     COLLECTION PARTNER
  ======================================================= */

  if (
    user.role ===
    "collection_partner"
  ) {
    if (
      collectorLoading
    ) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
            background: "#f6f4ee",
            color: "#1f6b45",
          }}
        >
          <Loader2
            size={30}
            className="spin"
          />

          <strong>
            Loading collector profile...
          </strong>
        </div>
      );
    }

    return (
      <CollectionPartnerDashboard
        user={user}
        collectorProfile={
          collectorProfile
        }
      />
    );
  }

  /* =======================================================
     MATERIAL AGGREGATOR
  ======================================================= */

  if (
    user.role ===
    "material_aggregator"
  ) {
    return (
      <MaterialAggregatorDashboard
        user={user}
      />
    );
  }

  /* =======================================================
     RECOVERY FACILITY
  ======================================================= */

  if (
    user.role ===
    "recovery_facility"
  ) {
    return (
      <RecoveryFacilityDashboard
        user={user}
      />
    );
  }

  /* =======================================================
     BUYER
  ======================================================= */

  if (
    user.role ===
    "buyer"
  ) {
    return (
      <BuyerDashboard
        user={user}
      />
    );
  }

  /* =======================================================
     FALLBACK
  ======================================================= */

  return (
    <TemporaryDashboard
      user={user}
      onLogout={
        handleLogout
      }
    />
  );
}