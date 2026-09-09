import { useEffect, useMemo, useState } from "react";

import QRCode from "react-qr-code";

import {
  CheckCircle2,
  Factory,
  LogOut,
  PackageCheck,
  QrCode,
  Recycle,
  Truck,
  Warehouse,
} from "lucide-react";

import {
  listenToCollectedMaterial,
  listenToAggregatorDispatches,
  listenToRecoveryCollectionMaterial,
  listenToRecoveryAggregatorMaterial,
  receiveCollectedMaterial,
  receiveAggregatorMaterial,
  verifyCollectedMaterial,
  verifyAggregatorMaterial,
  processCollectedMaterial,
  processAggregatorMaterial,
} from "../services/recoveryService.js";

import {
  createMaterialPassport,
  listenToRecoveryPassports,
} from "../services/passportService.js";

import {
  logoutUser,
} from "../services/authService.js";

/* =========================================================
   HELPERS
========================================================= */

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        background: "#fffdf8",
        border: "1px solid #dedfd8",
        borderRadius: "14px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "11px",
          display: "grid",
          placeItems: "center",
          background: "#e8f2eb",
          color: "#1f6b45",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#737b74",
            marginBottom: "3px",
          }}
        >
          {label}
        </div>

        <strong
          style={{
            fontSize: "20px",
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function RecoveryFacilityDashboard({
  user,
}) {
  const [page, setPage] =
    useState("dashboard");

  const [
    incomingCollected,
    setIncomingCollected,
  ] = useState([]);

  const [
    incomingAggregator,
    setIncomingAggregator,
  ] = useState([]);

  const [
    recoveryCollection,
    setRecoveryCollection,
  ] = useState([]);

  const [
    recoveryAggregator,
    setRecoveryAggregator,
  ] = useState([]);

  const [
    passports,
    setPassports,
  ] = useState([]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    verificationInputs,
    setVerificationInputs,
  ] = useState({});

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  /* =======================================================
     LISTENERS
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    const unsubscribeIncomingCollection =
      listenToCollectedMaterial(
        (items) => {
          const filtered =
            items.filter(
              (item) =>
                !item.recoveryFacilityId ||
                item.recoveryStatus ===
                  "awaiting_dispatch" ||
                item.recoveryStatus ===
                  "not_started",
            );

          setIncomingCollected(
            filtered,
          );

          setLoading(false);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load collected material.",
          );

          setLoading(false);
        },
      );

    const unsubscribeIncomingAggregator =
      listenToAggregatorDispatches(
        (items) => {
          const filtered =
            items.filter(
              (item) =>
                !item.recoveryFacilityId ||
                item.recoveryFacilityId ===
                  user?.uid,
            );

          setIncomingAggregator(
            filtered,
          );
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load aggregator dispatches.",
          );
        },
      );

    const unsubscribeRecoveryCollection =
      listenToRecoveryCollectionMaterial(
        user?.uid,

        (items) => {
          setRecoveryCollection(
            items,
          );
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load recovery inventory.",
          );
        },
      );

    const unsubscribeRecoveryAggregator =
      listenToRecoveryAggregatorMaterial(
        user?.uid,

        (items) => {
          setRecoveryAggregator(
            items,
          );
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load aggregator material.",
          );
        },
      );

    const unsubscribePassports =
      listenToRecoveryPassports(
        user?.uid,

        (items) => {
          setPassports(items);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load Material Passports.",
          );
        },
      );

    return () => {
      unsubscribeIncomingCollection();
      unsubscribeIncomingAggregator();
      unsubscribeRecoveryCollection();
      unsubscribeRecoveryAggregator();
      unsubscribePassports();
    };
  }, [user?.uid]);

  /* =======================================================
     ALL MATERIAL
  ======================================================= */

  const allRecoveryMaterial = [
    ...recoveryCollection,
    ...recoveryAggregator,
  ];

  const verificationItems =
    allRecoveryMaterial.filter(
      (item) =>
        item.recoveryStatus ===
          "received" ||
        item.status ===
          "received_at_recovery",
    );

  const processingItems =
    allRecoveryMaterial.filter(
      (item) =>
        item.recoveryStatus ===
          "verified" ||
        item.status ===
          "verified_at_recovery",
    );

  const processedItems =
    allRecoveryMaterial.filter(
      (item) =>
        item.recoveryStatus ===
          "processed" ||
        item.status ===
          "processed",
    );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const received =
      allRecoveryMaterial.filter(
        (item) =>
          item.recoveryStatus ===
            "received" ||
          item.status ===
            "received_at_recovery",
      ).length;

    const verified =
      allRecoveryMaterial.filter(
        (item) =>
          item.recoveryStatus ===
            "verified" ||
          item.status ===
            "verified_at_recovery",
      ).length;

    const processed =
      processedItems.length;

    const processedWeight =
      processedItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.verifiedWeight ||
              item.actualCollectedWeight ||
              item.dispatchedWeight ||
              item.weight ||
              0,
          ),
        0,
      );

    return {
      incoming:
        incomingCollected.length +
        incomingAggregator.length,

      received,
      verified,
      processed,
      processedWeight,
      passports:
        passports.length,
    };
  }, [
    incomingCollected,
    incomingAggregator,
    allRecoveryMaterial,
    processedItems,
    passports,
  ]);

  /* =======================================================
     PASSPORT HELPERS
  ======================================================= */

  function passportExists(
    item,
  ) {
    return passports.some(
      (passport) =>
        passport.sourceDocumentId ===
        item.id,
    );
  }

  function getPassportForItem(
    item,
  ) {
    return passports.find(
      (passport) =>
        passport.sourceDocumentId ===
        item.id,
    );
  }

  function getPassportUrl(
    passportId,
  ) {
    return `${window.location.origin}/?passport=${passportId}`;
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (logoutError) {
      console.error(
        logoutError,
      );

      setError(
        "Unable to logout.",
      );
    }
  }

  /* =======================================================
     RECEIVE COLLECTION MATERIAL
  ======================================================= */

  async function handleReceiveCollection(
    item,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `receive-c-${item.id}`,
      );

      await receiveCollectedMaterial({
        requestId:
          item.id,

        recoveryUser:
          user,
      });

      setSuccess(
        "Collection-partner material received.",
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to receive material.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     RECEIVE AGGREGATOR MATERIAL
  ======================================================= */

  async function handleReceiveAggregator(
    item,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `receive-a-${item.id}`,
      );

      await receiveAggregatorMaterial({
        inventoryId:
          item.id,

        recoveryUser:
          user,
      });

      setSuccess(
        "Aggregator material received.",
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to receive material.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     VERIFICATION INPUT
  ======================================================= */

  function setVerificationField(
    itemId,
    field,
    value,
  ) {
    setVerificationInputs(
      (previous) => ({
        ...previous,

        [itemId]: {
          ...(previous[itemId] || {}),

          [field]:
            value,
        },
      }),
    );
  }

  /* =======================================================
     VERIFY
  ======================================================= */

  async function handleVerify(
    item,
  ) {
    const values =
      verificationInputs[
        item.id
      ] || {};

    const verifiedWeight =
      Number(
        values.verifiedWeight,
      );

    const grade =
      values.grade || "A";

    const recoveryPricePerKg =
      Number(
        values.recoveryPricePerKg,
      );

    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `verify-${item.id}`,
      );

      if (
        item.sourceChannel ===
        "collection_partner"
      ) {
        await verifyCollectedMaterial({
          requestId:
            item.id,

          verifiedWeight,

          grade,

          recoveryPricePerKg,
        });
      } else {
        await verifyAggregatorMaterial({
          inventoryId:
            item.id,

          verifiedWeight,

          grade,

          recoveryPricePerKg,
        });
      }

      setSuccess(
        "Material verified successfully.",
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to verify material.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     PROCESS
  ======================================================= */

  async function handleProcess(
    item,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `process-${item.id}`,
      );

      if (
        item.sourceChannel ===
        "collection_partner"
      ) {
        await processCollectedMaterial(
          item.id,
        );
      } else {
        await processAggregatorMaterial(
          item.id,
        );
      }

      setSuccess(
        "Material marked as processed.",
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to process material.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     GENERATE PASSPORT
  ======================================================= */

  async function handleGeneratePassport(
    item,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `passport-${item.id}`,
      );

      if (
        passportExists(item)
      ) {
        setSuccess(
          "Material Passport already exists for this lot.",
        );

        return;
      }

      await createMaterialPassport({
        recoveryUser: user,
        materialItem: item,
      });

      setSuccess(
        "Material Passport generated successfully.",
      );
    } catch (passportError) {
      console.error(
        passportError,
      );

      setError(
        passportError.message ||
          "Unable to generate Material Passport.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "incoming",
      label: "Incoming",
    },
    {
      id: "verification",
      label: "Verification",
    },
    {
      id: "processing",
      label: "Processing",
    },
    {
      id: "inventory",
      label: "Processed Inventory",
    },
    {
      id: "passports",
      label: "Passports",
    },
  ];

  /* =======================================================
     MATERIAL CARD
  ======================================================= */

  function MaterialCard({
    item,
    mode,
  }) {
    const collectionChannel =
      item.sourceChannel ===
      "collection_partner";

    const sourceName =
      collectionChannel
        ? item.sourceName ||
          item.collectionPartnerName ||
          "Collection Partner"
        : item.aggregatorName ||
          "Material Aggregator";

    const weight =
      item.actualCollectedWeight ||
      item.dispatchedWeight ||
      item.weight ||
      item.quantity ||
      0;

    const passport =
      getPassportForItem(
        item,
      );

    return (
      <div
        style={{
          background: "#fffdf8",
          border: "1px solid #dedfd8",
          borderRadius: "14px",
          padding: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: collectionChannel
                  ? "#1f6b45"
                  : "#816b4e",
                marginBottom: "5px",
              }}
            >
              {collectionChannel
                ? "COLLECTION PARTNER CHANNEL"
                : "MATERIAL AGGREGATOR CHANNEL"}
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              {item.material ||
                "Material"}
            </h3>

            <div
              style={{
                color: "#707971",
                fontSize: "13px",
                lineHeight: 1.7,
              }}
            >
              Source:{" "}
              <strong>
                {sourceName}
              </strong>

              <br />

              Weight:{" "}
              <strong>
                {weight} kg
              </strong>

              {item.grade && (
                <>
                  <br />
                  Grade:{" "}
                  <strong>
                    {item.grade}
                  </strong>
                </>
              )}

              {item.verifiedWeight && (
                <>
                  <br />
                  Verified:{" "}
                  <strong>
                    {
                      item.verifiedWeight
                    }{" "}
                    kg
                  </strong>
                </>
              )}
            </div>
          </div>

          {collectionChannel ? (
            <Truck
              size={28}
              color="#1f6b45"
            />
          ) : (
            <Warehouse
              size={28}
              color="#816b4e"
            />
          )}
        </div>

        {mode === "incoming" && (
          <button
            type="button"
            className="button button-primary button-full"
            style={{
              marginTop: "14px",
            }}
            disabled={
              actionLoading ===
              `${
                collectionChannel
                  ? "receive-c"
                  : "receive-a"
              }-${item.id}`
            }
            onClick={() =>
              collectionChannel
                ? handleReceiveCollection(
                    item,
                  )
                : handleReceiveAggregator(
                    item,
                  )
            }
          >
            <PackageCheck
              size={16}
            />

            Receive Material
          </button>
        )}

        {mode ===
          "verification" && (
          <div
            style={{
              display: "grid",
              gap: "10px",
              marginTop: "14px",
            }}
          >
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Verified weight kg"
              value={
                verificationInputs[
                  item.id
                ]?.verifiedWeight ||
                ""
              }
              onChange={(event) =>
                setVerificationField(
                  item.id,
                  "verifiedWeight",
                  event.target.value,
                )
              }
            />

            <select
              value={
                verificationInputs[
                  item.id
                ]?.grade || "A"
              }
              onChange={(event) =>
                setVerificationField(
                  item.id,
                  "grade",
                  event.target.value,
                )
              }
            >
              <option value="A">
                Grade A
              </option>

              <option value="B">
                Grade B
              </option>

              <option value="C">
                Grade C
              </option>
            </select>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Recovery price ₹/kg"
              value={
                verificationInputs[
                  item.id
                ]
                  ?.recoveryPricePerKg ||
                ""
              }
              onChange={(event) =>
                setVerificationField(
                  item.id,
                  "recoveryPricePerKg",
                  event.target.value,
                )
              }
            />

            <button
              type="button"
              className="button button-primary"
              disabled={
                actionLoading ===
                `verify-${item.id}`
              }
              onClick={() =>
                handleVerify(
                  item,
                )
              }
            >
              <CheckCircle2
                size={16}
              />

              Verify Material
            </button>
          </div>
        )}

        {mode ===
          "processing" && (
          <button
            type="button"
            className="button button-primary button-full"
            style={{
              marginTop: "14px",
            }}
            disabled={
              actionLoading ===
              `process-${item.id}`
            }
            onClick={() =>
              handleProcess(
                item,
              )
            }
          >
            <Recycle size={16} />

            Mark Processed
          </button>
        )}

        {mode === "processed" && (
          <div
            style={{
              marginTop: "14px",
              display: "grid",
              gap: "10px",
            }}
          >
            <div
              style={{
                padding: "12px",
                borderRadius: "9px",
                background: "#e8f2eb",
                color: "#1f6b45",
                fontWeight: 700,
              }}
            >
              Ready for Buyer Marketplace
            </div>

            {!passport && (
              <button
                type="button"
                className="button button-primary"
                disabled={
                  actionLoading ===
                  `passport-${item.id}`
                }
                onClick={() =>
                  handleGeneratePassport(
                    item,
                  )
                }
              >
                <QrCode size={16} />

                {actionLoading ===
                `passport-${item.id}`
                  ? "Generating..."
                  : "Generate Material Passport"}
              </button>
            )}

            {passport && (
              <div
                style={{
                  padding: "12px",
                  background: "#f4f5ef",
                  borderRadius: "9px",
                }}
              >
                <strong>
                  Passport:
                </strong>{" "}
                {passport.passportCode}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f4ee",
        color: "#26352d",
      }}
    >
      <header
        style={{
          background: "#fffdf8",
          borderBottom:
            "1px solid #dedfd8",
          padding: "14px 5%",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "14px",
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
                Material Recovery Facility
              </div>
            </div>
          </div>

          <button
            type="button"
            className="button button-outline"
            onClick={
              handleLogout
            }
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div
        style={{
          background: "#fffdf8",
          borderBottom:
            "1px solid #e6e4de",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 18px",
            display: "flex",
            gap: "4px",
            overflowX: "auto",
          }}
        >
          {navigation.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setPage(
                    item.id,
                  )
                }
                style={{
                  border: 0,
                  borderBottom:
                    page === item.id
                      ? "3px solid #1f6b45"
                      : "3px solid transparent",
                  background:
                    "transparent",
                  padding:
                    "14px 16px",
                  cursor:
                    "pointer",
                  color:
                    page === item.id
                      ? "#1f6b45"
                      : "#616a63",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      </div>

      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "28px 18px",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#fff1f1",
              border:
                "1px solid #e9c0c0",
              color: "#8a2929",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#eff9f2",
              border:
                "1px solid #b9dec9",
              color: "#17643a",
            }}
          >
            {success}
          </div>
        )}

        {page === "dashboard" && (
          <>
            <span className="eyebrow">
              RECOVERY OPERATIONS
            </span>

            <h1>
              Recovery Facility Dashboard
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <StatCard
                icon={
                  <Truck size={20} />
                }
                label="Incoming"
                value={stats.incoming}
              />

              <StatCard
                icon={
                  <PackageCheck
                    size={20}
                  />
                }
                label="Received"
                value={stats.received}
              />

              <StatCard
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
                label="Verified"
                value={stats.verified}
              />

              <StatCard
                icon={
                  <Recycle
                    size={20}
                  />
                }
                label="Processed"
                value={stats.processed}
              />

              <StatCard
                icon={
                  <Factory
                    size={20}
                  />
                }
                label="Processed Weight"
                value={`${stats.processedWeight} kg`}
              />

              <StatCard
                icon={
                  <QrCode
                    size={20}
                  />
                }
                label="Material Passports"
                value={stats.passports}
              />
            </div>
          </>
        )}

        {page === "incoming" && (
          <>
            <h1>
              Incoming Material
            </h1>

            {loading ? (
              <p>
                Loading incoming material...
              </p>
            ) : (
              <>
                <h2>
                  From Collection Partners
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {incomingCollected.length ? (
                    incomingCollected.map(
                      (item) => (
                        <MaterialCard
                          key={item.id}
                          item={item}
                          mode="incoming"
                        />
                      ),
                    )
                  ) : (
                    <p>
                      No collection-partner material waiting.
                    </p>
                  )}
                </div>

                <h2
                  style={{
                    marginTop: "30px",
                  }}
                >
                  From Material Aggregators
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                  }}
                >
                  {incomingAggregator.length ? (
                    incomingAggregator.map(
                      (item) => (
                        <MaterialCard
                          key={item.id}
                          item={item}
                          mode="incoming"
                        />
                      ),
                    )
                  ) : (
                    <p>
                      No aggregator dispatch waiting.
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {page ===
          "verification" && (
          <>
            <h1>
              Verify Material
            </h1>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {verificationItems.length ? (
                verificationItems.map(
                  (item) => (
                    <MaterialCard
                      key={item.id}
                      item={item}
                      mode="verification"
                    />
                  ),
                )
              ) : (
                <p>
                  No material waiting for verification.
                </p>
              )}
            </div>
          </>
        )}

        {page === "processing" && (
          <>
            <h1>
              Processing Queue
            </h1>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {processingItems.length ? (
                processingItems.map(
                  (item) => (
                    <MaterialCard
                      key={item.id}
                      item={item}
                      mode="processing"
                    />
                  ),
                )
              ) : (
                <p>
                  No verified material waiting for processing.
                </p>
              )}
            </div>
          </>
        )}

        {page === "inventory" && (
          <>
            <h1>
              Processed Inventory
            </h1>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {processedItems.length ? (
                processedItems.map(
                  (item) => (
                    <MaterialCard
                      key={item.id}
                      item={item}
                      mode="processed"
                    />
                  ),
                )
              ) : (
                <p>
                  No processed inventory yet.
                </p>
              )}
            </div>
          </>
        )}

        {page === "passports" && (
          <>
            <span className="eyebrow">
              TRACEABILITY
            </span>

            <h1>
              Material Passports
            </h1>

            {passports.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {passports.map(
                  (passport) => {
                    const qrUrl =
                      getPassportUrl(
                        passport.id,
                      );

                    return (
                      <div
                        key={
                          passport.id
                        }
                        style={{
                          background:
                            "#fffdf8",
                          border:
                            "1px solid #dedfd8",
                          borderRadius:
                            "14px",
                          padding:
                            "20px",
                        }}
                      >
                        <div
                          style={{
                            width: "170px",
                            height: "170px",
                            background:
                              "white",
                            padding:
                              "10px",
                            marginBottom:
                              "16px",
                          }}
                        >
                          <QRCode
                            value={
                              qrUrl
                            }
                            size={150}
                          />
                        </div>

                        <div
                          style={{
                            color:
                              "#1f6b45",
                            fontWeight:
                              700,
                            fontSize:
                              "12px",
                          }}
                        >
                          MATERIAL PASSPORT
                        </div>

                        <h2>
                          {
                            passport.material
                          }
                        </h2>

                        <p>
                          Passport ID:{" "}
                          <strong>
                            {
                              passport.passportCode
                            }
                          </strong>
                        </p>

                        <p>
                          Grade:{" "}
                          <strong>
                            {passport.grade ||
                              "—"}
                          </strong>
                        </p>

                        <p>
                          Weight:{" "}
                          <strong>
                            {
                              passport.processedWeight
                            }{" "}
                            kg
                          </strong>
                        </p>

                        <p>
                          Source Channel:{" "}
                          <strong>
                            {
                              passport.sourceChannel
                            }
                          </strong>
                        </p>

                        <p>
                          Recovery Facility:{" "}
                          <strong>
                            {
                              passport.recoveryFacilityName
                            }
                          </strong>
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <p>
                No Material Passports generated yet.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}