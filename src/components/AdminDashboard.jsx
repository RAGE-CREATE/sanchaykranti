import { useEffect, useMemo, useState } from "react";

import {
  BadgeCheck,
  Boxes,
  ClipboardList,
  Factory,
  FileCheck2,
  LogOut,
  PackageSearch,
  Recycle,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCheck,
  UserRound,
  Users,
  Warehouse,
  XCircle,
} from "lucide-react";

import {
  activateUser,
  deactivateUser,
  listenToAllAggregatorInventory,
  listenToAllMaterialRequests,
  listenToAllOrders,
  listenToAllPassports,
  listenToAllUsers,
  rejectUser,
  verifyUser,
} from "../services/adminService.js";

import {
  logoutUser,
} from "../services/authService.js";

/* =========================================================
   HELPERS
========================================================= */

function roleLabel(role) {
  const labels = {
    admin: "Administrator",
    waste_generator: "Waste Generator",
    collection_partner: "Collection Partner",
    material_aggregator: "Material Aggregator",
    recovery_facility: "Recovery Facility",
    buyer: "Buyer / Manufacturer",
  };

  return labels[role] || role || "Unknown";
}

function money(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
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

export default function AdminDashboard({
  user,
}) {
  const [page, setPage] =
    useState("dashboard");

  const [users, setUsers] =
    useState([]);

  const [
    materialRequests,
    setMaterialRequests,
  ] = useState([]);

  const [
    aggregatorInventory,
    setAggregatorInventory,
  ] = useState([]);

  const [orders, setOrders] =
    useState([]);

  const [passports, setPassports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  /* =======================================================
     LISTENERS
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    const unsubUsers =
      listenToAllUsers(
        (items) => {
          setUsers(items);
          setLoading(false);
        },
        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load users.",
          );

          setLoading(false);
        },
      );

    const unsubRequests =
      listenToAllMaterialRequests(
        (items) => {
          setMaterialRequests(
            items,
          );
        },
        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load material requests.",
          );
        },
      );

    const unsubInventory =
      listenToAllAggregatorInventory(
        (items) => {
          setAggregatorInventory(
            items,
          );
        },
        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load aggregator inventory.",
          );
        },
      );

    const unsubOrders =
      listenToAllOrders(
        (items) => {
          setOrders(items);
        },
        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load orders.",
          );
        },
      );

    const unsubPassports =
      listenToAllPassports(
        (items) => {
          setPassports(items);
        },
        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load passports.",
          );
        },
      );

    return () => {
      unsubUsers();
      unsubRequests();
      unsubInventory();
      unsubOrders();
      unsubPassports();
    };
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const nonAdminUsers =
      users.filter(
        (item) =>
          item.role !== "admin",
      );

    const pendingUsers =
      nonAdminUsers.filter(
        (item) =>
          item.verificationStatus ===
          "pending",
      );

    const verifiedUsers =
      nonAdminUsers.filter(
        (item) =>
          item.verificationStatus ===
          "verified",
      );

    const generators =
      users.filter(
        (item) =>
          item.role ===
          "waste_generator",
      ).length;

    const collectors =
      users.filter(
        (item) =>
          item.role ===
          "collection_partner",
      ).length;

    const aggregators =
      users.filter(
        (item) =>
          item.role ===
          "material_aggregator",
      ).length;

    const recovery =
      users.filter(
        (item) =>
          item.role ===
          "recovery_facility",
      ).length;

    const buyers =
      users.filter(
        (item) =>
          item.role === "buyer",
      ).length;

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
      totalUsers:
        nonAdminUsers.length,

      pendingUsers:
        pendingUsers.length,

      verifiedUsers:
        verifiedUsers.length,

      generators,
      collectors,
      aggregators,
      recovery,
      buyers,

      requests:
        materialRequests.length,

      inventory:
        aggregatorInventory.length,

      orders:
        orders.length,

      passports:
        passports.length,

      totalOrderValue,
    };
  }, [
    users,
    materialRequests,
    aggregatorInventory,
    orders,
    passports,
  ]);

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
     VERIFY
  ======================================================= */

  async function handleVerify(
    userId,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `verify-${userId}`,
      );

      await verifyUser(
        userId,
      );

      setSuccess(
        "User verified successfully.",
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to verify user.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     REJECT
  ======================================================= */

  async function handleReject(
    userId,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `reject-${userId}`,
      );

      await rejectUser(
        userId,
      );

      setSuccess(
        "User rejected.",
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to reject user.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     ACTIVATE / DEACTIVATE
  ======================================================= */

  async function handleToggleActive(
    account,
  ) {
    try {
      setError("");
      setSuccess("");

      setActionLoading(
        `active-${account.id}`,
      );

      if (
        account.isActive === false
      ) {
        await activateUser(
          account.id,
        );

        setSuccess(
          "User activated.",
        );
      } else {
        await deactivateUser(
          account.id,
        );

        setSuccess(
          "User deactivated.",
        );
      }
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to update user.",
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
      id: "users",
      label: "Users",
    },
    {
      id: "requests",
      label: "Material Requests",
    },
    {
      id: "inventory",
      label: "Aggregator Inventory",
    },
    {
      id: "orders",
      label: "Orders",
    },
    {
      id: "passports",
      label: "Passports",
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
            maxWidth: "1200px",
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
                background: "#26352d",
                color: "white",
              }}
            >
              <ShieldCheck
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
                Administration
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
              {user?.fullName ||
                "Administrator"}
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
            maxWidth: "1200px",
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
                      ? "3px solid #26352d"
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
                      ? "#26352d"
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
          maxWidth: "1200px",
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
            <span className="eyebrow">
              SYSTEM OVERVIEW
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p
              style={{
                color: "#707971",
              }}
            >
              Monitor participants,
              material movement,
              marketplace activity and
              traceability across the
              SanchayKranti network.
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
                  <Users
                    size={20}
                  />
                }
                label="Total Users"
                value={
                  stats.totalUsers
                }
              />

              <StatCard
                icon={
                  <UserCheck
                    size={20}
                  />
                }
                label="Pending Verification"
                value={
                  stats.pendingUsers
                }
              />

              <StatCard
                icon={
                  <BadgeCheck
                    size={20}
                  />
                }
                label="Verified Users"
                value={
                  stats.verifiedUsers
                }
              />

              <StatCard
                icon={
                  <ClipboardList
                    size={20}
                  />
                }
                label="Material Requests"
                value={
                  stats.requests
                }
              />

              <StatCard
                icon={
                  <Boxes
                    size={20}
                  />
                }
                label="Aggregator Lots"
                value={
                  stats.inventory
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
                  <FileCheck2
                    size={20}
                  />
                }
                label="Material Passports"
                value={
                  stats.passports
                }
              />

              <StatCard
                icon={
                  <Factory
                    size={20}
                  />
                }
                label="Order Value"
                value={money(
                  stats.totalOrderValue,
                )}
              />
            </div>

            <h2
              style={{
                marginTop: "32px",
              }}
            >
              Network Participants
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "12px",
              }}
            >
              <StatCard
                icon={
                  <PackageSearch
                    size={20}
                  />
                }
                label="Waste Generators"
                value={
                  stats.generators
                }
              />

              <StatCard
                icon={
                  <Truck
                    size={20}
                  />
                }
                label="Collection Partners"
                value={
                  stats.collectors
                }
              />

              <StatCard
                icon={
                  <Warehouse
                    size={20}
                  />
                }
                label="Aggregators"
                value={
                  stats.aggregators
                }
              />

              <StatCard
                icon={
                  <Recycle
                    size={20}
                  />
                }
                label="Recovery Facilities"
                value={
                  stats.recovery
                }
              />

              <StatCard
                icon={
                  <Factory
                    size={20}
                  />
                }
                label="Buyers"
                value={
                  stats.buyers
                }
              />
            </div>
          </>
        )}

        {/* USERS */}

        {page === "users" && (
          <>
            <span className="eyebrow">
              PARTICIPANT MANAGEMENT
            </span>

            <h1>
              Users & Verification
            </h1>

            {loading ? (
              <p>
                Loading users...
              </p>
            ) : users.length ? (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {users.map(
                  (account) => (
                    <div
                      key={
                        account.id
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
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems:
                            "flex-start",
                          gap: "15px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "7px",
                            }}
                          >
                            <UserRound
                              size={17}
                            />

                            <strong>
                              {account.fullName ||
                                account.organizationName ||
                                "User"}
                            </strong>
                          </div>

                          <p
                            style={{
                              margin:
                                "8px 0 4px",
                            }}
                          >
                            {account.organizationName ||
                              "—"}
                          </p>

                          <div
                            style={{
                              fontSize:
                                "13px",
                              color:
                                "#707971",
                              lineHeight:
                                1.7,
                            }}
                          >
                            {account.email}

                            <br />

                            {roleLabel(
                              account.role,
                            )}

                            <br />

                            {account.city ||
                              "—"}
                          </div>
                        </div>

                        <div
                          style={{
                            minWidth:
                              "180px",
                          }}
                        >
                          <div>
                            Verification:{" "}
                            <strong>
                              {account.verificationStatus ||
                                "pending"}
                            </strong>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "5px",
                            }}
                          >
                            Account:{" "}
                            <strong>
                              {account.isActive ===
                              false
                                ? "Inactive"
                                : "Active"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {account.role !==
                        "admin" && (
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            marginTop:
                              "14px",
                            flexWrap: "wrap",
                          }}
                        >
                          {account.verificationStatus !==
                            "verified" && (
                            <button
                              type="button"
                              className="button button-primary"
                              disabled={
                                actionLoading ===
                                `verify-${account.id}`
                              }
                              onClick={() =>
                                handleVerify(
                                  account.id,
                                )
                              }
                            >
                              <BadgeCheck
                                size={16}
                              />

                              Verify
                            </button>
                          )}

                          {account.verificationStatus !==
                            "rejected" && (
                            <button
                              type="button"
                              className="button button-outline"
                              disabled={
                                actionLoading ===
                                `reject-${account.id}`
                              }
                              onClick={() =>
                                handleReject(
                                  account.id,
                                )
                              }
                            >
                              <XCircle
                                size={16}
                              />

                              Reject
                            </button>
                          )}

                          <button
                            type="button"
                            className="button button-outline"
                            disabled={
                              actionLoading ===
                              `active-${account.id}`
                            }
                            onClick={() =>
                              handleToggleActive(
                                account,
                              )
                            }
                          >
                            {account.isActive ===
                            false
                              ? "Activate"
                              : "Deactivate"}
                          </button>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No users found.
              </p>
            )}
          </>
        )}

        {/* REQUESTS */}

        {page === "requests" && (
          <>
            <span className="eyebrow">
              WASTE GENERATOR CHANNEL
            </span>

            <h1>
              Material Requests
            </h1>

            {materialRequests.length ? (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {materialRequests.map(
                  (request) => (
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
                      <strong>
                        {request.material}
                      </strong>

                      <p>
                        Source:{" "}
                        {request.sourceName ||
                          "—"}
                      </p>

                      <p>
                        Requested:{" "}
                        {request.quantity}{" "}
                        {request.unit ||
                          "kg"}
                      </p>

                      <p>
                        Collected:{" "}
                        {request.actualCollectedWeight ??
                          "—"}{" "}
                        kg
                      </p>

                      <p>
                        Status:{" "}
                        <strong>
                          {request.status}
                        </strong>
                      </p>

                      <p>
                        Recovery Status:{" "}
                        <strong>
                          {request.recoveryStatus ||
                            "—"}
                        </strong>
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No material requests.
              </p>
            )}
          </>
        )}

        {/* INVENTORY */}

        {page === "inventory" && (
          <>
            <span className="eyebrow">
              AGGREGATOR CHANNEL
            </span>

            <h1>
              Aggregator Inventory
            </h1>

            {aggregatorInventory.length ? (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                }}
              >
                {aggregatorInventory.map(
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
                      <strong>
                        {item.material}
                      </strong>

                      <p>
                        Aggregator:{" "}
                        {item.aggregatorName ||
                          "—"}
                      </p>

                      <p>
                        Seller:{" "}
                        {item.sellerName ||
                          "—"}
                      </p>

                      <p>
                        Original Weight:{" "}
                        {item.weight ||
                          0}{" "}
                        kg
                      </p>

                      <p>
                        Verified Weight:{" "}
                        {item.verifiedWeight ??
                          "—"}{" "}
                        kg
                      </p>

                      <p>
                        Marketplace Available:{" "}
                        <strong>
                          {item.marketplaceAvailableWeight ??
                            item.verifiedWeight ??
                            item.weight ??
                            0}{" "}
                          kg
                        </strong>
                      </p>

                      <p>
                        Status:{" "}
                        <strong>
                          {item.status}
                        </strong>
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No aggregator inventory.
              </p>
            )}
          </>
        )}

        {/* ORDERS */}

        {page === "orders" && (
          <>
            <span className="eyebrow">
              MARKETPLACE
            </span>

            <h1>
              Buyer Orders
            </h1>

            {orders.length ? (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
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
                      <strong>
                        {order.material}
                      </strong>

                      <p>
                        Buyer:{" "}
                        {order.buyerName ||
                          "—"}
                      </p>

                      <p>
                        Quantity:{" "}
                        {order.quantity}{" "}
                        kg
                      </p>

                      <p>
                        Total:{" "}
                        <strong>
                          {money(
                            order.totalValue,
                          )}
                        </strong>
                      </p>

                      <p>
                        Recovery Facility:{" "}
                        {order.recoveryFacilityName ||
                          "—"}
                      </p>

                      <p>
                        Status:{" "}
                        <strong>
                          {order.status}
                        </strong>
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No buyer orders.
              </p>
            )}
          </>
        )}

        {/* PASSPORTS */}

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
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "12px",
                }}
              >
                {passports.map(
                  (passport) => (
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
                          "18px",
                      }}
                    >
                      <FileCheck2
                        size={24}
                        color="#1f6b45"
                      />

                      <h3>
                        {passport.material}
                      </h3>

                      <p>
                        Passport:{" "}
                        <strong>
                          {passport.passportCode}
                        </strong>
                      </p>

                      <p>
                        Weight:{" "}
                        {passport.processedWeight}{" "}
                        kg
                      </p>

                      <p>
                        Grade:{" "}
                        {passport.grade ||
                          "—"}
                      </p>

                      <p>
                        Channel:{" "}
                        {passport.sourceChannel}
                      </p>

                      <p>
                        Recovery Facility:{" "}
                        {passport.recoveryFacilityName ||
                          "—"}
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p>
                No passports generated.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}