import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

// Username validation state
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
  usernameStatus.style.opacity = '0';
  
  setTimeout(() => {
    usernameStatus.textContent = message;
    usernameStatus.className = `username-status ${className} show`;
    
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

// Username input event handler with real-time validation
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
    showFeedback('3-20 characters, letters & numbers only', 'username-invalid');
    usernameInput.classList.add('invalid');
    updateSubmitButton();
    return;
  }
  
  isUsernameValid = true;
  
  // Show checking status with loading animation
  showFeedback('Checking availability...', 'username-checking');
  
  // Debounced username availability check
  usernameCheckTimeout = setTimeout(async () => {
    try {
      const available = await checkUsernameAvailability(username);
      // 'Username available', 'username-available'
      if (available) {
        showFeedback('Username available', 'username-available');
        usernameInput.classList.remove('invalid');
        usernameInput.classList.add('valid');
        isUsernameAvailable = true;
      } else {
        showFeedback('Username already taken', 'username-taken');
        usernameInput.classList.remove('valid');
        usernameInput.classList.add('invalid');
        isUsernameAvailable = false;
      }
    } catch (error) {
      showFeedback('Error checking username', 'username-invalid');
      usernameInput.classList.remove('valid');
      usernameInput.classList.add('invalid');
      isUsernameAvailable = false;
    }
    
    updateSubmitButton();
  }, 800); // Increased delay for better UX
});

// Focus/blur effects for better UX
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
  
  if (canSubmit) {
    submit.style.opacity = '1';
    submit.style.cursor = 'pointer';
  } else {
    submit.style.cursor = 'not-allowed';
  }
}

// Form submission handler with complete validation
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmpass').value;

  // Comprehensive validation
  if (!email || !username || !password || !confirmPassword) {
    alert("All fields are required!");
    return;
  }

  if (!isUsernameValid || !isUsernameAvailable) {
    alert("Please choose a valid and available username!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address!");
    return;
  }

  // Disable submit button and show loading
  submit.disabled = true;
  submit.textContent = 'Creating Account...';
  submit.style.opacity = '0.6';

  try {
    // Final username availability check
    console.log("Final username check...");
    const isStillAvailable = await checkUsernameAvailability(username);
    if (!isStillAvailable) {
      throw new Error("Username was taken by another user during registration!");
    }

    // Create user account
    console.log("Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ User account created:", user.uid);

    // Save user data to Firestore
    console.log("Saving user data...");
    
    // Save username document (for uniqueness tracking)
    await setDoc(doc(db, "usernames", username.toLowerCase()), {
      uid: user.uid,
      username: username, // Store original case
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("✅ Username document saved");

    // Save user profile document
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      username: username,
      displayName: username, // Can be changed later
      createdAt: new Date(),
      updatedAt: new Date(),
      profileComplete: false, // For future profile completion
      isActive: true
    });
    console.log("✅ User profile document saved");

    // Success notification
    alert("🎉 Account created successfully!");
    
    // Redirect to sign in page
    window.location.href = "index.html";

  } catch (error) {
    console.error("Registration error:", error);
    
    let errorMessage = "Failed to create account! ";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += "This email is already registered.";
        break;
      case 'auth/invalid-email':
        errorMessage += "Invalid email format.";
        break;
      case 'auth/weak-password':
        errorMessage += "Password is too weak.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "Network error. Please check your connection.";
        break;
      case 'auth/too-many-requests':
        errorMessage += "Too many attempts. Please try again later.";
        break;
      default:
        errorMessage += error.message;
    }

    alert(errorMessage);
  } finally {
    // Re-enable submit button
    submit.disabled = false;
    submit.textContent = 'Sign Up';
    updateSubmitButton();
  }
});

// Password confirmation validation
document.getElementById('confirmpass').addEventListener('input', function() {
  const password = document.getElementById('password').value;
  const confirmPassword = this.value;
  
  if (confirmPassword && password !== confirmPassword) {
    this.style.borderColor = '#ef4444';
  } else if (confirmPassword && password === confirmPassword) {
    this.style.borderColor = '#22c55e';
  } else {
    this.style.borderColor = '';
  }
});

// Initialize submit button state
updateSubmitButton();

// Test function (remove this in production)
window.testMinimalSignup = async function() {
  try {
    console.log("Starting minimal signup test...");
    
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = "password123";
    const testUsername = `user${Date.now()}`;
    
    console.log("Step 1: Testing basic Firestore write (before auth)...");
    try {
      await setDoc(doc(db, "test", "testdoc"), {
        message: "Hello World",
        timestamp: new Date()
      });
      console.log("✅ Basic Firestore write successful");
    } catch (error) {
      console.error("❌ Basic Firestore write failed:", error);
      return;
    }
    
    console.log("Step 2: Creating user account...");
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log("✅ User account created:", user.uid);
    
    console.log("Step 3: Writing user data to Firestore...");
    await setDoc(doc(db, "users", user.uid), {
      email: testEmail,
      username: testUsername,
      createdAt: new Date()
    });
    console.log("✅ User data written to Firestore");
    
    console.log("Step 4: Writing username data to Firestore...");
    await setDoc(doc(db, "usernames", testUsername.toLowerCase()), {
      uid: user.uid,
      createdAt: new Date()
    });
    console.log("✅ Username data written to Firestore");
    
    console.log("🎉 All tests passed!");
    alert("Test successful! Check console for details.");
    
  } catch (error) {
    console.error("❌ Test failed at step:", error);
    alert(`Test failed: ${error.message}`);
  }
};