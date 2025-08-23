import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAD9PuaSWK6-rK1B0VKIrY1dgQsK6CevNk",
  authDomain: "website-mapel-digital.firebaseapp.com",
  projectId: "website-mapel-digital",
  storageBucket: "website-mapel-digital.firebasestorage.app",
  messagingSenderId: "237511903481",
  appId: "1:237511903481:web:50105212d92efdfc6aba28",
  measurementId: "G-TTZQ3NTRZ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// // Check if user is already logged in
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     window.location.href = "index.html";
//   }
// });

// Get form elements
const submit = document.getElementById('submit');
const form = document.getElementById('sign-upForm');
const usernameInput = document.getElementById('username');
const usernameStatus = document.getElementById('usernameStatus');

// Username validation
let usernameCheckTimeout;
let isUsernameValid = false;
let isUsernameAvailable = false;

// Function to check username format
function isValidUsernameFormat(username) {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username) && username.length >= 3 && username.length <= 20;
}

// Function to check username availability
async function checkUsernameAvailability(username) {
  try {
    const usernameDoc = await getDoc(doc(db, "usernames", username.toLowerCase()));
    return !usernameDoc.exists();
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
}

// Function to show feedback with smooth transition
function showFeedback(message, className) {
  // Smooth transition tanpa mengubah layout
  usernameStatus.style.opacity = '0';
  
  setTimeout(() => {
    usernameStatus.textContent = message;
    usernameStatus.className = `username-status ${className} show`;
    
    // Smooth fade in
    setTimeout(() => {
      usernameStatus.style.opacity = '1';
    }, 10);
  }, 150);
}

// Function to hide feedback
function hideFeedback() {
  usernameStatus.style.opacity = '0';
  setTimeout(() => {
    usernameStatus.textContent = '';
    usernameStatus.className = 'username-status';
  }, 150);
}

// Username input event handler
usernameInput.addEventListener('input', function() {
  const username = this.value.trim();
  
  // Clear previous timeout
  clearTimeout(usernameCheckTimeout);
  
  // Reset states
  isUsernameValid = false;
  isUsernameAvailable = false;
  
  // Remove validation classes
  usernameInput.classList.remove('valid', 'invalid');
  
  if (username.length === 0) {
    hideFeedback();
    updateSubmitButton();
    return;
  }
  
  // Check format first
  if (!isValidUsernameFormat(username)) {
    showFeedback('Invalid format. Use only letters, numbers, and underscores.', 'username-invalid');
    usernameInput.classList.add('invalid');
    updateSubmitButton();
    return;
  }
  
  isUsernameValid = true;
  
  // Show checking status with loading animation
  showFeedback('Checking username...', 'username-checking');
  
  // username check
  usernameCheckTimeout = setTimeout(async () => {
    try {
      const available = await checkUsernameAvailability(username);
      
      if (available) {
        showFeedback('Username available!', 'username-available');
        usernameInput.classList.add('valid');
        isUsernameAvailable = true;
      } else {
        showFeedback('Username already taken.', 'username-taken');
        usernameInput.classList.add('invalid');
        isUsernameAvailable = false;
      }
    } catch (error) {
      showFeedback('Error checking username.', 'username-invalid');
      usernameInput.classList.add('invalid');
      isUsernameAvailable = false;
    }
    
    updateSubmitButton();
  }, 500); // Increased delay for better UX
});

// Add focus/blur effects for better UX
usernameInput.addEventListener('focus', function() {
  if (this.value.trim().length > 0) {
    usernameStatus.classList.add('show');
  }
});

usernameInput.addEventListener('blur', function() {
  if (this.value.trim().length === 0) {
    hideFeedback();
  }
});

// Function to update submit button state
function updateSubmitButton() {
  const canSubmit = isUsernameValid && isUsernameAvailable;
  submit.disabled = !canSubmit;
}

// Form submission handler
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmpass').value;

  // Validation
  if (!email || !username || !password || !confirmPassword) {
    alert("Semua field harus diisi!");
    return;
  }

  if (!isUsernameValid || !isUsernameAvailable) {
    alert("Username tidak valid atau sudah digunakan!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Password dan konfirmasi password tidak cocok!");
    return;
  }

  if (password.length < 6) {
    alert("Password minimal 6 karakter!");
    return;
  }

  // Disable submit button during registration
  submit.disabled = true;
  submit.textContent = 'Creating Account...';

  try {
    // Use transaction to ensure username uniqueness
    await runTransaction(db, async (transaction) => {
      const usernameRef = doc(db, "usernames", username.toLowerCase());
      const usernameDoc = await transaction.get(usernameRef);
      
      if (usernameDoc.exists()) {
        throw new Error("Username sudah digunakan oleh user lain!");
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Set username document
      transaction.set(usernameRef, {
        uid: user.uid,
        createdAt: new Date()
      });

      // Set user document
      const userRef = doc(db, "users", user.uid);
      transaction.set(userRef, {
        email: email,
        username: username,
        displayName: username, // You can modify this later
        createdAt: new Date(),
        uid: user.uid
      });
    });

    alert("Berhasil mendaftar! Silakan login.");
    window.location.href = "sign-in.html";

  } catch (error) {
    const errorCode = error.code;
    let errorMessage = "Gagal mendaftar! ";

    switch (errorCode) {
      case 'auth/email-already-in-use':
        errorMessage += "Email sudah terdaftar.";
        break;
      case 'auth/invalid-email':
        errorMessage += "Format email tidak valid.";
        break;
      case 'auth/weak-password':
        errorMessage += "Password terlalu lemah.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "Gagal terhubung ke server.";
        break;
      default:
        errorMessage += error.message;
    }

    alert(errorMessage);
    console.error("Registration error:", error);
  } finally {
    // Re-enable submit button
    submit.disabled = false;
    submit.textContent = 'Sign Up';
  }
});

// Initial submit button state
updateSubmitButton();