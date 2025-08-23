import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

// Check if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});


// Get form elements
const submit = document.getElementById('submit');
const form = document.getElementById('loginForm');

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  if (!email || !password) {
    alert("Email dan password harus diisi!");
    return;
  }

  try {
    // Show loading state
    submit.disabled = true;
    submit.textContent = 'Masuk...';
    
    // Sign in user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("User logged in:", userData.username);
    }

    // Redirect to main page
    window.location.href = "index.html";

  } catch (error) {
    // Reset button state
    submit.disabled = false;
    submit.textContent = 'Sign In';
    
    const errorCode = error.code;
    let errorMessage = "Gagal masuk! ";

    switch (errorCode) {
      case 'auth/user-not-found':
        errorMessage += "Email tidak terdaftar.";
        break;
      case 'auth/wrong-password':
        errorMessage += "Password salah.";
        break;
      case 'auth/invalid-email':
        errorMessage += "Format email tidak valid.";
        break;
      case 'auth/too-many-requests':
        errorMessage += "Terlalu banyak percobaan login. Silakan coba lagi nanti.";
        break;
      case 'auth/network-request-failed':
        errorMessage += "Gagal terhubung ke server.";
        break;
      default:
        errorMessage += error.message;
    }

    alert(errorMessage);
    console.error("Login error:", error);
  }
});
