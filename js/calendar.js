// — Custom Calendar Logic —
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const weekdaysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let currentDate = new Date();
  let selectedDate = null;
  let isAnimating = false;
  let activeInput = null;
  let workingSchedule = {};
  let holidayDates = [];

  const calendar = document.getElementById("waleedcalendar");

  // Fetch working schedule from Firestore with debugging
  async function fetchWorkingSchedule() {
    try {
      const docRef = doc(db, "adminSettings", "workingSchedule");
      const docSnap = await getDoc(docRef);
      workingSchedule = docSnap.exists() ? docSnap.data() : {};
      
      console.log("Fetched schedule data:", workingSchedule);
      console.log("Friday availability:", workingSchedule["Fri"]?.enabled);
      
      return true;
    } catch (error) {
      console.error("Error fetching working schedule:", error);
      workingSchedule = {};
      return false;
    }
  }

  async function fetchHolidays() {
    const docRef = doc(db, "adminSettings", "holidays");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().dates || []; // array of strings like "2025-07-25"
    }
    return [];
  }

  // Format date as YYYY-MM-DD (UTC date to avoid timezone issues)
  function formatDate(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const year = utcDate.getUTCFullYear();
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Get day name (Sun, Mon, etc.) from date
  function getDayName(date) {
    return weekdaysFull[date.getDay()];
  }

  // Handle day selection
  function handleDayClick(dayEl, dateObj) {
  calendar.querySelectorAll(".calendar-day.selected").forEach(el => {
    el.classList.remove("selected");
  });

  dayEl.classList.add("selected");

  // Use UTC date to avoid timezone shifting
  const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
  const selectedDate = formatDate(utcDate); // Make sure this is declared with `const`

  if (activeInput) {
    activeInput.value = selectedDate;
  }

  // 🔥 Dispatch the custom event here
  const event = new CustomEvent("dateSelected", {
    detail: { selectedDate }
  });
  document.dispatchEvent(event);

  hideCalendar();
}
  async function renderCalendar(year, month, direction = null) {
    if (isAnimating) return;

    // Refresh the working schedule before rendering
    await fetchWorkingSchedule();
    holidayDates = await fetchHolidays();

    const newCalendar = document.createElement("div");
    newCalendar.className = "calendarwaleed calendar-content";
    
    // Calendar Header
    const header = document.createElement("div");
    header.className = "calendar-header";

    // Navigation Buttons
    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "calendar-nav-btn";
    prevBtn.innerHTML = "&#8249;";
    prevBtn.title = "Previous Month";
    prevBtn.disabled = year === new Date().getFullYear() && month === new Date().getMonth();
    prevBtn.onclick = () => {
      if (isAnimating) return;
      const newMonth = month === 0 ? 11 : month - 1;
      const newYear = month === 0 ? year - 1 : year;
      renderCalendar(newYear, newMonth, "left");
    };

    const monthYear = document.createElement("div");
    monthYear.textContent = `${new Date(year, month).toLocaleString("default", {
      month: "long",
    })} ${year}`;

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "calendar-nav-btn";
    nextBtn.innerHTML = "&#8250;";
    nextBtn.title = "Next Month";
    nextBtn.onclick = () => {
      if (isAnimating) return;
      const newMonth = month === 11 ? 0 : month + 1;
      const newYear = month === 11 ? year + 1 : year;
      renderCalendar(newYear, newMonth, "right");
    };

    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = "calendar-today-btn";
    todayBtn.textContent = "Today";
    todayBtn.onclick = () => {
      if (isAnimating) return;
      const now = new Date();
      currentDate = new Date(now);
      renderCalendar(now.getFullYear(), now.getMonth(), "down");
    };

    header.append(prevBtn, monthYear, nextBtn, todayBtn);
    newCalendar.appendChild(header);

    // Calendar Grid
    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    // Weekday Headers
    weekdaysShort.forEach((shortDay) => {
      const wd = document.createElement("div");
      wd.className = "calendar-day-name";
      wd.textContent = shortDay;
      grid.appendChild(wd);
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Blank days for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      const blank = document.createElement("div");
      blank.className = "calendar-day disabled";
      grid.appendChild(blank);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create day elements with strict availability checks
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);

      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = day;

      // Use UTC date for comparisons to avoid timezone issues
      const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
      const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      
      const isToday = utcDate.getTime() === utcToday.getTime();
      const isInPast = utcDate < utcToday;
      const dateStr = formatDate(utcDate);
      const isSelected = selectedDate === dateStr;
      const dayName = getDayName(dateObj);
      const isHoliday = holidayDates.includes(dateStr);
      
      // STRICT AVAILABILITY CHECK - Only enabled if explicitly true
      const dayData = workingSchedule[dayName] || {};
      const isDayEnabled = dayData.enabled === true;
      
      console.log(`Day: ${dayName}, Date: ${dateStr}, Enabled: ${isDayEnabled}, Holiday: ${isHoliday}`);

      if (isInPast || !isDayEnabled || isHoliday) {
        dayEl.classList.add("disabled");
        if (!isInPast) {
          if (isHoliday) {
            dayEl.title = "Holiday – Not bookable";
          } else if (!isDayEnabled) {
            dayEl.title = "Not available for booking";
          }
        }
      } else {
        if (isToday) dayEl.classList.add("today");
        if (isSelected) dayEl.classList.add("selected");
        dayEl.onclick = () => handleDayClick(dayEl, dateObj);
      }
      grid.appendChild(dayEl);
    }

    newCalendar.appendChild(grid);

    // Animation Handling
    const oldCalendar = calendar.querySelector(".calendar-content");

    if (oldCalendar && direction) {
      isAnimating = true;
      oldCalendar.classList.remove("slide-left-out", "slide-right-out");
      newCalendar.classList.remove("slide-left-in", "slide-right-in");

      oldCalendar.classList.add(
        direction === "left" ? "slide-right-out" : "slide-left-out"
      );
      newCalendar.classList.add(
        direction === "left" ? "slide-right-in" : "slide-left-in"
      );

      calendar.appendChild(newCalendar);

      const handleAnimationEnd = () => {
        if (oldCalendar.parentNode) {
          calendar.removeChild(oldCalendar);
        }
        isAnimating = false;
      };

      oldCalendar.addEventListener("animationend", handleAnimationEnd, { once: true });

      setTimeout(() => {
        if (isAnimating) {
          if (oldCalendar.parentNode) {
            calendar.removeChild(oldCalendar);
          }
          isAnimating = false;
        }
      }, 500);
    } else {
      calendar.innerHTML = "";
      calendar.appendChild(newCalendar);
    }
  }

  // Rest of your code remains the same...
  function showCalendar() {
  if (!activeInput) return;

  const rect = activeInput.getBoundingClientRect();
  const offset = 1; // space between input and calendar

  calendar.style.position = "absolute";
  calendar.style.left = `${rect.left + window.scrollX}px`;
  calendar.style.top = `${rect.bottom + window.scrollY + offset}px`;
  calendar.style.zIndex = 9999;
  calendar.style.display = "block";
  calendar.classList.remove("slide-out");
  calendar.classList.add("slide-in");
}

  function hideCalendar() {
    calendar.classList.remove("slide-in");
    calendar.classList.add("slide-out");
    calendar.addEventListener("animationend", () => {
      if (calendar.classList.contains("slide-out")) {
        calendar.style.display = "none";
      }
    }, { once: true });
  }

  // Initialize calendar
  function initCalendar() {
    document.querySelectorAll(".date-input").forEach((input) => {
      input.addEventListener("click", (e) => {
        activeInput = e.target;
        showCalendar();
      });

      input.addEventListener("keydown", (e) => {
        e.preventDefault();
      });
    });

    document.addEventListener("mousedown", (e) => {
      if (!calendar.contains(e.target) && !e.target.classList.contains("date-input")) {
        hideCalendar();
      }
    });

    // Initial render
    const now = new Date();
    renderCalendar(now.getFullYear(), now.getMonth());
  }

  // Start the calendar
  initCalendar();
});