// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmeipVXF09s9Y9TLDMefIroUWcX4KOw-k",
  authDomain: "sampleportfolio-9450c.firebaseapp.com",
  projectId: "sampleportfolio-9450c",
  storageBucket: "sampleportfolio-9450c.appspot.com",
  messagingSenderId: "725347523572",
  appId: "1:725347523572:web:203fa6c32aa6254f02b7a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Inject login/logout button
export function handleAuthUI() {
  const slot = document.getElementById("auth-button-slot");
  if (!slot) return;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      slot.innerHTML = `<button id="logout-btn" class="logout-btn">Logout</button>`;
      document.getElementById("logout-btn").addEventListener("click", () => {
        signOut(auth).then(() => location.href = "login.html");
      });
    } else {
      slot.innerHTML = `<a href="login.html" class="btn">Login</a>`;
    }
  });
}

// Optional protection function for restricted pages
export function redirectIfNotLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}