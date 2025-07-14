import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Firebase config
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

const logoutBtn = document.getElementById("admin-logout");
logoutBtn.onclick = () => signOut(auth).then(() => location.href = "login.html");

onAuthStateChanged(auth, async (user) => {
  if (!user || user.email !== "admin@bookmenow.com") {
    alert("Unauthorized access.");
    location.href = "login.html";
    return;
  }

  const snapshot = await getDocs(collection(db, "bookings"));
  const now = new Date();
  let upcoming = 0, past = 0;

  const tableBody = document.getElementById("booking-rows");
  tableBody.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const dt = new Date(`${data.date}T${data.time}`);
    if (dt > now) upcoming++; else past++;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.phone}</td>
      <td>${data.service}</td>
      <td>${data.date}</td>
      <td>${data.time}</td>
      <td><button class="delete-btn" data-id="${docSnap.id}">🗑️ Delete</button></td>
    `;
    tableBody.appendChild(row);
  });

  document.getElementById("total-bookings").textContent = snapshot.size;
  document.getElementById("upcoming-bookings").textContent = upcoming;
  document.getElementById("past-bookings").textContent = past;

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async () => {
      if (confirm("Are you sure to delete this booking?")) {
        await deleteDoc(doc(db, "bookings", btn.dataset.id));
        location.reload();
      }
    };
  });
});