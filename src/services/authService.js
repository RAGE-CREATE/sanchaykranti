import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

/* =========================================================
   ALLOWED ROLES
========================================================= */

export const USER_ROLES = {
  WASTE_GENERATOR: "waste_generator",
  COLLECTION_PARTNER: "collection_partner",
  MATERIAL_AGGREGATOR: "material_aggregator",
  RECOVERY_FACILITY: "recovery_facility",
  BUYER: "buyer",
  ADMIN: "admin",
};


/* =========================================================
   ROLE LABELS
========================================================= */

export const ROLE_LABELS = {
  waste_generator: "Waste Generator",
  collection_partner: "Collection Partner",
  material_aggregator: "Material Aggregator",
  recovery_facility: "Material Recovery Facility",
  buyer: "Buyer / Manufacturer",
  admin: "Administrator",
};


/* =========================================================
   PUBLIC REGISTRATION ROLES
   Admin is intentionally excluded.
========================================================= */

export const PUBLIC_REGISTRATION_ROLES = [
  {
    id: USER_ROLES.WASTE_GENERATOR,
    label: "Waste Generator",
  },
  {
    id: USER_ROLES.COLLECTION_PARTNER,
    label: "Collection Partner",
  },
  {
    id: USER_ROLES.MATERIAL_AGGREGATOR,
    label: "Material Aggregator",
  },
  {
    id: USER_ROLES.RECOVERY_FACILITY,
    label: "Material Recovery Facility",
  },
  {
    id: USER_ROLES.BUYER,
    label: "Buyer / Manufacturer",
  },
];


/* =========================================================
   COLLECTOR CODE GENERATOR
========================================================= */

function generateCollectorCode(uid) {
  const shortId = uid.replaceAll("-", "").slice(0, 8).toUpperCase();

  return `COL-${shortId}`;
}


/* =========================================================
   REGISTER USER
========================================================= */

export async function registerUser({
  email,
  password,
  fullName,
  organizationName = "",
  phone = "",
  role,
  preferredLanguage = "en",
  city = "",
  state = "",
}) {
  try {
    if (!email || !password || !fullName || !role) {
      throw new Error("Please fill all required fields.");
    }

    if (
      !PUBLIC_REGISTRATION_ROLES.some(
        (availableRole) => availableRole.id === role,
      )
    ) {
      throw new Error("Invalid registration role.");
    }

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

    const firebaseUser = userCredential.user;

    const userProfile = {
      uid: firebaseUser.uid,

      fullName: fullName.trim(),

      organizationName:
        organizationName?.trim() || "",

      email: firebaseUser.email,

      phone: phone?.trim() || "",

      role,

      preferredLanguage,

      city: city?.trim() || "",

      state: state?.trim() || "",

      profileImageUrl: "",

      verificationStatus: "pending",

      isActive: true,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp(),
    };


    /* =====================================================
       CREATE USER PROFILE
    ===================================================== */

    await setDoc(
      doc(db, "users", firebaseUser.uid),
      userProfile,
    );


    /* =====================================================
       CREATE COLLECTION PARTNER PROFILE
    ===================================================== */

    if (role === USER_ROLES.COLLECTION_PARTNER) {
      await setDoc(
        doc(db, "collectorProfiles", firebaseUser.uid),
        {
          collectorId: firebaseUser.uid,

          collectorCode:
            generateCollectorCode(firebaseUser.uid),

          fullName: fullName.trim(),

          phone: phone?.trim() || "",

          city: city?.trim() || "",

          verificationStatus: "pending",

          isPublic: true,

          totalCollections: 0,

          totalWeightCollected: 0,

          totalEarnings: 0,

          averageRating: 0,

          ratingCount: 0,

          completionRate: 0,

          createdAt: serverTimestamp(),

          updatedAt: serverTimestamp(),
        },
      );
    }


    return {
      success: true,

      user: {
        ...userProfile,

        uid: firebaseUser.uid,
      },
    };

  } catch (error) {

    console.error("Registration error:", error);

    let message =
      "Unable to create your account.";

    if (error.code === "auth/email-already-in-use") {
      message =
        "An account already exists with this email.";
    }

    if (error.code === "auth/invalid-email") {
      message =
        "Please enter a valid email address.";
    }

    if (error.code === "auth/weak-password") {
      message =
        "Password should contain at least 6 characters.";
    }

    if (error.message === "Please fill all required fields.") {
      message = error.message;
    }

    if (error.message === "Invalid registration role.") {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
}


/* =========================================================
   LOGIN USER
========================================================= */

export async function loginUser(
  email,
  password,
) {
  try {

    if (!email || !password) {
      throw new Error(
        "Email and password are required.",
      );
    }

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

    const firebaseUser =
      userCredential.user;


    /* =====================================================
       GET USER PROFILE
    ===================================================== */

    const profileRef =
      doc(
        db,
        "users",
        firebaseUser.uid,
      );

    const profileSnapshot =
      await getDoc(profileRef);


    if (!profileSnapshot.exists()) {

      await signOut(auth);

      return {
        success: false,
        message:
          "User profile was not found.",
      };
    }


    const profile =
      profileSnapshot.data();


    if (profile.isActive === false) {

      await signOut(auth);

      return {
        success: false,
        message:
          "This account has been disabled.",
      };
    }


    return {
      success: true,

      user: {
        uid: firebaseUser.uid,
        ...profile,
      },
    };

  } catch (error) {

    console.error(
      "Login error:",
      error,
    );

    let message =
      "Unable to login.";

    if (
      error.code ===
        "auth/invalid-credential" ||
      error.code ===
        "auth/wrong-password" ||
      error.code ===
        "auth/user-not-found"
    ) {

      message =
        "Invalid email or password.";
    }

    if (
      error.code ===
      "auth/invalid-email"
    ) {

      message =
        "Please enter a valid email address.";
    }

    if (
      error.code ===
      "auth/too-many-requests"
    ) {

      message =
        "Too many login attempts. Please try again later.";
    }

    if (
      error.message ===
      "Email and password are required."
    ) {

      message =
        error.message;
    }


    return {
      success: false,
      message,
    };
  }
}


/* =========================================================
   LOGOUT
========================================================= */

export async function logoutUser() {

  try {

    await signOut(auth);

    return {
      success: true,
    };

  } catch (error) {

    console.error(
      "Logout error:",
      error,
    );

    return {
      success: false,

      message:
        "Unable to logout.",
    };
  }
}


/* =========================================================
   GET USER PROFILE
========================================================= */

export async function getUserProfile(uid) {

  try {

    if (!uid) {
      return null;
    }

    const profileSnapshot =
      await getDoc(
        doc(
          db,
          "users",
          uid,
        ),
      );


    if (!profileSnapshot.exists()) {
      return null;
    }


    return {
      uid,
      ...profileSnapshot.data(),
    };

  } catch (error) {

    console.error(
      "Profile fetch error:",
      error,
    );

    return null;
  }
}


/* =========================================================
   AUTH STATE LISTENER
========================================================= */

export function observeAuthState(
  callback,
) {

  return onAuthStateChanged(
    auth,

    async (firebaseUser) => {

      if (!firebaseUser) {

        callback(null);

        return;
      }


      const profile =
        await getUserProfile(
          firebaseUser.uid,
        );


      callback(profile);
    },
  );
}