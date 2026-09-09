import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   LISTEN TO AVAILABLE PICKUP REQUESTS
========================================================= */

export function listenToAvailableRequests(
  callback,
  onError,
) {
  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  const requestsQuery =
    query(
      requestsRef,
      where(
        "status",
        "==",
        "pending",
      ),
    );

  return onSnapshot(
    requestsQuery,

    (snapshot) => {
      const requests =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(requests);
    },

    (error) => {
      console.error(
        "Available request listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO COLLECTOR'S ACCEPTED JOBS
========================================================= */

export function listenToCollectorJobs(
  collectorId,
  callback,
  onError,
) {
  if (!collectorId) {
    callback([]);

    return () => {};
  }

  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  const collectorQuery =
    query(
      requestsRef,
      where(
        "collectionPartnerId",
        "==",
        collectorId,
      ),
    );

  return onSnapshot(
    collectorQuery,

    (snapshot) => {
      const jobs =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(jobs);
    },

    (error) => {
      console.error(
        "Collector jobs listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   ACCEPT PICKUP REQUEST
========================================================= */

export async function acceptPickupRequest({
  requestId,
  collector,
}) {
  if (!requestId) {
    throw new Error(
      "Request ID is required.",
    );
  }

  if (!collector?.uid) {
    throw new Error(
      "Collector account is required.",
    );
  }

  const requestRef =
    doc(
      db,
      "materialRequests",
      requestId,
    );

  await updateDoc(
    requestRef,
    {
      status: "accepted",

      collectionPartnerId:
        collector.uid,

      collectionPartnerName:
        collector.fullName || "",

      collectionPartnerPhone:
        collector.phone || "",

      acceptedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  return {
    success: true,
  };
}

/* =========================================================
   MARK COLLECTOR AS REACHED
========================================================= */

export async function markCollectorReached(
  requestId,
) {
  const requestRef =
    doc(
      db,
      "materialRequests",
      requestId,
    );

  await updateDoc(
    requestRef,
    {
      status:
        "collector_reached",

      reachedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  return {
    success: true,
  };
}

/* =========================================================
   COMPLETE COLLECTION
========================================================= */

export async function completeCollection({
  requestId,
  actualWeight,
  collectorLocation = null,
}) {
  if (!requestId) {
    throw new Error(
      "Request ID is required.",
    );
  }

  const weight =
    Number(actualWeight);

  if (
    !weight ||
    weight <= 0
  ) {
    throw new Error(
      "Actual weight must be greater than 0.",
    );
  }

  const requestRef =
    doc(
      db,
      "materialRequests",
      requestId,
    );

  const updates = {
    status:
      "collected",

    actualCollectedWeight:
      weight,

    collectedAt:
      serverTimestamp(),

    recoveryStatus:
      "awaiting_dispatch",

    updatedAt:
      serverTimestamp(),
  };

  if (
    collectorLocation &&
    Number.isFinite(
      collectorLocation.latitude,
    ) &&
    Number.isFinite(
      collectorLocation.longitude,
    )
  ) {
    updates.collectionLocation = {
      latitude:
        collectorLocation.latitude,

      longitude:
        collectorLocation.longitude,
    };
  }

  await updateDoc(
    requestRef,
    updates,
  );

  return {
    success: true,
  };
}

/* =========================================================
   GET CURRENT BROWSER LOCATION
========================================================= */

export function getCurrentLocation() {
  return new Promise(
    (resolve, reject) => {
      if (
        !navigator.geolocation
      ) {
        reject(
          new Error(
            "Location is not supported by this device.",
          ),
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      );
    },
  );
}

/* =========================================================
   OPEN GOOGLE MAPS NAVIGATION
========================================================= */

export function openGoogleMapsNavigation(
  request,
) {
  let destination = "";

  if (
    request?.latitude &&
    request?.longitude
  ) {
    destination =
      `${request.latitude},${request.longitude}`;
  } else if (
    request?.location?.latitude &&
    request?.location?.longitude
  ) {
    destination =
      `${request.location.latitude},${request.location.longitude}`;
  } else if (
    request?.address
  ) {
    destination =
      request.address;
  } else if (
    request?.city
  ) {
    destination =
      request.city;
  }

  if (!destination) {
    throw new Error(
      "Pickup location is not available.",
    );
  }

  const url =
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destination,
    )}`;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer",
  );
}

/* =========================================================
   CALL WASTE GENERATOR
========================================================= */

export function callWasteGenerator(
  phone,
) {
  if (!phone) {
    throw new Error(
      "Source phone number is not available.",
    );
  }

  window.location.href =
    `tel:${phone}`;
}