import {
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   CREATE MATERIAL PASSPORT
========================================================= */

export async function createMaterialPassport({
  recoveryUser,
  materialItem,
}) {
  if (!recoveryUser?.uid) {
    throw new Error(
      "Recovery Facility account is required.",
    );
  }

  if (!materialItem?.id) {
    throw new Error(
      "Processed material item is required.",
    );
  }

  const sourceChannel =
    materialItem.sourceChannel ||
    materialItem.sourceType ||
    "unknown";

  const processedWeight =
    Number(
      materialItem.verifiedWeight ||
        materialItem.actualCollectedWeight ||
        materialItem.dispatchedWeight ||
        materialItem.weight ||
        0,
    );

  const passportData = {
    passportCode: `MP-${Date.now()}`,

    material:
      materialItem.material ||
      "Material",

    grade:
      materialItem.grade ||
      "",

    processedWeight,

    unit: "kg",

    recoveryPricePerKg:
      Number(
        materialItem.recoveryPricePerKg ||
          0,
      ),

    sourceChannel,

    sourceDocumentId:
      materialItem.id,

    sourceName:
      materialItem.sourceName ||
      materialItem.aggregatorName ||
      materialItem.collectionPartnerName ||
      "Source",

    sourceContact:
      materialItem.sourcePhone ||
      materialItem.aggregatorPhone ||
      "",

    originalQuantity:
      Number(
        materialItem.quantity ||
          materialItem.weight ||
          materialItem.actualCollectedWeight ||
          0,
      ),

    collectionPartnerId:
      materialItem.collectionPartnerId ||
      "",

    collectionPartnerName:
      materialItem.collectionPartnerName ||
      "",

    aggregatorId:
      materialItem.aggregatorId ||
      "",

    aggregatorName:
      materialItem.aggregatorName ||
      "",

    recoveryFacilityId:
      recoveryUser.uid,

    recoveryFacilityName:
      recoveryUser.organizationName ||
      recoveryUser.fullName ||
      "Recovery Facility",

    city:
      recoveryUser.city ||
      materialItem.city ||
      "",

    status:
      "processed",

    marketplaceStatus:
      "available",

    availableWeight:
      processedWeight,

    isPublic: true,

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  const passportRef =
    await addDoc(
      collection(
        db,
        "materialPassports",
      ),
      passportData,
    );

  return {
    success: true,
    id: passportRef.id,
    passportCode:
      passportData.passportCode,
  };
}

/* =========================================================
   LISTEN TO PASSPORTS OF RECOVERY FACILITY
========================================================= */

export function listenToRecoveryPassports(
  recoveryFacilityId,
  callback,
  onError,
) {
  if (!recoveryFacilityId) {
    callback([]);
    return () => {};
  }

  const passportsRef =
    collection(
      db,
      "materialPassports",
    );

  const passportQuery =
    query(
      passportsRef,
      where(
        "recoveryFacilityId",
        "==",
        recoveryFacilityId,
      ),
    );

  return onSnapshot(
    passportQuery,

    (snapshot) => {
      const passports =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          }),
        );

      callback(passports);
    },

    (error) => {
      console.error(
        "Passport listener error:",
        error,
      );

      if (onError) {
        onError(error);
      }
    },
  );
}

/* =========================================================
   GET ONE PUBLIC PASSPORT
========================================================= */

export async function getMaterialPassport(
  passportId,
) {
  if (!passportId) {
    throw new Error(
      "Passport ID is required.",
    );
  }

  const passportRef =
    doc(
      db,
      "materialPassports",
      passportId,
    );

  const snapshot =
    await getDoc(
      passportRef,
    );

  if (!snapshot.exists()) {
    throw new Error(
      "Material Passport not found.",
    );
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}