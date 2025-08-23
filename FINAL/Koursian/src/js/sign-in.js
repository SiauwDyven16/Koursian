import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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
const form = document.getElementById('sign-upForm');


form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validation
  if (!email || !password || !confirmPassword) {
    alert("Semua field harus diisi!");
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

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      createdAt: new Date(),
      uid: user.uid
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
  }
});