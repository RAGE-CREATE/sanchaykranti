import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   LISTEN TO PROCESSED MATERIAL FROM COLLECTION CHANNEL
========================================================= */

export function listenToProcessedCollectionMaterial(
  callback,
  onError,
) {
  const requestsRef =
    collection(
      db,
      "materialRequests",
    );

  const processedQuery =
    query(
      requestsRef,
      where(
        "status",
        "==",
        "processed",
      ),
    );

  return onSnapshot(
    processedQuery,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            sourceType:
              "collection_partner",
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Processed collection material listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   LISTEN TO PROCESSED MATERIAL FROM AGGREGATOR CHANNEL
========================================================= */

export function listenToProcessedAggregatorMaterial(
  callback,
  onError,
) {
  const inventoryRef =
    collection(
      db,
      "aggregatorInventory",
    );

  const processedQuery =
    query(
      inventoryRef,
      where(
        "status",
        "==",
        "processed",
      ),
    );

  return onSnapshot(
    processedQuery,

    (snapshot) => {
      const items =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            sourceType:
              "material_aggregator",
            ...document.data(),
          }),
        );

      callback(items);
    },

    (error) => {
      console.error(
        "Processed aggregator material listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   CREATE BUYER DEMAND
========================================================= */

export async function createBuyerDemand({
  user,
  material,
  quantity,
  unit = "kg",
  grade = "",
  maxPricePerKg,
  city = "",
  notes = "",
}) {
  if (!user?.uid) {
    throw new Error(
      "Buyer account is required.",
    );
  }

  if (!material) {
    throw new Error(
      "Please select a material.",
    );
  }

  const numericQuantity =
    Number(quantity);

  const numericPrice =
    Number(maxPricePerKg);

  if (
    !numericQuantity ||
    numericQuantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than 0.",
    );
  }

  if (
    !Number.isFinite(numericPrice) ||
    numericPrice < 0
  ) {
    throw new Error(
      "Enter a valid maximum price.",
    );
  }

  const demandData = {
    buyerId:
      user.uid,

    buyerName:
      user.organizationName ||
      user.fullName ||
      "Buyer",

    buyerEmail:
      user.email || "",

    buyerPhone:
      user.phone || "",

    material,

    quantity:
      numericQuantity,

    unit,

    grade,

    maxPricePerKg:
      numericPrice,

    city:
      city?.trim() ||
      user.city ||
      "",

    notes:
      notes?.trim() ||
      "",

    status:
      "open",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const demandRef =
    await addDoc(
      collection(
        db,
        "buyerDemands",
      ),
      demandData,
    );

  return {
    success: true,
    id: demandRef.id,
  };
}

/* =========================================================
   LISTEN TO MY DEMANDS
========================================================= */

export function listenToBuyerDemands(
  buyerId,
  callback,
  onError,
) {
  if (!buyerId) {
    callback([]);

    return () => {};
  }

  const demandsRef =
    collection(
      db,
      "buyerDemands",
    );

  const demandQuery =
    query(
      demandsRef,
      where(
        "buyerId",
        "==",
        buyerId,
      ),
    );

  return onSnapshot(
    demandQuery,

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
        "Buyer demands listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   PLACE ORDER + REDUCE STOCK
========================================================= */

export async function placeMaterialOrder({
  user,
  materialItem,
  orderQuantity,
}) {
  if (!user?.uid) {
    throw new Error(
      "Buyer account is required.",
    );
  }

  if (!materialItem?.id) {
    throw new Error(
      "Material item is required.",
    );
  }

  const quantity =
    Number(orderQuantity);

  if (
    !quantity ||
    quantity <= 0
  ) {
    throw new Error(
      "Order quantity must be greater than 0.",
    );
  }

  const sourceType =
    materialItem.sourceType;

  if (
    sourceType !==
      "collection_partner" &&
    sourceType !==
      "material_aggregator"
  ) {
    throw new Error(
      "Unknown material source type.",
    );
  }

  const sourceCollection =
    sourceType ===
    "collection_partner"
      ? "materialRequests"
      : "aggregatorInventory";

  const sourceRef =
    doc(
      db,
      sourceCollection,
      materialItem.id,
    );

  const orderRef =
    doc(
      collection(
        db,
        "orders",
      ),
    );

  await runTransaction(
    db,
    async (transaction) => {
      const sourceSnapshot =
        await transaction.get(
          sourceRef,
        );

      if (
        !sourceSnapshot.exists()
      ) {
        throw new Error(
          "Material lot no longer exists.",
        );
      }

      const sourceData =
        sourceSnapshot.data();

      /* =====================================================
         DETERMINE AVAILABLE STOCK
      ===================================================== */

      const originalVerifiedWeight =
        Number(
          sourceData.verifiedWeight ||
            sourceData.actualCollectedWeight ||
            sourceData.dispatchedWeight ||
            sourceData.weight ||
            0,
        );

      const storedAvailableWeight =
        sourceData.marketplaceAvailableWeight;

      const availableWeight =
        storedAvailableWeight ===
        undefined
          ? originalVerifiedWeight
          : Number(
              storedAvailableWeight,
            );

      if (
        availableWeight <= 0
      ) {
        throw new Error(
          "This material lot is sold out.",
        );
      }

      if (
        quantity >
        availableWeight
      ) {
        throw new Error(
          `Only ${availableWeight} kg is available.`,
        );
      }

      const newAvailableWeight =
        availableWeight -
        quantity;

      const pricePerKg =
        Number(
          sourceData.recoveryPricePerKg ||
            0,
        );

      /* =====================================================
         UPDATE MATERIAL LOT
      ===================================================== */

      transaction.update(
        sourceRef,
        {
          marketplaceAvailableWeight:
            newAvailableWeight,

          marketplaceStatus:
            newAvailableWeight > 0
              ? "available"
              : "sold_out",

          lastOrderedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );

      /* =====================================================
         CREATE ORDER
      ===================================================== */

      transaction.set(
        orderRef,
        {
          buyerId:
            user.uid,

          buyerName:
            user.organizationName ||
            user.fullName ||
            "Buyer",

          buyerEmail:
            user.email || "",

          buyerPhone:
            user.phone || "",

          materialSourceType:
            sourceType,

          materialSourceId:
            materialItem.id,

          recoveryFacilityId:
            sourceData.recoveryFacilityId ||
            "",

          recoveryFacilityName:
            sourceData.recoveryFacilityName ||
            "",

          material:
            sourceData.material ||
            "Material",

          grade:
            sourceData.grade ||
            "",

          quantity,

          unit: "kg",

          pricePerKg,

          totalValue:
            quantity *
            pricePerKg,

          availableBeforeOrder:
            availableWeight,

          availableAfterOrder:
            newAvailableWeight,

          status:
            "placed",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );

  return {
    success: true,
    id: orderRef.id,
  };
}

/* =========================================================
   LISTEN TO MY ORDERS
========================================================= */

export function listenToBuyerOrders(
  buyerId,
  callback,
  onError,
) {
  if (!buyerId) {
    callback([]);

    return () => {};
  }

  const ordersRef =
    collection(
      db,
      "orders",
    );

  const orderQuery =
    query(
      ordersRef,
      where(
        "buyerId",
        "==",
        buyerId,
      ),
    );

  return onSnapshot(
    orderQuery,

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
        "Buyer orders listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}