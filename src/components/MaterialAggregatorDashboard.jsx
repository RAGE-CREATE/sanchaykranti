import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  Building2,
  IndianRupee,
  LogOut,
  PackagePlus,
  Send,
  UserRound,
  Warehouse,
} from "lucide-react";

import {
  addAggregatorInventory,
  dispatchAggregatorMaterial,
  listenToAggregatorInventory,
  listenToRecoveryFacilities,
} from "../services/aggregatorService.js";

import {
  logoutUser,
} from "../services/authService.js";

/* =========================================================
   MATERIALS
========================================================= */

const MATERIALS = [
  "Plastic",
  "Paper",
  "Metal",
  "Glass",
  "E-Waste",
  "Textile",
];

/* =========================================================
   HELPERS
========================================================= */

function money(value = 0) {
  return `₹${Number(
    value || 0,
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        background: "#fffdf8",
        border:
          "1px solid #dedfd8",
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
          background: "#efe9df",
          color: "#816b4e",
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

export default function MaterialAggregatorDashboard({
  user,
}) {
  const [page, setPage] =
    useState("dashboard");

  const [
    inventory,
    setInventory,
  ] = useState([]);

  const [
    recoveryFacilities,
    setRecoveryFacilities,
  ] = useState([]);

  const [
    selectedFacilities,
    setSelectedFacilities,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [
    facilitiesLoading,
    setFacilitiesLoading,
  ] = useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    dispatchLoading,
    setDispatchLoading,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState({
      sellerName: "",
      sellerPhone: "",
      material: "Plastic",
      weight: "",
      unit: "kg",
      purchasePricePerKg: "",
      city:
        user?.city || "",
      notes: "",
    });

  /* =======================================================
     INVENTORY LISTENER
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    const unsubscribe =
      listenToAggregatorInventory(
        user?.uid,

        (items) => {
          setInventory(items);
          setLoading(false);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load aggregator stock.",
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, [user?.uid]);

  /* =======================================================
     REAL RECOVERY FACILITY LISTENER
  ======================================================= */

  useEffect(() => {
    setFacilitiesLoading(true);

    const unsubscribe =
      listenToRecoveryFacilities(
        (facilities) => {
          setRecoveryFacilities(
            facilities,
          );

          setFacilitiesLoading(
            false,
          );
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load Recovery Facilities.",
          );

          setFacilitiesLoading(
            false,
          );
        },
      );

    return unsubscribe;
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const inStock =
        inventory.filter(
          (item) =>
            item.status ===
            "in_stock",
        );

      const totalWeight =
        inStock.reduce(
          (sum, item) =>
            sum +
            Number(
              item.availableWeight ||
                0,
            ),
          0,
        );

      const purchaseValue =
        inventory.reduce(
          (sum, item) =>
            sum +
            Number(
              item.totalPurchaseValue ||
                0,
            ),
          0,
        );

      const dispatched =
        inventory.filter(
          (item) =>
            item.status ===
              "dispatched_to_recovery" ||
            item.status ===
              "received_at_recovery" ||
            item.status ===
              "verified_at_recovery" ||
            item.status ===
              "processed",
        ).length;

      return {
        totalItems:
          inventory.length,

        totalWeight,

        purchaseValue,

        dispatched,
      };
    }, [inventory]);

  /* =======================================================
     FORM
  ======================================================= */

  function updateField(
    field,
    value,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );
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
     ADD STOCK
  ======================================================= */

  async function handleAddStock(
    event,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await addAggregatorInventory({
        user,

        sellerName:
          form.sellerName,

        sellerPhone:
          form.sellerPhone,

        material:
          form.material,

        weight:
          form.weight,

        unit:
          form.unit,

        purchasePricePerKg:
          form.purchasePricePerKg,

        city:
          form.city,

        notes:
          form.notes,
      });

      setSuccess(
        "Material added to stock successfully.",
      );

      setForm({
        sellerName: "",
        sellerPhone: "",
        material: "Plastic",
        weight: "",
        unit: "kg",
        purchasePricePerKg:
          "",
        city:
          user?.city || "",
        notes: "",
      });

      setPage("stock");
    } catch (submitError) {
      console.error(
        submitError,
      );

      setError(
        submitError.message ||
          "Unable to add material.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     SELECT RECOVERY FACILITY
  ======================================================= */

  function handleFacilitySelection(
    inventoryId,
    facilityId,
  ) {
    setSelectedFacilities(
      (previous) => ({
        ...previous,
        [inventoryId]:
          facilityId,
      }),
    );
  }

  /* =======================================================
     DISPATCH
  ======================================================= */

  async function handleDispatch(
    item,
  ) {
    const facilityId =
      selectedFacilities[
        item.id
      ];

    if (!facilityId) {
      setError(
        "Please select a Recovery Facility.",
      );

      return;
    }

    const facility =
      recoveryFacilities.find(
        (recovery) =>
          recovery.id ===
          facilityId,
      );

    if (!facility) {
      setError(
        "Selected Recovery Facility could not be found.",
      );

      return;
    }

    const availableWeight =
      Number(
        item.availableWeight ||
          item.weight ||
          0,
      );

    if (
      !availableWeight ||
      availableWeight <= 0
    ) {
      setError(
        "No material is available for dispatch.",
      );

      return;
    }

    try {
      setError("");
      setSuccess("");

      setDispatchLoading(
        item.id,
      );

      await dispatchAggregatorMaterial({
        inventoryId:
          item.id,

        recoveryFacilityId:
          facility.id,

        recoveryFacilityName:
          facility.organizationName ||
          facility.fullName ||
          "Recovery Facility",

        dispatchWeight:
          availableWeight,
      });

      setSuccess(
        `Material dispatched to ${
          facility.organizationName ||
          facility.fullName
        }.`,
      );

      setSelectedFacilities(
        (previous) => ({
          ...previous,
          [item.id]: "",
        }),
      );
    } catch (dispatchError) {
      console.error(
        dispatchError,
      );

      setError(
        dispatchError.message ||
          "Unable to dispatch material.",
      );
    } finally {
      setDispatchLoading("");
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
      id: "buy",
      label:
        "Buy / Receive Scrap",
    },
    {
      id: "stock",
      label: "Stock",
    },
    {
      id: "dispatch",
      label: "Dispatch",
    },
    {
      id: "profile",
      label: "Profile",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f6f4ee",
        color:
          "#26352d",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background:
            "#fffdf8",
          borderBottom:
            "1px solid #dedfd8",
          padding:
            "14px 5%",
          position:
            "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth:
              "1100px",
            margin:
              "0 auto",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap:
              "14px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "10px",
            }}
          >
            <div
              style={{
                width:
                  "40px",
                height:
                  "40px",
                borderRadius:
                  "10px",
                display:
                  "grid",
                placeItems:
                  "center",
                background:
                  "#816b4e",
                color:
                  "white",
              }}
            >
              <Warehouse
                size={21}
              />
            </div>

            <div>
              <strong
                style={{
                  display:
                    "block",
                }}
              >
                SanchayKranti
              </strong>

              <span
                style={{
                  fontSize:
                    "11px",
                  color:
                    "#727970",
                }}
              >
                Material Aggregator
              </span>
            </div>
          </div>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "10px",
            }}
          >
            <span
              style={{
                fontSize:
                  "13px",
                color:
                  "#69716a",
              }}
            >
              {user?.organizationName ||
                user?.fullName}
            </span>

            <button
              type="button"
              className="button button-outline"
              onClick={
                handleLogout
              }
            >
              <LogOut
                size={16}
              />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* NAV */}

      <div
        style={{
          background:
            "#fffdf8",
          borderBottom:
            "1px solid #e6e4de",
        }}
      >
        <div
          style={{
            maxWidth:
              "1100px",
            margin:
              "0 auto",
            padding:
              "0 18px",
            display:
              "flex",
            gap:
              "4px",
            overflowX:
              "auto",
          }}
        >
          {navigation.map(
            (item) => (
              <button
                key={
                  item.id
                }
                type="button"
                onClick={() =>
                  setPage(
                    item.id,
                  )
                }
                style={{
                  border: 0,

                  borderBottom:
                    page ===
                    item.id
                      ? "3px solid #816b4e"
                      : "3px solid transparent",

                  background:
                    "transparent",

                  padding:
                    "14px 16px",

                  cursor:
                    "pointer",

                  color:
                    page ===
                    item.id
                      ? "#816b4e"
                      : "#616a63",

                  fontWeight:
                    700,

                  whiteSpace:
                    "nowrap",
                }}
              >
                {
                  item.label
                }
              </button>
            ),
          )}
        </div>
      </div>

      <main
        style={{
          maxWidth:
            "1100px",
          margin:
            "0 auto",
          padding:
            "28px 18px",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "12px 14px",
              borderRadius:
                "10px",
              background:
                "#fff1f1",
              border:
                "1px solid #e9c0c0",
              color:
                "#8a2929",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "12px 14px",
              borderRadius:
                "10px",
              background:
                "#eff9f2",
              border:
                "1px solid #b9dec9",
              color:
                "#17643a",
            }}
          >
            {success}
          </div>
        )}

        {/* DASHBOARD */}

        {page ===
          "dashboard" && (
          <>
            <span className="eyebrow">
              AGGREGATION CHANNEL
            </span>

            <h1>
              Material Aggregator Dashboard
            </h1>

            <p
              style={{
                color:
                  "#707971",
              }}
            >
              Buy material from
              local sellers,
              consolidate stock and
              dispatch it directly to
              registered Recovery
              Facilities.
            </p>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap:
                  "12px",
                marginTop:
                  "24px",
              }}
            >
              <StatCard
                icon={
                  <Boxes
                    size={20}
                  />
                }
                label="Stock Entries"
                value={
                  stats.totalItems
                }
              />

              <StatCard
                icon={
                  <Warehouse
                    size={20}
                  />
                }
                label="Available Stock"
                value={`${stats.totalWeight} kg`}
              />

              <StatCard
                icon={
                  <IndianRupee
                    size={20}
                  />
                }
                label="Purchase Value"
                value={money(
                  stats.purchaseValue,
                )}
              />

              <StatCard
                icon={
                  <Send
                    size={20}
                  />
                }
                label="Dispatched"
                value={
                  stats.dispatched
                }
              />
            </div>

            <div
              style={{
                marginTop:
                  "28px",
                background:
                  "#fffdf8",
                border:
                  "1px solid #dedfd8",
                borderRadius:
                  "14px",
                padding:
                  "22px",
              }}
            >
              <h2>
                Add purchased scrap
              </h2>

              <button
                type="button"
                className="button button-primary"
                onClick={() =>
                  setPage(
                    "buy",
                  )
                }
              >
                <PackagePlus
                  size={16}
                />
                Add Scrap Purchase
              </button>
            </div>
          </>
        )}

        {/* BUY */}

        {page ===
          "buy" && (
          <>
            <span className="eyebrow">
              MATERIAL PROCUREMENT
            </span>

            <h1>
              Buy / Receive Scrap
            </h1>

            <form
              onSubmit={
                handleAddStock
              }
              style={{
                background:
                  "#fffdf8",
                border:
                  "1px solid #dedfd8",
                borderRadius:
                  "14px",
                padding:
                  "22px",
                display:
                  "grid",
                gap:
                  "17px",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap:
                    "16px",
                }}
              >
                <label>
                  <span className="field-label">
                    Seller Name *
                  </span>

                  <input
                    value={
                      form.sellerName
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "sellerName",
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span className="field-label">
                    Seller Phone
                  </span>

                  <input
                    value={
                      form.sellerPhone
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "sellerPhone",
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span className="field-label">
                    Material
                  </span>

                  <select
                    value={
                      form.material
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "material",
                        event
                          .target
                          .value,
                      )
                    }
                  >
                    {MATERIALS.map(
                      (
                        material,
                      ) => (
                        <option
                          key={
                            material
                          }
                        >
                          {
                            material
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span className="field-label">
                    Weight *
                  </span>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={
                      form.weight
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "weight",
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span className="field-label">
                    Unit
                  </span>

                  <select
                    value={
                      form.unit
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "unit",
                        event
                          .target
                          .value,
                      )
                    }
                  >
                    <option>
                      kg
                    </option>

                    <option>
                      ton
                    </option>
                  </select>
                </label>

                <label>
                  <span className="field-label">
                    Purchase Price / kg *
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.purchasePricePerKg
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "purchasePricePerKg",
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>

                <label>
                  <span className="field-label">
                    City
                  </span>

                  <input
                    value={
                      form.city
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "city",
                        event
                          .target
                          .value,
                      )
                    }
                  />
                </label>
              </div>

              <label>
                <span className="field-label">
                  Notes
                </span>

                <textarea
                  rows="4"
                  value={
                    form.notes
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "notes",
                      event
                        .target
                        .value,
                    )
                  }
                />
              </label>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                }}
              >
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={
                    saving
                  }
                >
                  <PackagePlus
                    size={16}
                  />

                  {saving
                    ? "Saving..."
                    : "Add to Stock"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* STOCK */}

        {page ===
          "stock" && (
          <>
            <span className="eyebrow">
              AGGREGATED INVENTORY
            </span>

            <h1>
              Material Stock
            </h1>

            {loading ? (
              <p>
                Loading stock...
              </p>
            ) : inventory.length ? (
              <div
                style={{
                  display:
                    "grid",
                  gap:
                    "12px",
                }}
              >
                {inventory.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        background:
                          "#fffdf8",
                        border:
                          "1px solid #dedfd8",
                        borderRadius:
                          "14px",
                        padding:
                          "18px",
                      }}
                    >
                      <strong
                        style={{
                          color:
                            "#816b4e",
                        }}
                      >
                        {
                          item.material
                        }
                      </strong>

                      <h3>
                        {
                          item.weight
                        }{" "}
                        {item.unit ||
                          "kg"}
                      </h3>

                      <p>
                        Seller:{" "}
                        {
                          item.sellerName
                        }
                      </p>

                      <p>
                        Purchase Rate:{" "}
                        {money(
                          item.purchasePricePerKg,
                        )}
                        /kg
                      </p>

                      <p>
                        Status:{" "}
                        <strong>
                          {
                            item.status
                          }
                        </strong>
                      </p>

                      {item.recoveryFacilityName && (
                        <p>
                          Recovery Facility:{" "}
                          <strong>
                            {
                              item.recoveryFacilityName
                            }
                          </strong>
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No material stock yet.
              </p>
            )}
          </>
        )}

        {/* DISPATCH */}

        {page ===
          "dispatch" && (
          <>
            <span className="eyebrow">
              MATERIAL MOVEMENT
            </span>

            <h1>
              Dispatch to Recovery Facility
            </h1>

            <p
              style={{
                color:
                  "#707971",
              }}
            >
              Select a registered
              Recovery Facility for each
              material lot.
            </p>

            {facilitiesLoading && (
              <p>
                Loading Recovery
                Facilities...
              </p>
            )}

            {!facilitiesLoading &&
              recoveryFacilities.length ===
                0 && (
                <div
                  style={{
                    padding:
                      "16px",
                    background:
                      "#fff3df",
                    border:
                      "1px solid #e4ca9b",
                    borderRadius:
                      "10px",
                  }}
                >
                  No registered Recovery
                  Facility was found.
                </div>
              )}

            <div
              style={{
                display:
                  "grid",
                gap:
                  "12px",
                marginTop:
                  "18px",
              }}
            >
              {inventory
                .filter(
                  (item) =>
                    item.status ===
                    "in_stock",
                )
                .map((item) => (
                  <div
                    key={
                      item.id
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
                    <h3
                      style={{
                        marginTop:
                          0,
                      }}
                    >
                      {
                        item.material
                      }
                    </h3>

                    <p>
                      Available:{" "}
                      <strong>
                        {item.availableWeight ||
                          item.weight}{" "}
                        kg
                      </strong>
                    </p>

                    <label>
                      <span className="field-label">
                        Recovery Facility
                      </span>

                      <select
                        value={
                          selectedFacilities[
                            item.id
                          ] || ""
                        }
                        onChange={(
                          event,
                        ) =>
                          handleFacilitySelection(
                            item.id,
                            event
                              .target
                              .value,
                          )
                        }
                      >
                        <option value="">
                          Select Recovery
                          Facility
                        </option>

                        {recoveryFacilities.map(
                          (
                            facility,
                          ) => (
                            <option
                              key={
                                facility.id
                              }
                              value={
                                facility.id
                              }
                            >
                              {facility.organizationName ||
                                facility.fullName}
                              {facility.city
                                ? ` — ${facility.city}`
                                : ""}
                            </option>
                          ),
                        )}
                      </select>
                    </label>

                    <div
                      style={{
                        marginTop:
                          "16px",
                        padding:
                          "12px",
                        background:
                          "#f4f5ef",
                        borderRadius:
                          "9px",
                        fontSize:
                          "13px",
                      }}
                    >
                      Full lot will be
                      dispatched:{" "}
                      <strong>
                        {item.availableWeight ||
                          item.weight}{" "}
                        kg
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="button button-primary button-full"
                      style={{
                        marginTop:
                          "12px",
                      }}
                      disabled={
                        dispatchLoading ===
                          item.id ||
                        !selectedFacilities[
                          item.id
                        ]
                      }
                      onClick={() =>
                        handleDispatch(
                          item,
                        )
                      }
                    >
                      <Send
                        size={16}
                      />

                      {dispatchLoading ===
                      item.id
                        ? "Dispatching..."
                        : "Dispatch to Facility"}
                    </button>
                  </div>
                ))}

              {inventory.filter(
                (item) =>
                  item.status ===
                  "in_stock",
              ).length ===
                0 && (
                <p>
                  No material currently
                  available for dispatch.
                </p>
              )}
            </div>
          </>
        )}

        {/* PROFILE */}

        {page ===
          "profile" && (
          <>
            <span className="eyebrow">
              PARTNER PROFILE
            </span>

            <h1>
              Material Aggregator Profile
            </h1>

            <div
              style={{
                background:
                  "#fffdf8",
                border:
                  "1px solid #dedfd8",
                borderRadius:
                  "14px",
                padding:
                  "22px",
                maxWidth:
                  "520px",
                display:
                  "grid",
                gap:
                  "13px",
              }}
            >
              <UserRound
                size={30}
                color="#816b4e"
              />

              <strong>
                {user?.fullName}
              </strong>

              <div>
                {
                  user?.organizationName
                }
              </div>

              <div>
                {user?.email}
              </div>

              <div>
                {user?.phone ||
                  "No phone"}
              </div>

              <div>
                {user?.city ||
                  "No city"}
              </div>

              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "6px",
                }}
              >
                <Building2
                  size={16}
                />

                {
                  recoveryFacilities.length
                }{" "}
                Recovery Facility
                {recoveryFacilities.length ===
                1
                  ? ""
                  : "ies"}{" "}
                available
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}