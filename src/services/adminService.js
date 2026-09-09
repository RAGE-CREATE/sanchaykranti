import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   LISTEN TO ALL USERS
========================================================= */

export function listenToAllUsers(
  callback,
  onError,
) {
  const usersRef =
    collection(
      db,
      "users",
    );

  return onSnapshot(
    usersRef,

    (snapshot) => {
      const users =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(users);
    },

    (error) => {
      console.error(
        "Admin users listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO MATERIAL REQUESTS
========================================================= */

export function listenToAllMaterialRequests(
  callback,
  onError,
) {
  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  return onSnapshot(
    requestsRef,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Admin material requests listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO AGGREGATOR INVENTORY
========================================================= */

export function listenToAllAggregatorInventory(
  callback,
  onError,
) {
  const inventoryRef =
    collection(
      db,
      "aggregatorInventory",
    );

  return onSnapshot(
    inventoryRef,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Admin aggregator inventory listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO ORDERS
========================================================= */

export function listenToAllOrders(
  callback,
  onError,
) {
  const ordersRef =
    collection(
      db,
      "orders",
    );

  return onSnapshot(
    ordersRef,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Admin orders listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO MATERIAL PASSPORTS
========================================================= */

export function listenToAllPassports(
  callback,
  onError,
) {
  const passportsRef =
    collection(
      db,
      "materialPassports",
    );

  return onSnapshot(
    passportsRef,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Admin passports listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   VERIFY USER
========================================================= */

export async function verifyUser(
  userId,
) {
  if (!userId) {
    throw new Error(
      "User ID is required.",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      userId,
    );

  await updateDoc(
    userRef,
    {
      verificationStatus:
        "verified",

      isActive:
        true,

      verifiedAt:
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
   REJECT USER
========================================================= */

export async function rejectUser(
  userId,
) {
  if (!userId) {
    throw new Error(
      "User ID is required.",
    );
  }

  const userRef =
    doc(
      db,
      "users",
      userId,
    );

  await updateDoc(
    userRef,
    {
      verificationStatus:
        "rejected",

      isActive:
        false,

      updatedAt:
        serverTimestamp(),
    },
  );

  return {
    success: true,
  };
}

/* =========================================================
   ACTIVATE USER
========================================================= */

export async function activateUser(
  userId,
) {
  const userRef =
    doc(
      db,
      "users",
      userId,
    );

  await updateDoc(
    userRef,
    {
      isActive: true,

      updatedAt:
        serverTimestamp(),
    },
  );

  return {
    success: true,
  };
}

/* =========================================================
   DEACTIVATE USER
========================================================= */

export async function deactivateUser(
  userId,
) {
  const userRef =
    doc(
      db,
      "users",
      userId,
    );

  await updateDoc(
    userRef,
    {
      isActive: false,

      updatedAt:
        serverTimestamp(),
    },
  );

  return {
    success: true,
  };
}