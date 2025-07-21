document.querySelectorAll('.custom-time-picker').forEach(input => {
  input.addEventListener('click', () => createTimePicker(input));
});

function createTimePicker(input) {
  document.querySelectorAll(".time-picker-popup, .time-picker-overlay").forEach(e => e.remove());

  const overlay = document.createElement("div");
  overlay.className = "time-picker-overlay";

  const popup = document.createElement("div");
  popup.className = "time-picker-popup";

  const wheelsContainer = document.createElement("div");
  wheelsContainer.className = "wheels-container";

  const highlight = document.createElement("div");
  highlight.className = "highlight-bar";

  popup.append(wheelsContainer, highlight);

  const createWheel = (values, className) => {
    const wheel = document.createElement("div");
    wheel.className = `time-wheel ${className}`;

    const topSpacer = document.createElement("div");
    topSpacer.className = "spacer";
    wheel.appendChild(topSpacer);

    values.forEach(val => {
      const item = document.createElement("div");
      item.className = "wheel-item";
      item.textContent = val.toString().padStart(2, "0");
      wheel.appendChild(item);
    });

    const bottomSpacer = document.createElement("div");
    bottomSpacer.className = "spacer";
    wheel.appendChild(bottomSpacer);

    return wheel;
  };

  const hourWheel = createWheel([...Array(12).keys()].map(i => i + 1), "hour");
  const minuteWheel = createWheel([...Array(12).keys()].map(i => (i * 5).toString().padStart(2, "0")), "minute");
  const ampmWheel = createWheel(["AM", "PM"], "ampm");

  function selectItemInWheel(wheel, target) {
    const items = wheel.querySelectorAll(".wheel-item");
    const isAMPM = target.toString().toUpperCase() === "AM" || target.toString().toUpperCase() === "PM";
    const normalizedTarget = isAMPM
      ? target.toString().trim().toUpperCase()
      : target.toString().padStart(2, "0").trim().toUpperCase();

    items.forEach(item => {
      let itemText = item.textContent.trim().toUpperCase();
      if (!isAMPM) itemText = itemText.padStart(2, "0");

      if (itemText === normalizedTarget) {
        item.classList.add("selected");
        animateSelection(item);
      } else {
        item.classList.remove("selected");
      }
    });
  }

  const scrollToValue = (wheel, target) => {
    const items = wheel.querySelectorAll(".wheel-item");

    const isAMPM = target.toString().toUpperCase() === "AM" || target.toString().toUpperCase() === "PM";
    const normalizedTarget = isAMPM
      ? target.toString().trim().toUpperCase()
      : target.toString().padStart(2, "0").trim().toUpperCase();

    items.forEach((item, i) => {
      let itemText = item.textContent.trim().toUpperCase();
      if (!isAMPM) itemText = itemText.padStart(2, "0");

      if (itemText === normalizedTarget) {
        wheel.scrollTo({ top: i * 50, behavior: "smooth" });
      }
    });
  };

  if (input.value) {
    const match = input.value.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (match) {
      const [_, hourStr, minuteStr, ampmStr] = match;
      const hour = parseInt(hourStr, 10);
      const minuteRounded = roundToNearestFive(parseInt(minuteStr, 10)).toString().padStart(2, '0');
      const ampm = ampmStr.toUpperCase();

      requestAnimationFrame(() => {
        scrollToValue(hourWheel, hour);
        scrollToValue(minuteWheel, minuteRounded);
        scrollToValue(ampmWheel, ampm);

        selectItemInWheel(hourWheel, hour);
        selectItemInWheel(minuteWheel, minuteRounded);
        selectItemInWheel(ampmWheel, ampm);
      });
    }
  }

  wheelsContainer.append(hourWheel, minuteWheel, ampmWheel);
  document.body.append(popup, overlay);

  const updateSelection = (wheel) => {
    const index = Math.round(wheel.scrollTop / 50);
    const items = wheel.querySelectorAll(".wheel-item");
    items.forEach((item, i) => {
      const selected = i === index;
      item.classList.toggle("selected", selected);
      if (selected) animateSelection(item);
    });
    wheel.scrollTo({ top: index * 50, behavior: "smooth" });
  };

  [hourWheel, minuteWheel, ampmWheel].forEach(wheel => {
    wheel.addEventListener("scroll", () => {
      clearTimeout(wheel._scrollTimeout);
      wheel._scrollTimeout = setTimeout(() => updateSelection(wheel), 120);
    });

    wheel.addEventListener("wheel", e => {
      e.preventDefault();
      wheel.scrollTop += e.deltaY;
    }, { passive: false });

    wheel.addEventListener("touchend", () => updateSelection(wheel));
    wheel.addEventListener("mouseup", () => updateSelection(wheel));
  });

  const getSelectedValue = (wheel) => {
    const index = Math.round(wheel.scrollTop / 50);
    const items = wheel.querySelectorAll(".wheel-item");
    return items[index]?.textContent || "";
  };

  const rect = input.getBoundingClientRect();
  popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  overlay.addEventListener("click", () => {
    input.value = `${getSelectedValue(hourWheel)}:${getSelectedValue(minuteWheel)} ${getSelectedValue(ampmWheel)}`;
    popup.remove();
    overlay.remove();
  });
}

function animateSelection(item) {
  item.style.transition = "transform 0.1s ease";
  item.style.transform = "scale(1.35)";
  setTimeout(() => {
    item.style.transform = "scale(1.2)";
  }, 100);
}

function roundToNearestFive(minute) {
  return Math.round(minute / 5) * 5;
}