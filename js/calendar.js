// --- Custom Calendar Logic ---

document.addEventListener("DOMContentLoaded", () => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let currentDate = new Date(); // today initially
  let selectedDate = null;
  let isAnimating = false;

  const dateInput = document.getElementById("date-input");
  const calendar = document.getElementById("calendar");

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function renderCalendar(year, month, direction = null) {
    if (isAnimating) return;

    const newCalendar = document.createElement("div");
    newCalendar.className = "calendar-popup calendar-content";

    // --- Header ---
    const header = document.createElement("div");
    header.className = "calendar-header";

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

    const monthYear = document.createElement("div");
    monthYear.textContent = `${new Date(year, month).toLocaleString("default", {
      month: "long",
    })} ${year}`;

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

    // --- Grid ---
    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    weekdays.forEach((d) => {
      const wd = document.createElement("div");
      wd.className = "calendar-day-name";
      wd.textContent = d;
      grid.appendChild(wd);
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    for (let i = 0; i < firstDayIndex; i++) {
      const blank = document.createElement("div");
      blank.className = "calendar-day disabled";
      grid.appendChild(blank);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0);

      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = day;

      const isToday = dateObj.getTime() === today.getTime();
      const isInPast = dateObj < today;
      const isSelected = selectedDate === formatDate(dateObj);

      if (isInPast) {
        dayEl.classList.add("disabled");
      } else {
        if (isToday) dayEl.classList.add("today");
        if (isSelected) dayEl.classList.add("selected");
        dayEl.onclick = () => {
          calendar.querySelectorAll(".calendar-day.selected").forEach((el) =>
            el.classList.remove("selected")
          );
          dayEl.classList.add("selected");
          selectedDate = formatDate(dateObj);
          dateInput.value = selectedDate;
          if (typeof updateTimeSlotsForDate === "function") {
            updateTimeSlotsForDate(selectedDate);
          }
          hideCalendar();
        };
      }

      grid.appendChild(dayEl);
    }

    newCalendar.appendChild(grid);

    // --- Animation Handling ---
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

  function showCalendar() {
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

  dateInput.addEventListener("click", () => {
    if (calendar.style.display === "block") hideCalendar();
    else showCalendar();
  });

  document.addEventListener("mousedown", (e) => {
    if (!calendar.contains(e.target) && e.target !== dateInput) {
      hideCalendar();
    }
  });

  dateInput.addEventListener("keydown", (e) => {
    e.preventDefault();
  });

  const now = new Date();
  renderCalendar(now.getFullYear(), now.getMonth());
});