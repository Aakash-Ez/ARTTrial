import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

// Firebase Error Handling
const handleFirebaseError = (error) => {
  let errorMessage;
  switch (error.code) {
    case "auth/email-already-in-use":
      errorMessage = "This email is already in use. Please use a different email.";
      break;
    case "auth/invalid-email":
      errorMessage = "The email address is invalid. Please enter a valid email.";
      break;
    case "auth/weak-password":
      errorMessage = "The password is too weak. Please enter a stronger password.";
      break;
    case "auth/user-not-found":
      errorMessage = "No user found with this email. Please check the email or sign up first.";
      break;
    case "auth/wrong-password":
      errorMessage = "Incorrect password. Please try again.";
      break;
    default:
      errorMessage = "An unexpected error occurred. Please try again later.";
  }
  return errorMessage;
};

// Upload photo to Google Drive (Firebase Storage) and return the URL
export const uploadPhotoToStorage = async (photoBase64, filename, foldername) => {
  try {
    // Convert Base64 to Blob
    const blob = base64ToBlob(photoBase64);

    const storageRef = ref(storage, `${foldername}/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading photo:", error);
    return null;
  }
};

// Helper function to convert Base64 to Blob
const base64ToBlob = (base64String) => {
  const byteCharacters = atob(base64String.split(',')[1]); // Remove the "data:image/png;base64," part
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: "image/png" });
};


// Register user
export const registerUser = async (email, password, additionalData, photo) => {
  try {
    await setPersistence(auth, browserLocalPersistence); // Set session to persist

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let photoURL = null;
    console.log(photo);
    if (photo) {
      photoURL = await uploadPhotoToStorage(photo, user.email, "profile_pictures");
      console.log(photoURL);
    }

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      photoURL,
      ...additionalData,
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.log(error);
    const errorMessage = handleFirebaseError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Fetch the current user's information from Firestore
export const getCurrentUserInfo = async () => {
  try {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;

    if (!currentUser) {
      return new Promise((resolve) => {
        onAuthStateChanged(authInstance, async (user) => {
          if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              resolve({ ...userDoc.data(), uid: user.uid });
            } else {
              console.error("User document not found in Firestore.");
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
    }

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists()) {
      return { ...userDoc.data(), uid: currentUser.uid };
    } else {
      console.error("User document not found in Firestore.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching current user info:", error);
    throw error;
  }
};

export const getUserNameFromId = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data().name || "Unknown";
    }
  } catch (error) {
    console.error("Error fetching user name:", error);
  }
  return "Unknown";
};

export async function fetchPicture(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return imageUrl;
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    return null;
  }
}