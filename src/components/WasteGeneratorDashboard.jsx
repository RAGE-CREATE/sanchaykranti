import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LogOut,
  MapPin,
  Package,
  Plus,
  Recycle,
  Send,
  Truck,
} from "lucide-react";

import {
  createPickupRequest,
  getGeneratorLocation,
  listenToMyPickupRequests,
} from "../services/wasteGeneratorService.js";

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

function todayISO() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function statusText(status) {
  if (status === "pending") {
    return "Waiting for collector";
  }

  if (status === "accepted") {
    return "Collector assigned";
  }

  if (status === "collector_reached") {
    return "Collector reached";
  }

  if (status === "collected") {
    return "Collected";
  }

  return status || "Unknown";
}

function StatusBadge({ status }) {
  const completed =
    status === "collected";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 9px",
        borderRadius: "999px",
        background: completed
          ? "#e8f2eb"
          : "#f4efe3",
        color: completed
          ? "#1f6b45"
          : "#816b4e",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {completed ? (
        <CheckCircle2 size={14} />
      ) : (
        <Truck size={14} />
      )}

      {statusText(status)}
    </span>
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
   DASHBOARD
========================================================= */

export default function WasteGeneratorDashboard({
  user,
}) {
  const [page, setPage] =
    useState("dashboard");

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState({
      material: "Plastic",
      quantity: "",
      unit: "kg",
      address: "",
      city: user?.city || "",
      pickupDate: todayISO(),
      notes: "",
    });

  /* =======================================================
     REAL-TIME REQUESTS
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    const unsubscribe =
      listenToMyPickupRequests(
        user?.uid,

        (data) => {
          setRequests(data);
          setLoading(false);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load your pickup requests.",
          );

          setLoading(false);
        },
      );

    return unsubscribe;
  }, [user?.uid]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const pending =
      requests.filter(
        (request) =>
          request.status === "pending",
      ).length;

    const active =
      requests.filter(
        (request) =>
          request.status === "accepted" ||
          request.status ===
            "collector_reached",
      ).length;

    const collected =
      requests.filter(
        (request) =>
          request.status ===
          "collected",
      ).length;

    const totalWeight =
      requests
        .filter(
          (request) =>
            request.status ===
            "collected",
        )
        .reduce(
          (sum, request) =>
            sum +
            Number(
              request.actualCollectedWeight ||
                0,
            ),
          0,
        );

    return {
      pending,
      active,
      collected,
      totalWeight,
    };
  }, [requests]);

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  function updateField(
    field,
    value,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (logoutError) {
      console.error(
        "Logout error:",
        logoutError,
      );

      setError(
        "Unable to logout.",
      );
    }
  }

  /* =======================================================
     CREATE REQUEST
  ======================================================= */

  async function handleSubmit(
    event,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      let location = null;

      try {
        location =
          await getGeneratorLocation();
      } catch (locationError) {
        console.warn(
          "Generator location unavailable:",
          locationError,
        );
      }

      const result =
        await createPickupRequest({
          user,

          material:
            form.material,

          quantity:
            form.quantity,

          unit:
            form.unit,

          address:
            form.address,

          city:
            form.city,

          pickupDate:
            form.pickupDate,

          notes:
            form.notes,

          latitude:
            location?.latitude ??
            null,

          longitude:
            location?.longitude ??
            null,
        });

      if (result.success) {
        setSuccess(
          "Pickup request created successfully.",
        );

        setForm({
          material: "Plastic",
          quantity: "",
          unit: "kg",
          address: "",
          city:
            user?.city || "",
          pickupDate:
            todayISO(),
          notes: "",
        });

        setPage(
          "my-requests",
        );
      }
    } catch (submitError) {
      console.error(
        submitError,
      );

      setError(
        submitError.message ||
          "Unable to create pickup request.",
      );
    } finally {
      setSaving(false);
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
      id: "new-request",
      label: "Request Pickup",
    },
    {
      id: "my-requests",
      label: "My Requests",
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
              <Building2
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
                Waste Generator
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#69716a",
              }}
            >
              {user?.organizationName ||
                user?.fullName}
            </div>

            <button
              type="button"
              className="button button-outline"
              onClick={handleLogout}
            >
              <LogOut size={16} />
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
                type="button"
                key={item.id}
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

        {page === "dashboard" && (
          <>
            <div
              style={{
                marginBottom:
                  "24px",
              }}
            >
              <span
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#69736b",
                }}
              >
                Welcome back
              </span>

              <h1
                style={{
                  margin:
                    "5px 0 7px",
                  fontSize:
                    "30px",
                }}
              >
                {user?.organizationName ||
                  user?.fullName}
              </h1>

              <p
                style={{
                  margin: 0,
                  color:
                    "#717970",
                }}
              >
                Manage your waste pickup
                requests and track the
                material journey.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              <StatCard
                icon={
                  <ClipboardList
                    size={20}
                  />
                }
                label="Waiting for Collector"
                value={
                  stats.pending
                }
              />

              <StatCard
                icon={
                  <Truck
                    size={20}
                  />
                }
                label="Active Pickups"
                value={
                  stats.active
                }
              />

              <StatCard
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
                label="Completed"
                value={
                  stats.collected
                }
              />

              <StatCard
                icon={
                  <Recycle
                    size={20}
                  />
                }
                label="Waste Collected"
                value={`${stats.totalWeight} kg`}
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
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "16px",
                  flexWrap:
                    "wrap",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin:
                        "0 0 6px",
                    }}
                  >
                    Have waste ready for pickup?
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color:
                        "#707971",
                    }}
                  >
                    Create a request and nearby
                    collection partners will see it
                    instantly.
                  </p>
                </div>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() =>
                    setPage(
                      "new-request",
                    )
                  }
                >
                  <Plus
                    size={16}
                  />

                  Request Pickup
                </button>
              </div>
            </div>
          </>
        )}

        {/* NEW REQUEST */}

        {page ===
          "new-request" && (
          <>
            <div
              style={{
                marginBottom:
                  "22px",
              }}
            >
              <span className="eyebrow">
                NEW PICKUP
              </span>

              <h1
                style={{
                  margin:
                    "7px 0",
                }}
              >
                Request Waste Pickup
              </h1>

              <p
                style={{
                  color:
                    "#707971",
                }}
              >
                Add material details and
                pickup location.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
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
                  "18px",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <label>
                  <span className="field-label">
                    Material *
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
                    Quantity *
                  </span>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="100"
                    value={
                      form.quantity
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "quantity",
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
                    Pickup Date
                  </span>

                  <input
                    type="date"
                    value={
                      form.pickupDate
                    }
                    onChange={(
                      event,
                    ) =>
                      updateField(
                        "pickupDate",
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
                  Pickup Address *
                </span>

                <input
                  type="text"
                  placeholder="Full pickup address"
                  value={
                    form.address
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "address",
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
                  type="text"
                  placeholder="Pune"
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

              <label>
                <span className="field-label">
                  Notes
                </span>

                <textarea
                  rows="4"
                  placeholder="Example: Clean PET plastic bottles..."
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
                  display: "flex",
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
                  <Send
                    size={16}
                  />

                  {saving
                    ? "Creating..."
                    : "Create Pickup Request"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* MY REQUESTS */}

        {page ===
          "my-requests" && (
          <>
            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >
              <span className="eyebrow">
                REQUEST TRACKING
              </span>

              <h1
                style={{
                  margin:
                    "7px 0",
                }}
              >
                My Pickup Requests
              </h1>
            </div>

            {loading ? (
              <p>
                Loading requests...
              </p>
            ) : requests.length ? (
              <div
                style={{
                  display:
                    "grid",
                  gap:
                    "12px",
                }}
              >
                {requests.map(
                  (
                    request,
                  ) => (
                    <div
                      key={
                        request.id
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
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "16px",
                          alignItems:
                            "flex-start",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color:
                                "#1f6b45",
                              fontSize:
                                "13px",
                              fontWeight:
                                700,
                            }}
                          >
                            {
                              request.material
                            }
                          </div>

                          <h3
                            style={{
                              margin:
                                "5px 0",
                            }}
                          >
                            {request.quantity}{" "}
                            {request.unit ||
                              "kg"}
                          </h3>

                          <div
                            style={{
                              color:
                                "#707971",
                              fontSize:
                                "13px",
                              lineHeight:
                                1.7,
                            }}
                          >
                            <MapPin
                              size={
                                13
                              }
                              style={{
                                verticalAlign:
                                  "middle",
                              }}
                            />{" "}
                            {
                              request.address
                            }

                            <br />

                            <CalendarDays
                              size={
                                13
                              }
                              style={{
                                verticalAlign:
                                  "middle",
                              }}
                            />{" "}
                            {request.pickupDate ||
                              "No date"}

                            {request.collectionPartnerName && (
                              <>
                                <br />

                                Collector:{" "}
                                <strong>
                                  {
                                    request.collectionPartnerName
                                  }
                                </strong>
                              </>
                            )}

                            {request.actualCollectedWeight && (
                              <>
                                <br />

                                Collected:{" "}
                                <strong>
                                  {
                                    request.actualCollectedWeight
                                  }{" "}
                                  kg
                                </strong>
                              </>
                            )}
                          </div>
                        </div>

                        <StatusBadge
                          status={
                            request.status
                          }
                        />
                      </div>
                    </div>
                  ),
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
                    "36px",
                  textAlign:
                    "center",
                }}
              >
                <Package
                  size={35}
                  color="#1f6b45"
                />

                <h3>
                  No requests yet
                </h3>

                <p
                  style={{
                    color:
                      "#707971",
                  }}
                >
                  Create your first pickup
                  request.
                </p>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={() =>
                    setPage(
                      "new-request",
                    )
                  }
                >
                  <Plus
                    size={16}
                  />

                  Request Pickup
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}