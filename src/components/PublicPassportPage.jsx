import { useEffect, useState } from "react";

import {
  ArrowLeft,
  BadgeCheck,
  Factory,
  MapPin,
  Package,
  Recycle,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";

import {
  getMaterialPassport,
} from "../services/passportService.js";

/* =========================================================
   HELPERS
========================================================= */

function money(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function channelLabel(channel) {
  if (channel === "collection_partner") {
    return "Collection Partner";
  }

  if (channel === "material_aggregator") {
    return "Material Aggregator";
  }

  return channel || "Unknown";
}

/* =========================================================
   STEP ITEM
========================================================= */

function JourneyStep({
  icon,
  title,
  description,
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "46px 1fr",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: "#e8f2eb",
          color: "#1f6b45",
        }}
      >
        {icon}
      </div>

      <div>
        <strong
          style={{
            display: "block",
            marginBottom: "4px",
          }}
        >
          {title}
        </strong>

        <span
          style={{
            fontSize: "13px",
            color: "#707971",
            lineHeight: 1.6,
          }}
        >
          {description}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function PublicPassportPage({
  passportId,
}) {
  const [passport, setPassport] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadPassport() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMaterialPassport(
            passportId,
          );

        setPassport(data);
      } catch (loadError) {
        console.error(
          loadError,
        );

        setError(
          loadError.message ||
            "Unable to load Material Passport.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPassport();
  }, [passportId]);

  function goHome() {
    window.history.replaceState(
      {},
      "",
      window.location.origin,
    );

    window.location.reload();
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f4ee",
          color: "#1f6b45",
        }}
      >
        <strong>
          Loading Material Passport...
        </strong>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !passport) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f4ee",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            background: "#fffdf8",
            border: "1px solid #dedfd8",
            borderRadius: "14px",
            padding: "28px",
            textAlign: "center",
          }}
        >
          <h2>
            Material Passport unavailable
          </h2>

          <p
            style={{
              color: "#707971",
            }}
          >
            {error ||
              "The requested Material Passport could not be found."}
          </p>

          <button
            type="button"
            className="button button-primary"
            onClick={goHome}
          >
            <ArrowLeft size={16} />
            Back to SanchayKranti
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f4ee",
        color: "#26352d",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "#fffdf8",
          borderBottom: "1px solid #dedfd8",
          padding: "14px 5%",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                background: "#1f6b45",
                color: "white",
              }}
            >
              <Recycle size={21} />
            </div>

            <div>
              <strong>
                SanchayKranti
              </strong>

              <div
                style={{
                  fontSize: "11px",
                  color: "#727970",
                }}
              >
                Digital Material Passport
              </div>
            </div>
          </div>

          <button
            type="button"
            className="button button-outline"
            onClick={goHome}
          >
            <ArrowLeft size={16} />
            Home
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "34px 18px 60px",
        }}
      >
        {/* VERIFIED */}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "8px 12px",
            background: "#e8f2eb",
            color: "#1f6b45",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "13px",
            marginBottom: "14px",
          }}
        >
          <ShieldCheck size={17} />
          Verified Digital Material Passport
        </div>

        <h1
          style={{
            fontSize: "clamp(34px, 6vw, 58px)",
            margin: "0 0 8px",
          }}
        >
          {passport.material}
        </h1>

        <p
          style={{
            color: "#707971",
            marginTop: 0,
          }}
        >
          Passport ID:{" "}
          <strong>
            {passport.passportCode}
          </strong>
        </p>

        {/* SUMMARY */}

        <div
          style={{
            marginTop: "26px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#fffdf8",
              border: "1px solid #dedfd8",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <Package
              size={20}
              color="#1f6b45"
            />

            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#707971",
              }}
            >
              Processed Weight
            </div>

            <strong
              style={{
                fontSize: "22px",
              }}
            >
              {passport.processedWeight} kg
            </strong>
          </div>

          <div
            style={{
              background: "#fffdf8",
              border: "1px solid #dedfd8",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <BadgeCheck
              size={20}
              color="#1f6b45"
            />

            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#707971",
              }}
            >
              Grade
            </div>

            <strong
              style={{
                fontSize: "22px",
              }}
            >
              {passport.grade || "—"}
            </strong>
          </div>

          <div
            style={{
              background: "#fffdf8",
              border: "1px solid #dedfd8",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <Warehouse
              size={20}
              color="#816b4e"
            />

            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#707971",
              }}
            >
              Supply Channel
            </div>

            <strong>
              {channelLabel(
                passport.sourceChannel,
              )}
            </strong>
          </div>

          <div
            style={{
              background: "#fffdf8",
              border: "1px solid #dedfd8",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <Factory
              size={20}
              color="#1f6b45"
            />

            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#707971",
              }}
            >
              Recovery Value
            </div>

            <strong>
              {money(
                passport.recoveryPricePerKg,
              )}
              /kg
            </strong>
          </div>
        </div>

        {/* JOURNEY */}

        <section
          style={{
            marginTop: "34px",
            background: "#fffdf8",
            border: "1px solid #dedfd8",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <span className="eyebrow">
            TRACEABILITY JOURNEY
          </span>

          <h2>
            Material Journey
          </h2>

          <div
            style={{
              display: "grid",
              gap: "24px",
              marginTop: "22px",
            }}
          >
            <JourneyStep
              icon={
                <Package size={20} />
              }
              title="Material Source"
              description={
                passport.sourceName ||
                "Registered material source"
              }
            />

            {passport.sourceChannel ===
              "collection_partner" && (
              <JourneyStep
                icon={
                  <Truck size={20} />
                }
                title="Collection Partner"
                description={
                  passport.collectionPartnerName ||
                  "Material collected through the Collection Partner network."
                }
              />
            )}

            {passport.sourceChannel ===
              "material_aggregator" && (
              <JourneyStep
                icon={
                  <Warehouse size={20} />
                }
                title="Material Aggregator"
                description={
                  passport.aggregatorName ||
                  "Material consolidated by a registered aggregator."
                }
              />
            )}

            <JourneyStep
              icon={
                <Recycle size={20} />
              }
              title="Recovery & Verification"
              description={`${passport.recoveryFacilityName} verified, graded and processed the material.`}
            />

            <JourneyStep
              icon={
                <Factory size={20} />
              }
              title="Ready for Reuse"
              description="Recovered material is available for procurement by manufacturers and buyers in the circular marketplace."
            />
          </div>
        </section>

        {/* DETAILS */}

        <section
          style={{
            marginTop: "24px",
            background: "#fffdf8",
            border: "1px solid #dedfd8",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2>
            Passport Details
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginTop: "18px",
            }}
          >
            <div>
              <strong>
                Material
              </strong>
              <div>
                {passport.material}
              </div>
            </div>

            <div>
              <strong>
                Grade
              </strong>
              <div>
                {passport.grade || "—"}
              </div>
            </div>

            <div>
              <strong>
                Source Channel
              </strong>
              <div>
                {channelLabel(
                  passport.sourceChannel,
                )}
              </div>
            </div>

            <div>
              <strong>
                Original Quantity
              </strong>
              <div>
                {passport.originalQuantity || 0} kg
              </div>
            </div>

            <div>
              <strong>
                Processed Weight
              </strong>
              <div>
                {passport.processedWeight || 0} kg
              </div>
            </div>

            <div>
              <strong>
                Recovery Facility
              </strong>
              <div>
                {passport.recoveryFacilityName}
              </div>
            </div>

            <div>
              <strong>
                Location
              </strong>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <MapPin size={14} />

                {passport.city || "—"}
              </div>
            </div>

            <div>
              <strong>
                Status
              </strong>
              <div>
                {passport.status}
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "10px",
            background: "#e8f2eb",
            color: "#1f6b45",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <strong>
            SanchayKranti Traceability Record
          </strong>

          <br />

          This passport provides digital traceability for the
          material lot recorded in the SanchayKranti network.
        </div>
      </main>
    </div>
  );
}