import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   CREATE PICKUP REQUEST
========================================================= */

export async function createPickupRequest({
  user,
  material,
  quantity,
  unit = "kg",
  address,
  city,
  pickupDate,
  notes = "",
  latitude = null,
  longitude = null,
}) {
  if (!user?.uid) {
    throw new Error(
      "Waste Generator account is required.",
    );
  }

  if (!material) {
    throw new Error(
      "Please select a material.",
    );
  }

  const numericQuantity =
    Number(quantity);

  if (
    !numericQuantity ||
    numericQuantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than 0.",
    );
  }

  if (!address?.trim()) {
    throw new Error(
      "Pickup address is required.",
    );
  }

  const requestData = {
    sourceId:
      user.uid,

    sourceName:
      user.organizationName ||
      user.fullName ||
      "Waste Generator",

    sourceContactName:
      user.fullName || "",

    sourceEmail:
      user.email || "",

    sourcePhone:
      user.phone || "",

    material,

    quantity:
      numericQuantity,

    unit,

    address:
      address.trim(),

    city:
      city?.trim() ||
      user.city ||
      "",

    pickupDate:
      pickupDate || "",

    notes:
      notes.trim(),

    status:
      "pending",

    collectionPartnerId:
      null,

    collectionPartnerName:
      "",

    collectionPartnerPhone:
      "",

    actualCollectedWeight:
      null,

    recoveryStatus:
      "not_started",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    requestData.latitude =
      latitude;

    requestData.longitude =
      longitude;
  }

  const requestRef =
    await addDoc(
      collection(
        db,
        "materialRequests",
      ),
      requestData,
    );

  return {
    success: true,
    id: requestRef.id,
  };
}

/* =========================================================
   LISTEN TO WASTE GENERATOR REQUESTS
========================================================= */

export function listenToMyPickupRequests(
  userId,
  callback,
  onError,
) {
  if (!userId) {
    callback([]);

    return () => {};
  }

  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  const requestsQuery =
    query(
      requestsRef,
      where(
        "sourceId",
        "==",
        userId,
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
        "Waste Generator request listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   GET BROWSER LOCATION
========================================================= */

export function getGeneratorLocation() {
  return new Promise(
    (resolve, reject) => {
      if (
        !navigator.geolocation
      ) {
        reject(
          new Error(
            "Location is not supported on this device.",
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