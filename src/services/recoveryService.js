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
   LISTEN TO MATERIAL COLLECTED BY COLLECTION PARTNERS
========================================================= */

export function listenToCollectedMaterial(
  callback,
  onError,
) {
  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  const collectedQuery =
    query(
      requestsRef,
      where(
        "status",
        "==",
        "collected",
      ),
    );

  return onSnapshot(
    collectedQuery,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            sourceChannel:
              "collection_partner",
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Collected material listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO MATERIAL DISPATCHED BY AGGREGATORS
========================================================= */

export function listenToAggregatorDispatches(
  callback,
  onError,
) {
  const inventoryRef =
    collection(
      db,
      "aggregatorInventory",
    );

  const dispatchQuery =
    query(
      inventoryRef,
      where(
        "status",
        "==",
        "dispatched_to_recovery",
      ),
    );

  return onSnapshot(
    dispatchQuery,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            sourceChannel:
              "material_aggregator",
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Aggregator dispatch listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   RECEIVE COLLECTION-PARTNER MATERIAL
========================================================= */

export async function receiveCollectedMaterial({
  requestId,
  recoveryUser,
}) {
  if (!requestId) {
    throw new Error(
      "Material request is required.",
    );
  }

  if (!recoveryUser?.uid) {
    throw new Error(
      "Recovery Facility account is required.",
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
      recoveryFacilityId:
        recoveryUser.uid,

      recoveryFacilityName:
        recoveryUser.organizationName ||
        recoveryUser.fullName ||
        "Recovery Facility",

      recoveryStatus:
        "received",

      receivedAt:
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
   RECEIVE AGGREGATOR MATERIAL
========================================================= */

export async function receiveAggregatorMaterial({
  inventoryId,
  recoveryUser,
}) {
  if (!inventoryId) {
    throw new Error(
      "Aggregator inventory item is required.",
    );
  }

  if (!recoveryUser?.uid) {
    throw new Error(
      "Recovery Facility account is required.",
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
      recoveryFacilityId:
        recoveryUser.uid,

      recoveryFacilityName:
        recoveryUser.organizationName ||
        recoveryUser.fullName ||
        "Recovery Facility",

      status:
        "received_at_recovery",

      receivedAt:
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
   VERIFY COLLECTION-PARTNER MATERIAL
========================================================= */

export async function verifyCollectedMaterial({
  requestId,
  verifiedWeight,
  grade,
  recoveryPricePerKg,
}) {
  const weight =
    Number(verifiedWeight);

  const price =
    Number(recoveryPricePerKg);

  if (
    !weight ||
    weight <= 0
  ) {
    throw new Error(
      "Verified weight must be greater than 0.",
    );
  }

  if (
    !grade
  ) {
    throw new Error(
      "Please select a material grade.",
    );
  }

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      "Enter a valid recovery price.",
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
      verifiedWeight:
        weight,

      grade,

      recoveryPricePerKg:
        price,

      recoveredValue:
        weight * price,

      recoveryStatus:
        "verified",

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
   VERIFY AGGREGATOR MATERIAL
========================================================= */

export async function verifyAggregatorMaterial({
  inventoryId,
  verifiedWeight,
  grade,
  recoveryPricePerKg,
}) {
  const weight =
    Number(verifiedWeight);

  const price =
    Number(recoveryPricePerKg);

  if (
    !weight ||
    weight <= 0
  ) {
    throw new Error(
      "Verified weight must be greater than 0.",
    );
  }

  if (!grade) {
    throw new Error(
      "Please select a material grade.",
    );
  }

  if (
    !Number.isFinite(price) ||
    price < 0
  ) {
    throw new Error(
      "Enter a valid recovery price.",
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
      verifiedWeight:
        weight,

      grade,

      recoveryPricePerKg:
        price,

      recoveredValue:
        weight * price,

      status:
        "verified_at_recovery",

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
   MARK COLLECTION MATERIAL AS PROCESSED
========================================================= */

export async function processCollectedMaterial(
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
      recoveryStatus:
        "processed",

      status:
        "processed",

      availableQuantity:
        null,

      processedAt:
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
   MARK AGGREGATOR MATERIAL AS PROCESSED
========================================================= */

export async function processAggregatorMaterial(
  inventoryId,
) {
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
        "processed",

      processedAt:
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
   LISTEN TO RECOVERY FACILITY'S COLLECTION MATERIAL
========================================================= */

export function listenToRecoveryCollectionMaterial(
  recoveryFacilityId,
  callback,
  onError,
) {
  if (!recoveryFacilityId) {
    callback([]);

    return () => {};
  }

  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  const recoveryQuery =
    query(
      requestsRef,
      where(
        "recoveryFacilityId",
        "==",
        recoveryFacilityId,
      ),
    );

  return onSnapshot(
    recoveryQuery,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            sourceChannel:
              "collection_partner",
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Recovery collection inventory listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO RECOVERY FACILITY'S AGGREGATOR MATERIAL
========================================================= */

export function listenToRecoveryAggregatorMaterial(
  recoveryFacilityId,
  callback,
  onError,
) {
  if (!recoveryFacilityId) {
    callback([]);

    return () => {};
  }

  const inventoryRef =
    collection(
      db,
      "aggregatorInventory",
    );

  const recoveryQuery =
    query(
      inventoryRef,
      where(
        "recoveryFacilityId",
        "==",
        recoveryFacilityId,
      ),
    );

  return onSnapshot(
    recoveryQuery,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            sourceChannel:
              "material_aggregator",
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Recovery aggregator inventory listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}