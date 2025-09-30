import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase"

/**
 * Checks if a user exists in Firestore users collection.
 * Clears localStorage if user does not exist.
 * @param userUid - The UID of the user to check
 * @returns boolean - true if user exists, false otherwise
 */
const checkUserExists = async (userUid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userUid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) {
      // User does not exist, clear localStorage
      localStorage.clear()
      console.warn("User does not exist. localStorage cleared.")
      return false
    }

    return true
  } catch (err) {
    console.error("Error checking user:", err)
    // On error, also clear localStorage for safety
    localStorage.clear()
    return false
  }
}

export default checkUserExists
