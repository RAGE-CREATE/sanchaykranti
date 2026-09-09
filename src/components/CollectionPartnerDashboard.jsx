import { useEffect, useMemo, useState } from "react";

import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  Languages,
  Leaf,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  Route,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  acceptPickupRequest,
  callWasteGenerator,
  completeCollection,
  getCurrentLocation,
  listenToAvailableRequests,
  listenToCollectorJobs,
  markCollectorReached,
  openGoogleMapsNavigation,
} from "../services/collectionService.js";

import {
  logoutUser,
} from "../services/authService.js";

/* =========================================================
   TRANSLATIONS
========================================================= */

const TEXT = {
  en: {
    dashboard: "Home",
    jobs: "Jobs",
    map: "Map",
    qr: "QR",
    earnings: "Earnings",
    profile: "Profile",

    hello: "Hello",
    availableJobs: "Available Jobs",
    activeJobs: "Active Jobs",
    completed: "Completed",
    totalWeight: "Collected Weight",
    earningsToday: "Total Earnings",

    nearbyJobs: "Nearby Pickup Jobs",
    myJobs: "My Jobs",
    noJobs: "No pickup jobs available right now.",

    openMap: "Open Map",
    callSource: "Call Source",
    acceptJob: "Accept Job",
    reached: "I Reached",
    collect: "Complete Collection",

    actualWeight: "Actual Weight (kg)",
    enterWeight: "Enter collected weight",

    collected: "Collected",
    loading: "Loading jobs...",

    collectorCard: "Collector ID Card",
    verification: "Verification",
    totalCollections: "Total Collections",
    totalEarnings: "Total Earnings",
    rating: "Rating",

    mapTitle: "Collection Map",
    mapText:
      "Open Google Maps navigation for available and accepted pickup jobs.",

    earningsTitle: "Your Earnings",
    thisWeek: "This Week",
    thisMonth: "This Month",

    profileTitle: "Collector Profile",
    language: "Language",
    city: "City",
    mobile: "Mobile",

    available: "Available",
    accepted: "Accepted",
    collectorReached: "Reached",

    logout: "Logout",
  },

  hi: {
    dashboard: "होम",
    jobs: "काम",
    map: "मैप",
    qr: "क्यूआर",
    earnings: "कमाई",
    profile: "प्रोफ़ाइल",

    hello: "नमस्ते",
    availableJobs: "उपलब्ध काम",
    activeJobs: "मेरे काम",
    completed: "पूरा किया",
    totalWeight: "एकत्र वजन",
    earningsToday: "कुल कमाई",

    nearbyJobs: "पास के कलेक्शन काम",
    myJobs: "मेरे कलेक्शन काम",
    noJobs: "अभी कोई कलेक्शन काम उपलब्ध नहीं है।",

    openMap: "रास्ता देखें",
    callSource: "स्रोत को कॉल करें",
    acceptJob: "काम स्वीकार करें",
    reached: "मैं पहुँच गया",
    collect: "कलेक्शन पूरा करें",

    actualWeight: "वास्तविक वजन (किलो)",
    enterWeight: "एकत्र वजन दर्ज करें",

    collected: "कलेक्शन पूरा",
    loading: "काम लोड हो रहे हैं...",

    collectorCard: "कलेक्टर पहचान कार्ड",
    verification: "सत्यापन",
    totalCollections: "कुल कलेक्शन",
    totalEarnings: "कुल कमाई",
    rating: "रेटिंग",

    mapTitle: "कलेक्शन मैप",
    mapText:
      "उपलब्ध और स्वीकार किए गए काम के लिए Google Maps खोलें।",

    earningsTitle: "आपकी कमाई",
    thisWeek: "इस सप्ताह",
    thisMonth: "इस महीने",

    profileTitle: "कलेक्टर प्रोफ़ाइल",
    language: "भाषा",
    city: "शहर",
    mobile: "मोबाइल",

    available: "उपलब्ध",
    accepted: "स्वीकार किया",
    collectorReached: "पहुँच गए",

    logout: "लॉगआउट",
  },

  mr: {
    dashboard: "मुख्यपृष्ठ",
    jobs: "कामे",
    map: "नकाशा",
    qr: "क्यूआर",
    earnings: "कमाई",
    profile: "प्रोफाइल",

    hello: "नमस्कार",
    availableJobs: "उपलब्ध कामे",
    activeJobs: "माझी कामे",
    completed: "पूर्ण",
    totalWeight: "गोळा केलेले वजन",
    earningsToday: "एकूण कमाई",

    nearbyJobs: "जवळची कलेक्शन कामे",
    myJobs: "माझी कलेक्शन कामे",
    noJobs: "सध्या कोणतेही कलेक्शन काम उपलब्ध नाही.",

    openMap: "मार्ग पहा",
    callSource: "स्रोताला कॉल करा",
    acceptJob: "काम स्वीकारा",
    reached: "मी पोहोचलो",
    collect: "कलेक्शन पूर्ण करा",

    actualWeight: "प्रत्यक्ष वजन (किलो)",
    enterWeight: "गोळा केलेले वजन टाका",

    collected: "कलेक्शन पूर्ण",
    loading: "कामे लोड होत आहेत...",

    collectorCard: "कलेक्टर ओळखपत्र",
    verification: "पडताळणी",
    totalCollections: "एकूण कलेक्शन",
    totalEarnings: "एकूण कमाई",
    rating: "रेटिंग",

    mapTitle: "कलेक्शन नकाशा",
    mapText:
      "उपलब्ध आणि स्वीकारलेल्या कामांसाठी Google Maps उघडा.",

    earningsTitle: "तुमची कमाई",
    thisWeek: "या आठवड्यात",
    thisMonth: "या महिन्यात",

    profileTitle: "कलेक्टर प्रोफाइल",
    language: "भाषा",
    city: "शहर",
    mobile: "मोबाइल",

    available: "उपलब्ध",
    accepted: "स्वीकारले",
    collectorReached: "पोहोचले",

    logout: "लॉगआउट",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function money(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function statusLabel(status, t) {
  if (status === "pending") return t.available;
  if (status === "accepted") return t.accepted;
  if (status === "collector_reached") return t.collectorReached;
  if (status === "collected") return t.collected;

  return status || "—";
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
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          display: "grid",
          placeItems: "center",
          borderRadius: "11px",
          background: "#e8f2eb",
          color: "#1f6b45",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#727970",
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
   MAIN COMPONENT
========================================================= */

export default function CollectionPartnerDashboard({
  user,
  collectorProfile,
}) {
  const initialLanguage =
    user?.preferredLanguage || "hi";

  const [language, setLanguage] =
    useState(initialLanguage);

  const [page, setPage] =
    useState("dashboard");

  const [
    availableRequests,
    setAvailableRequests,
  ] = useState([]);

  const [
    collectorJobs,
    setCollectorJobs,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    weightInputs,
    setWeightInputs,
  ] = useState({});

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const t =
    TEXT[language] || TEXT.en;

  /* =======================================================
     FIRESTORE LISTENERS
  ======================================================= */

  useEffect(() => {
    setLoading(true);

    const unsubscribeAvailable =
      listenToAvailableRequests(
        (requests) => {
          setAvailableRequests(
            requests,
          );

          setLoading(false);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load available pickup requests.",
          );

          setLoading(false);
        },
      );

    const unsubscribeMine =
      listenToCollectorJobs(
        user?.uid,

        (jobs) => {
          setCollectorJobs(jobs);
        },

        (listenerError) => {
          console.error(
            listenerError,
          );

          setError(
            "Unable to load your collection jobs.",
          );
        },
      );

    return () => {
      unsubscribeAvailable();
      unsubscribeMine();
    };
  }, [user?.uid]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const profileCollections =
      Number(
        collectorProfile
          ?.totalCollections || 0,
      );

    const firestoreCollected =
      collectorJobs.filter(
        (job) =>
          job.status === "collected",
      ).length;

    const completed =
      Math.max(
        profileCollections,
        firestoreCollected,
      );

    const profileWeight =
      Number(
        collectorProfile
          ?.totalWeightCollected || 0,
      );

    const firestoreWeight =
      collectorJobs
        .filter(
          (job) =>
            job.status ===
            "collected",
        )
        .reduce(
          (sum, job) =>
            sum +
            Number(
              job.actualCollectedWeight ||
                0,
            ),
          0,
        );

    return {
      completed,

      weight:
        profileWeight ||
        firestoreWeight,

      earnings:
        Number(
          collectorProfile
            ?.totalEarnings || 0,
        ),
    };
  }, [
    collectorProfile,
    collectorJobs,
  ]);

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
     ACCEPT JOB
  ======================================================= */

  async function handleAccept(job) {
    try {
      setError("");

      setActionLoading(
        `accept-${job.id}`,
      );

      await acceptPickupRequest({
        requestId: job.id,

        collector: user,
      });
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to accept this job.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     MARK REACHED
  ======================================================= */

  async function handleReached(job) {
    try {
      setError("");

      setActionLoading(
        `reached-${job.id}`,
      );

      await markCollectorReached(
        job.id,
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to update job.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     COMPLETE COLLECTION
  ======================================================= */

  async function handleCollection(
    job,
  ) {
    const actualWeight =
      Number(
        weightInputs[job.id],
      );

    if (
      !actualWeight ||
      actualWeight <= 0
    ) {
      setError(
        "Please enter the actual collected weight.",
      );

      return;
    }

    try {
      setError("");

      setActionLoading(
        `collect-${job.id}`,
      );

      let collectorLocation =
        null;

      try {
        collectorLocation =
          await getCurrentLocation();
      } catch (locationError) {
        console.warn(
          "Location unavailable:",
          locationError,
        );
      }

      await completeCollection({
        requestId: job.id,
        actualWeight,
        collectorLocation,
      });

      setWeightInputs(
        (previous) => ({
          ...previous,
          [job.id]: "",
        }),
      );
    } catch (actionError) {
      console.error(
        actionError,
      );

      setError(
        actionError.message ||
          "Unable to complete collection.",
      );
    } finally {
      setActionLoading("");
    }
  }

  /* =======================================================
     MAP
  ======================================================= */

  function handleMap(job) {
    try {
      openGoogleMapsNavigation(
        job,
      );
    } catch (mapError) {
      setError(
        mapError.message,
      );
    }
  }

  /* =======================================================
     CALL
  ======================================================= */

  function handleCall(job) {
    try {
      callWasteGenerator(
        job.sourcePhone ||
          job.phone,
      );
    } catch (callError) {
      setError(
        callError.message,
      );
    }
  }

  /* =======================================================
     JOB CARD
  ======================================================= */

  function JobCard({ job }) {
    const isPending =
      job.status === "pending";

    const isAccepted =
      job.status === "accepted";

    const isReached =
      job.status ===
      "collector_reached";

    const isCollected =
      job.status === "collected";

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
            gap: "14px",
          }}
        >
          <div>
            <div
              style={{
                color: "#1f6b45",
                fontWeight: 700,
                fontSize: "13px",
                marginBottom: "5px",
              }}
            >
              {job.material ||
                "Material"}
            </div>

            <h3
              style={{
                margin: "0 0 6px",
              }}
            >
              {job.sourceName ||
                job.generatorName ||
                "Waste Generator"}
            </h3>

            <div
              style={{
                fontSize: "13px",
                color: "#717970",
                lineHeight: 1.7,
              }}
            >
              {Number(
                job.quantity || 0,
              )}{" "}
              {job.unit || "kg"}

              <br />

              {job.address ||
                job.city ||
                "Location unavailable"}

              <br />

              Status:{" "}
              <strong>
                {statusLabel(
                  job.status,
                  t,
                )}
              </strong>
            </div>
          </div>

          <Truck
            size={28}
            color="#816b4e"
          />
        </div>

        {!isCollected && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <button
              type="button"
              className="button button-outline"
              onClick={() =>
                handleMap(job)
              }
            >
              <Navigation
                size={16}
              />

              {t.openMap}
            </button>

            <button
              type="button"
              className="button button-outline"
              onClick={() =>
                handleCall(job)
              }
            >
              <Phone size={16} />

              {t.callSource}
            </button>
          </div>
        )}

        {isPending && (
          <button
            type="button"
            className="button button-primary button-full"
            style={{
              marginTop: "8px",
            }}
            disabled={
              actionLoading ===
              `accept-${job.id}`
            }
            onClick={() =>
              handleAccept(job)
            }
          >
            {actionLoading ===
            `accept-${job.id}`
              ? "..."
              : t.acceptJob}
          </button>
        )}

        {isAccepted && (
          <button
            type="button"
            className="button button-primary button-full"
            style={{
              marginTop: "8px",
            }}
            disabled={
              actionLoading ===
              `reached-${job.id}`
            }
            onClick={() =>
              handleReached(job)
            }
          >
            {actionLoading ===
            `reached-${job.id}`
              ? "..."
              : t.reached}
          </button>
        )}

        {isReached && (
          <div
            style={{
              marginTop: "14px",
              display: "grid",
              gap: "9px",
            }}
          >
            <label>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  marginBottom:
                    "6px",
                  fontWeight: 700,
                }}
              >
                {t.actualWeight}
              </span>

              <input
                type="number"
                min="0"
                step="0.1"
                placeholder={
                  t.enterWeight
                }
                value={
                  weightInputs[
                    job.id
                  ] || ""
                }
                onChange={(
                  event,
                ) =>
                  setWeightInputs(
                    (
                      previous,
                    ) => ({
                      ...previous,

                      [job.id]:
                        event
                          .target
                          .value,
                    }),
                  )
                }
                style={{
                  width: "100%",
                  padding:
                    "11px 12px",
                  border:
                    "1px solid #d7ddd8",
                  borderRadius:
                    "9px",
                }}
              />
            </label>

            <button
              type="button"
              className="button button-primary button-full"
              disabled={
                actionLoading ===
                `collect-${job.id}`
              }
              onClick={() =>
                handleCollection(job)
              }
            >
              {actionLoading ===
              `collect-${job.id}`
                ? "..."
                : t.collect}
            </button>
          </div>
        )}

        {isCollected && (
          <div
            style={{
              marginTop: "12px",
              background: "#e8f2eb",
              color: "#1f6b45",
              borderRadius: "9px",
              padding: "11px",
              textAlign: "center",
              fontWeight: 700,
            }}
          >
            ✓ {t.collected}

            {job.actualCollectedWeight
              ? ` · ${job.actualCollectedWeight} kg`
              : ""}
          </div>
        )}
      </div>
    );
  }

  /* =======================================================
     BOTTOM NAV
  ======================================================= */

  function BottomNav() {
    const items = [
      {
        id: "dashboard",
        label: t.dashboard,
        icon: (
          <Leaf size={20} />
        ),
      },
      {
        id: "jobs",
        label: t.jobs,
        icon: (
          <BriefcaseBusiness
            size={20}
          />
        ),
      },
      {
        id: "map",
        label: t.map,
        icon: (
          <MapPin size={20} />
        ),
      },
      {
        id: "qr",
        label: t.qr,
        icon: (
          <QrCode size={20} />
        ),
      },
      {
        id: "earnings",
        label: t.earnings,
        icon: (
          <WalletCards size={20} />
        ),
      },
      {
        id: "profile",
        label: t.profile,
        icon: (
          <UserRound size={20} />
        ),
      },
    ];

    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fffdf8",
          borderTop:
            "1px solid #dedfd8",
          display: "grid",
          gridTemplateColumns:
            "repeat(6, 1fr)",
          zIndex: 100,
        }}
      >
        {items.map(
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

                background:
                  page ===
                  item.id
                    ? "#e8f2eb"
                    : "transparent",

                padding:
                  "10px 4px",

                minHeight:
                  "64px",

                display:
                  "flex",

                flexDirection:
                  "column",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap: "4px",

                color:
                  page ===
                  item.id
                    ? "#1f6b45"
                    : "#626b64",

                cursor:
                  "pointer",

                fontSize:
                  "11px",

                fontWeight:
                  600,
              }}
            >
              {item.icon}

              {item.label}
            </button>
          ),
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
        paddingBottom: "86px",
        color: "#26352d",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          background: "#fffdf8",
          borderBottom:
            "1px solid #dedfd8",
          padding: "14px 18px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                background: "#1f6b45",
                color: "white",
              }}
            >
              <Truck size={20} />
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                }}
              >
                SanchayKranti
              </strong>

              <span
                style={{
                  fontSize: "11px",
                  color: "#747c76",
                }}
              >
                Collection Partner
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                position: "relative",
              }}
            >
              <Languages
                size={17}
                style={{
                  position:
                    "absolute",
                  left: "9px",
                  top: "10px",
                  pointerEvents:
                    "none",
                }}
              />

              <select
                value={language}
                onChange={(
                  event,
                ) =>
                  setLanguage(
                    event.target
                      .value,
                  )
                }
                style={{
                  padding:
                    "8px 8px 8px 32px",
                  border:
                    "1px solid #d9ddd7",
                  borderRadius:
                    "9px",
                  background:
                    "#fff",
                }}
              >
                <option value="en">
                  English
                </option>

                <option value="hi">
                  हिन्दी
                </option>

                <option value="mr">
                  मराठी
                </option>
              </select>
            </div>

            <button
              type="button"
              className="button button-outline"
              onClick={
                handleLogout
              }
            >
              <LogOut size={16} />

              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "22px 16px",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom:
                "16px",
              padding:
                "12px 14px",
              border:
                "1px solid #e5bcbc",
              background:
                "#fff1f1",
              borderRadius:
                "10px",
              color:
                "#8a2929",
              fontSize:
                "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* HOME */}

        {page === "dashboard" && (
          <>
            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "14px",
                  color:
                    "#737b74",
                }}
              >
                {t.hello}
              </div>

              <h1
                style={{
                  margin:
                    "4px 0 0",
                  fontSize:
                    "28px",
                }}
              >
                {user?.fullName ||
                  "Collection Partner"}
              </h1>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "10px",
              }}
            >
              <StatCard
                icon={
                  <BriefcaseBusiness
                    size={20}
                  />
                }
                label={
                  t.availableJobs
                }
                value={
                  availableRequests
                    .length
                }
              />

              <StatCard
                icon={
                  <Truck
                    size={20}
                  />
                }
                label={
                  t.activeJobs
                }
                value={
                  collectorJobs.filter(
                    (job) =>
                      job.status !==
                      "collected",
                  ).length
                }
              />

              <StatCard
                icon={
                  <Route
                    size={20}
                  />
                }
                label={
                  t.totalWeight
                }
                value={`${stats.weight} kg`}
              />

              <StatCard
                icon={
                  <BadgeIndianRupee
                    size={20}
                  />
                }
                label={
                  t.earningsToday
                }
                value={money(
                  stats.earnings,
                )}
              />
            </div>

            <h2
              style={{
                margin:
                  "28px 0 14px",
                fontSize:
                  "19px",
              }}
            >
              {t.nearbyJobs}
            </h2>

            {loading ? (
              <p>{t.loading}</p>
            ) : availableRequests.length ? (
              <div
                style={{
                  display:
                    "grid",
                  gap: "12px",
                }}
              >
                {availableRequests
                  .slice(0, 3)
                  .map(
                    (job) => (
                      <JobCard
                        key={
                          job.id
                        }
                        job={
                          job
                        }
                      />
                    ),
                  )}
              </div>
            ) : (
              <p>{t.noJobs}</p>
            )}
          </>
        )}

        {/* JOBS */}

        {page === "jobs" && (
          <>
            <h1
              style={{
                marginTop: 0,
              }}
            >
              {t.myJobs}
            </h1>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {collectorJobs.length ? (
                collectorJobs.map(
                  (job) => (
                    <JobCard
                      key={
                        job.id
                      }
                      job={job}
                    />
                  ),
                )
              ) : (
                <p>{t.noJobs}</p>
              )}
            </div>

            <h2
              style={{
                margin:
                  "30px 0 14px",
              }}
            >
              {t.availableJobs}
            </h2>

            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {availableRequests.length ? (
                availableRequests.map(
                  (job) => (
                    <JobCard
                      key={
                        job.id
                      }
                      job={job}
                    />
                  ),
                )
              ) : (
                <p>{t.noJobs}</p>
              )}
            </div>
          </>
        )}

        {/* MAP */}

        {page === "map" && (
          <>
            <h1
              style={{
                marginTop: 0,
              }}
            >
              {t.mapTitle}
            </h1>

            <p
              style={{
                color:
                  "#6d756f",
              }}
            >
              {t.mapText}
            </p>

            <div
              style={{
                display:
                  "grid",
                gap: "10px",
                marginTop:
                  "20px",
              }}
            >
              {[
                ...collectorJobs.filter(
                  (job) =>
                    job.status !==
                    "collected",
                ),

                ...availableRequests,
              ].map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className="button button-outline button-full"
                  onClick={() =>
                    handleMap(
                      job,
                    )
                  }
                >
                  <MapPin
                    size={17}
                  />

                  {job.sourceName ||
                    job.generatorName ||
                    job.address ||
                    job.city}
                </button>
              ))}
            </div>
          </>
        )}

        {/* QR */}

        {page === "qr" && (
          <>
            <h1
              style={{
                marginTop: 0,
              }}
            >
              {t.collectorCard}
            </h1>

            <div
              style={{
                background:
                  "#fffdf8",
                border:
                  "1px solid #dedfd8",
                borderRadius:
                  "16px",
                padding:
                  "26px",
                maxWidth:
                  "420px",
              }}
            >
              <div
                style={{
                  width:
                    "110px",
                  height:
                    "110px",
                  display:
                    "grid",
                  placeItems:
                    "center",
                  background:
                    "#f1f1ec",
                  borderRadius:
                    "12px",
                  marginBottom:
                    "18px",
                }}
              >
                <QrCode
                  size={64}
                  color="#1f6b45"
                />
              </div>

              <h2>
                {user?.fullName}
              </h2>

              <p>
                {collectorProfile
                  ?.collectorCode ||
                  "Collector ID"}
              </p>

              <div
                style={{
                  display:
                    "grid",
                  gap: "10px",
                  marginTop:
                    "18px",
                  fontSize:
                    "14px",
                }}
              >
                <div>
                  <strong>
                    {t.verification}:
                  </strong>{" "}
                  {collectorProfile
                    ?.verificationStatus ||
                    "pending"}
                </div>

                <div>
                  <strong>
                    {t.totalCollections}:
                  </strong>{" "}
                  {stats.completed}
                </div>

                <div>
                  <strong>
                    {t.totalEarnings}:
                  </strong>{" "}
                  {money(
                    stats.earnings,
                  )}
                </div>

                <div>
                  <strong>
                    {t.rating}:
                  </strong>{" "}
                  {collectorProfile
                    ?.averageRating ||
                    0}
                  /5
                </div>
              </div>
            </div>
          </>
        )}

        {/* EARNINGS */}

        {page ===
          "earnings" && (
          <>
            <h1
              style={{
                marginTop: 0,
              }}
            >
              {t.earningsTitle}
            </h1>

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
                  <BadgeIndianRupee
                    size={20}
                  />
                }
                label={
                  t.earningsToday
                }
                value={money(
                  stats.earnings,
                )}
              />

              <StatCard
                icon={
                  <WalletCards
                    size={20}
                  />
                }
                label={
                  t.thisWeek
                }
                value={money(
                  stats.earnings,
                )}
              />

              <StatCard
                icon={
                  <WalletCards
                    size={20}
                  />
                }
                label={
                  t.thisMonth
                }
                value={money(
                  stats.earnings,
                )}
              />
            </div>
          </>
        )}

        {/* PROFILE */}

        {page === "profile" && (
          <>
            <h1
              style={{
                marginTop: 0,
              }}
            >
              {t.profileTitle}
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
                display:
                  "grid",
                gap:
                  "14px",
                maxWidth:
                  "520px",
              }}
            >
              <div>
                <strong>
                  {user?.fullName}
                </strong>
              </div>

              <div>
                {user?.email}
              </div>

              <div>
                <strong>
                  {t.city}:
                </strong>{" "}
                {user?.city ||
                  "—"}
              </div>

              <div>
                <strong>
                  {t.mobile}:
                </strong>{" "}
                {user?.phone ||
                  "—"}
              </div>

              <div>
                <strong>
                  {t.language}:
                </strong>{" "}
                {language}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}