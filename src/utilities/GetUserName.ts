import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Fetches the name of a user from Firestore using their user ID.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the user's name or "Unknown" if not found.
 */
export const getUserNameFromId = async (userId: string): Promise<string> => {
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
