// ==== HAMBURGER MENU TOGGLE ====
document.getElementById("hamburger")?.addEventListener("click", () => {
  const navLinks = document.getElementById("nav-links");
  const hamburgerIcon = document.getElementById("hamburger");

  navLinks.classList.toggle("show");
  hamburgerIcon.classList.toggle("open");
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmeipVXF09s9Y9TLDMefIroUWcX4KOw-k",
  authDomain: "sampleportfolio-9450c.firebaseapp.com",
  projectId: "sampleportfolio-9450c",
  storageBucket: "sampleportfolio-9450c.appspot.com",
  messagingSenderId: "725347523572",
  appId: "1:725347523572:web:203fa6c32aa6254f02b7a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==== BANNER LOADER ====
async function loadBanner() {
  try {
    const ref = doc(db, "adminSettings", "announcement");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data.enabled && data.message?.trim()) {
        const banner = document.getElementById("announcement-banner");
        banner.style.display = "block";
        banner.innerHTML = `<span class="flashing-text">${data.message}</span>`;
      }
    }
  } catch (err) {
    console.error("❌ Failed to load banner:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadBanner);