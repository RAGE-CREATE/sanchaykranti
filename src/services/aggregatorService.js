import {
  addDoc,
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
   ADD AGGREGATOR INVENTORY
========================================================= */

export async function addAggregatorInventory({
  user,
  sellerName,
  sellerPhone = "",
  material,
  weight,
  unit = "kg",
  purchasePricePerKg,
  city = "",
  notes = "",
}) {
  if (!user?.uid) {
    throw new Error(
      "Material Aggregator account is required.",
    );
  }

  if (!sellerName?.trim()) {
    throw new Error(
      "Seller name is required.",
    );
  }

  if (!material) {
    throw new Error(
      "Please select a material.",
    );
  }

  const numericWeight =
    Number(weight);

  const numericPrice =
    Number(purchasePricePerKg);

  if (
    !numericWeight ||
    numericWeight <= 0
  ) {
    throw new Error(
      "Weight must be greater than 0.",
    );
  }

  if (
    !Number.isFinite(numericPrice) ||
    numericPrice < 0
  ) {
    throw new Error(
      "Enter a valid purchase price.",
    );
  }

  const totalPurchaseValue =
    numericWeight *
    numericPrice;

  const inventoryData = {
    aggregatorId:
      user.uid,

    aggregatorName:
      user.organizationName ||
      user.fullName ||
      "Material Aggregator",

    aggregatorEmail:
      user.email || "",

    aggregatorPhone:
      user.phone || "",

    sellerName:
      sellerName.trim(),

    sellerPhone:
      sellerPhone.trim(),

    material,

    weight:
      numericWeight,

    availableWeight:
      numericWeight,

    unit,

    purchasePricePerKg:
      numericPrice,

    totalPurchaseValue,

    city:
      city?.trim() ||
      user.city ||
      "",

    notes:
      notes?.trim() ||
      "",

    status:
      "in_stock",

    recoveryFacilityId:
      null,

    recoveryFacilityName:
      "",

    dispatchedWeight:
      0,

    dispatchedAt:
      null,

    receivedAt:
      null,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const inventoryRef =
    await addDoc(
      collection(
        db,
        "aggregatorInventory",
      ),
      inventoryData,
    );

  return {
    success: true,
    id: inventoryRef.id,
  };
}

/* =========================================================
   LISTEN TO AGGREGATOR INVENTORY
========================================================= */

export function listenToAggregatorInventory(
  aggregatorId,
  callback,
  onError,
) {
  if (!aggregatorId) {
    callback([]);

    return () => {};
  }

  const inventoryRef =
    collection(
      db,
      "aggregatorInventory",
    );

  const inventoryQuery =
    query(
      inventoryRef,
      where(
        "aggregatorId",
        "==",
        aggregatorId,
      ),
    );

  return onSnapshot(
    inventoryQuery,

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
        "Aggregator inventory listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO REAL RECOVERY FACILITIES
========================================================= */

export function listenToRecoveryFacilities(
  callback,
  onError,
) {
  const usersRef =
    collection(
      db,
      "users",
    );

  const recoveryQuery =
    query(
      usersRef,
      where(
        "role",
        "==",
        "recovery_facility",
      ),
    );

  return onSnapshot(
    recoveryQuery,

    (snapshot) => {
      const facilities =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(facilities);
    },

    (error) => {
      console.error(
        "Recovery facility listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   DISPATCH TO REAL RECOVERY FACILITY
========================================================= */

export async function dispatchAggregatorMaterial({
  inventoryId,
  recoveryFacilityId,
  recoveryFacilityName,
  dispatchWeight,
}) {
  if (!inventoryId) {
    throw new Error(
      "Inventory item is required.",
    );
  }

  if (!recoveryFacilityId) {
    throw new Error(
      "Please select a Recovery Facility.",
    );
  }

  const weight =
    Number(dispatchWeight);

  if (
    !weight ||
    weight <= 0
  ) {
    throw new Error(
      "Dispatch weight must be greater than 0.",
    );
  }

  const inventoryRef =
    doc(
      db,
      "aggregatorInventory",
      inventoryId,
    );

  await updateDoc(
    inventoryRef,
    {
      status:
        "dispatched_to_recovery",

      recoveryFacilityId,

      recoveryFacilityName:
        recoveryFacilityName ||
        "Recovery Facility",

      dispatchedWeight:
        weight,

      availableWeight:
        0,

      dispatchedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  return {
    success: true,
  };
}