import { useEffect, useMemo, useState } from "react";

import {
  Factory,
  IndianRupee,
  LogOut,
  Package,
  Plus,
  ShoppingCart,
  Truck,
} from "lucide-react";

import {
  createBuyerDemand,
  listenToBuyerDemands,
  listenToBuyerOrders,
  listenToProcessedAggregatorMaterial,
  listenToProcessedCollectionMaterial,
  placeMaterialOrder,
} from "../services/buyerService.js";

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
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getAvailableWeight(item) {
  if (
    item.marketplaceAvailableWeight !== undefined &&
    item.marketplaceAvailableWeight !== null
  ) {
    return Number(item.marketplaceAvailableWeight);
  }

  return Number(
    item.verifiedWeight ||
      item.actualCollectedWeight ||
      item.dispatchedWeight ||
      item.weight ||
      0,
  );
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

export default function BuyerDashboard({
  user,
}) {
  const [page, setPage] =
    useState("dashboard");

  const [
    collectionMaterial,
    setCollectionMaterial,
  ] = useState([]);

  const [
    aggregatorMaterial,
    setAggregatorMaterial,
  ] = useState([]);

  const [
    demands,
    setDemands,
  ] = useState([]);

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    orderQuantities,
    setOrderQuantities,
  ] = useState({});

  const [saving, setSaving] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState({
      material: "Plastic",
      quantity: "",
      unit: "kg",
      grade: "A",
      maxPricePerKg: "",
      city:
        user?.city || "",
      notes: "",
    });

  /* =======================================================
     LISTENERS
  ======================================================= */

  useEffect(() => {
    const unsubCollection =
      listenToProcessedCollectionMaterial(
        (items) => {
          setCollectionMaterial(
            items,
          );
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load processed collection material.",
          );
        },
      );

    const unsubAggregator =
      listenToProcessedAggregatorMaterial(
        (items) => {
          setAggregatorMaterial(
            items,
          );
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load processed aggregator material.",
          );
        },
      );

    const unsubDemands =
      listenToBuyerDemands(
        user?.uid,

        (items) => {
          setDemands(items);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load buyer demands.",
          );
        },
      );

    const unsubOrders =
      listenToBuyerOrders(
        user?.uid,

        (items) => {
          setOrders(items);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load buyer orders.",
          );
        },
      );

    return () => {
      unsubCollection();
      unsubAggregator();
      unsubDemands();
      unsubOrders();
    };
  }, [user?.uid]);

  /* =======================================================
     MARKETPLACE
  ======================================================= */

  const marketplaceItems =
    useMemo(() => {
      return [
        ...collectionMaterial,
        ...aggregatorMaterial,
      ].filter(
        (item) =>
          getAvailableWeight(item) >
          0,
      );
    }, [
      collectionMaterial,
      aggregatorMaterial,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      const totalAvailableWeight =
        marketplaceItems.reduce(
          (sum, item) =>
            sum +
            getAvailableWeight(
              item,
            ),
          0,
        );

      const totalOrderValue =
        orders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.totalValue ||
                0,
            ),
          0,
        );

      return {
        marketplaceLots:
          marketplaceItems.length,

        availableWeight:
          totalAvailableWeight,

        demands:
          demands.length,

        orders:
          orders.length,

        orderValue:
          totalOrderValue,
      };
    }, [
      marketplaceItems,
      demands,
      orders,
    ]);

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
     CREATE DEMAND
  ======================================================= */

  async function handleCreateDemand(
    event,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createBuyerDemand({
        user,

        material:
          form.material,

        quantity:
          form.quantity,

        unit:
          form.unit,

        grade:
          form.grade,

        maxPricePerKg:
          form.maxPricePerKg,

        city:
          form.city,

        notes:
          form.notes,
      });

      setSuccess(
        "Buyer demand created successfully.",
      );

      setForm({
        material: "Plastic",
        quantity: "",
        unit: "kg",
        grade: "A",
        maxPricePerKg: "",
        city:
          user?.city || "",
        notes: "",
      });

      setPage("demands");
    } catch (submitError) {
      console.error(
        submitError,
      );

      setError(
        submitError.message ||
          "Unable to create buyer demand.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     PLACE ORDER
  ======================================================= */

  async function handleOrder(
    item,
  ) {
    const quantity =
      Number(
        orderQuantities[
          item.id
        ],
      );

    try {
      setError("");
      setSuccess("");

      setActionLoading(
        item.id,
      );

      await placeMaterialOrder({
        user,
        materialItem: item,
        orderQuantity:
          quantity,
      });

      setSuccess(
        "Material order placed successfully.",
      );

      setOrderQuantities(
        (previous) => ({
          ...previous,
          [item.id]: "",
        }),
      );

      setPage("orders");
    } catch (orderError) {
      console.error(
        orderError,
      );

      setError(
        orderError.message ||
          "Unable to place order.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     NAV
  ======================================================= */

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
    },
    {
      id: "marketplace",
      label: "Marketplace",
    },
    {
      id: "new-demand",
      label: "Create Demand",
    },
    {
      id: "demands",
      label: "My Demands",
    },
    {
      id: "orders",
      label: "My Orders",
    },
  ];

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
      {/* HEADER */}

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
            justifyContent:
              "space-between",
            alignItems: "center",
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
              <Factory
                size={21}
              />
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
                Buyer / Manufacturer
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#69716a",
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
                    page ===
                    item.id
                      ? "3px solid #1f6b45"
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
                      ? "#1f6b45"
                      : "#616a63",

                  fontWeight:
                    700,

                  whiteSpace:
                    "nowrap",
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

        {/* DASHBOARD */}

        {page === "dashboard" && (
          <>
            <span className="eyebrow">
              RECOVERED MATERIAL BUYER
            </span>

            <h1>
              Buyer / Manufacturer Dashboard
            </h1>

            <p
              style={{
                color: "#707971",
              }}
            >
              Procure verified recovered
              materials from the
              SanchayKranti circular
              marketplace.
            </p>

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
                  <Package
                    size={20}
                  />
                }
                label="Available Lots"
                value={
                  stats.marketplaceLots
                }
              />

              <StatCard
                icon={
                  <Truck
                    size={20}
                  />
                }
                label="Available Material"
                value={`${stats.availableWeight} kg`}
              />

              <StatCard
                icon={
                  <Plus
                    size={20}
                  />
                }
                label="My Demands"
                value={
                  stats.demands
                }
              />

              <StatCard
                icon={
                  <ShoppingCart
                    size={20}
                  />
                }
                label="Orders"
                value={
                  stats.orders
                }
              />

              <StatCard
                icon={
                  <IndianRupee
                    size={20}
                  />
                }
                label="Order Value"
                value={money(
                  stats.orderValue,
                )}
              />
            </div>
          </>
        )}

        {/* MARKETPLACE */}

        {page === "marketplace" && (
          <>
            <span className="eyebrow">
              CIRCULAR MATERIAL MARKETPLACE
            </span>

            <h1>
              Available Recovered Material
            </h1>

            {marketplaceItems.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(270px, 1fr))",
                  gap: "14px",
                }}
              >
                {marketplaceItems.map(
                  (item) => {
                    const availableWeight =
                      getAvailableWeight(
                        item,
                      );

                    const soldOut =
                      availableWeight <=
                      0;

                    return (
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
                            "19px",
                        }}
                      >
                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#1f6b45",
                            fontWeight:
                              700,
                          }}
                        >
                          RECOVERED MATERIAL
                        </div>

                        <h2
                          style={{
                            margin:
                              "6px 0",
                          }}
                        >
                          {item.material}
                        </h2>

                        <p>
                          Available:{" "}
                          <strong>
                            {availableWeight}{" "}
                            kg
                          </strong>
                        </p>

                        <p>
                          Grade:{" "}
                          <strong>
                            {item.grade ||
                              "Not specified"}
                          </strong>
                        </p>

                        <p>
                          Price:{" "}
                          <strong>
                            {money(
                              item.recoveryPricePerKg,
                            )}
                            /kg
                          </strong>
                        </p>

                        <p>
                          Recovery Facility:{" "}
                          <strong>
                            {item.recoveryFacilityName ||
                              "Recovery Facility"}
                          </strong>
                        </p>

                        <p>
                          Status:{" "}
                          <strong
                            style={{
                              color:
                                soldOut
                                  ? "#9a3333"
                                  : "#1f6b45",
                            }}
                          >
                            {soldOut
                              ? "Sold Out"
                              : "Available"}
                          </strong>
                        </p>

                        {!soldOut && (
                          <>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              max={
                                availableWeight
                              }
                              placeholder="Order quantity kg"
                              value={
                                orderQuantities[
                                  item.id
                                ] || ""
                              }
                              onChange={(
                                event,
                              ) =>
                                setOrderQuantities(
                                  (
                                    previous,
                                  ) => ({
                                    ...previous,

                                    [item.id]:
                                      event
                                        .target
                                        .value,
                                  }),
                                )
                              }
                            />

                            <button
                              type="button"
                              className="button button-primary button-full"
                              style={{
                                marginTop:
                                  "10px",
                              }}
                              disabled={
                                actionLoading ===
                                item.id
                              }
                              onClick={() =>
                                handleOrder(
                                  item,
                                )
                              }
                            >
                              <ShoppingCart
                                size={16}
                              />

                              {actionLoading ===
                              item.id
                                ? "Placing..."
                                : "Place Order"}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div
                style={{
                  background:
                    "#fffdf8",
                  border:
                    "1px solid #dedfd8",
                  borderRadius:
                    "14px",
                  padding:
                    "30px",
                  textAlign:
                    "center",
                }}
              >
                <Package
                  size={34}
                  color="#1f6b45"
                />

                <h3>
                  No material currently available
                </h3>

                <p
                  style={{
                    color:
                      "#707971",
                  }}
                >
                  Processed recovered material
                  will appear here when stock
                  becomes available.
                </p>
              </div>
            )}
          </>
        )}

        {/* CREATE DEMAND */}

        {page === "new-demand" && (
          <>
            <span className="eyebrow">
              PROCUREMENT REQUIREMENT
            </span>

            <h1>
              Create Material Demand
            </h1>

            <form
              onSubmit={
                handleCreateDemand
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
                        event.target
                          .value,
                      )
                    }
                  >
                    {MATERIALS.map(
                      (material) => (
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
                    Quantity *
                  </span>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={
                      form.quantity
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "quantity",
                        event.target
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
                        event.target
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
                    Grade
                  </span>

                  <select
                    value={
                      form.grade
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "grade",
                        event.target
                          .value,
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
                </label>

                <label>
                  <span className="field-label">
                    Maximum Price ₹/kg
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.maxPricePerKg
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "maxPricePerKg",
                        event.target
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
                        event.target
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
                      event.target
                        .value,
                    )
                  }
                />
              </label>

              <button
                type="submit"
                className="button button-primary"
                disabled={
                  saving
                }
              >
                <Plus
                  size={16}
                />

                {saving
                  ? "Creating..."
                  : "Create Demand"}
              </button>
            </form>
          </>
        )}

        {/* DEMANDS */}

        {page === "demands" && (
          <>
            <span className="eyebrow">
              PROCUREMENT DEMANDS
            </span>

            <h1>
              My Material Demands
            </h1>

            {demands.length ? (
              <div
                style={{
                  display:
                    "grid",
                  gap:
                    "12px",
                }}
              >
                {demands.map(
                  (demand) => (
                    <div
                      key={
                        demand.id
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
                      <h3>
                        {
                          demand.material
                        }
                      </h3>

                      <p>
                        Required:{" "}
                        <strong>
                          {
                            demand.quantity
                          }{" "}
                          {demand.unit ||
                            "kg"}
                        </strong>
                      </p>

                      <p>
                        Grade:{" "}
                        {demand.grade ||
                          "Any"}
                      </p>

                      <p>
                        Max Price:{" "}
                        {money(
                          demand.maxPricePerKg,
                        )}
                        /kg
                      </p>

                      <p>
                        Status:{" "}
                        <strong>
                          {
                            demand.status
                          }
                        </strong>
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                You have not created any material demands.
              </p>
            )}
          </>
        )}

        {/* ORDERS */}

        {page === "orders" && (
          <>
            <span className="eyebrow">
              PROCUREMENT ORDERS
            </span>

            <h1>
              My Orders
            </h1>

            {orders.length ? (
              <div
                style={{
                  display:
                    "grid",
                  gap:
                    "12px",
                }}
              >
                {orders.map(
                  (order) => (
                    <div
                      key={
                        order.id
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
                      <h3>
                        {
                          order.material
                        }
                      </h3>

                      <p>
                        Quantity:{" "}
                        <strong>
                          {
                            order.quantity
                          }{" "}
                          {order.unit ||
                            "kg"}
                        </strong>
                      </p>

                      <p>
                        Grade:{" "}
                        {order.grade ||
                          "—"}
                      </p>

                      <p>
                        Price:{" "}
                        {money(
                          order.pricePerKg,
                        )}
                        /kg
                      </p>

                      <p>
                        Total:{" "}
                        <strong>
                          {money(
                            order.totalValue,
                          )}
                        </strong>
                      </p>

                      {order.availableBeforeOrder !==
                        undefined && (
                        <p>
                          Stock:{" "}
                          {
                            order.availableBeforeOrder
                          }{" "}
                          kg →{" "}
                          <strong>
                            {
                              order.availableAfterOrder
                            }{" "}
                            kg
                          </strong>
                        </p>
                      )}

                      <p>
                        Recovery Facility:{" "}
                        {order.recoveryFacilityName ||
                          "—"}
                      </p>

                      <p>
                        Status:{" "}
                        <strong>
                          {
                            order.status
                          }
                        </strong>
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No orders placed yet.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}