import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const db = getFirestore();

/**
 * Get user data including username by UID
 * @param {string} uid - User UID
 * @returns {Promise<Object|null>} User data or null if not found
 */
export async function getUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

/**
 * Get UID by username
 * @param {string} username - Username to lookup
 * @returns {Promise<string|null>} UID or null if not found
 */
export async function getUIDByUsername(username) {
  try {
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    if (usernameDoc.exists()) {
      return usernameDoc.data().uid;
    }
    return null;
  } catch (error) {
    console.error("Error getting UID by username:", error);
    return null;
  }
}

/**
 * Get username by UID
 * @param {string} uid - User UID
 * @returns {Promise<string|null>} Username or null if not found
 */
export async function getUsernameByUID(uid) {
  try {
    const userData = await getUserData(uid);
    return userData ? userData.username : null;
  } catch (error) {
    console.error("Error getting username by UID:", error);
    return null;
  }
}

/**
 * Check if username exists
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if username exists
 */
export async function usernameExists(username) {
  try {
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    return usernameDoc.exists();
  } catch (error) {
    console.error("Error checking username existence:", error);
    return true; // Assume it exists on error for safety
  }
}

/**
 * Format display name from user data
 * @param {Object} userData - User data object
 * @returns {string} Formatted display name
 */
export function formatDisplayName(userData) {
  if (!userData) return 'User';
  
  if (userData.displayName && userData.displayName.trim()) {
    return userData.displayName;
  }
  
  if (userData.username) {
    return `@${userData.username}`;
  }
  
  if (userData.email) {
    return userData.email.split('@')[0];
  }
  
  return 'User';
}

/**
 * Get user avatar initials from username or email
 * @param {Object} userData - User data object
 * @returns {string} Initials for avatar
 */
export function getUserInitials(userData) {
  if (!userData) return 'U';
  
  if (userData.displayName && userData.displayName.trim()) {
    const names = userData.displayName.trim().split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  }
  
  if (userData.username) {
    return userData.username.substring(0, 2).toUpperCase();
  }
  
  if (userData.email) {
    return userData.email.substring(0, 2).toUpperCase();
  }
  
  return 'U';
}