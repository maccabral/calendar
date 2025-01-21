const monthYear = document.getElementById("month-year");
const calendarBody = document.getElementById("calendar-body");
const eventTitle = document.getElementById("event-title");
const eventStart = document.getElementById("event-start");
const eventEnd = document.getElementById("event-end");
const weekdayOptions = document.getElementById("weekday-options");

[eventStart, eventEnd].forEach((input) => {
  input.addEventListener("focus", () => input.showPicker());
  input.addEventListener("click", () => input.showPicker());
});

function showWeekdayOptions() {
  if (eventStart.value && eventEnd.value) {
    weekdayOptions.classList.remove("hidden");
  } else {
    weekdayOptions.classList.add("hidden");
  }
}

let currentYear = 2025;
let currentMonth = 0;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let events = [];

// Function to add event based on selected days
function addEvent() {
  const selectedDays = [...document.querySelectorAll(".checkbox-grid input:checked")].map(el => el.value);
  if (eventTitle.value && eventStart.value && eventEnd.value && selectedDays.length > 0) {
    let startDate = new Date(eventStart.value);
    let endDate = new Date(eventEnd.value);

    while (startDate <= endDate) {
      let dayOfWeek = startDate.toLocaleDateString("en-US", { weekday: "long" });
      if (selectedDays.includes(dayOfWeek)) {
        events.push({
          id: Date.now(),
          title: eventTitle.value,
          date: startDate.toISOString().split("T")[0],
          day: dayOfWeek
        });
      }
      startDate.setDate(startDate.getDate() + 1);
    }
    renderCalendar(currentYear, currentMonth);
    eventTitle.value = "";
    eventStart.value = "";
    eventEnd.value = "";
    weekdayOptions.classList.add("hidden");
  } else {
    alert("Please fill all fields and select at least one day.");
  }
}

function renderCalendar(year, month) {
  monthYear.textContent = `${months[month]} ${year}`;
  calendarBody.innerHTML = "";

  let firstDay = new Date(year, month, 1).getDay();
  let daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarBody.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    let dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");
    dayDiv.textContent = day;

    let dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    let dayEvents = events.filter((event) => event.date === dateString);
    dayEvents.forEach((event) => {
      let eventElement = document.createElement("div");
      eventElement.classList.add("event");
      eventElement.textContent = event.title;
      eventElement.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteEvent(event.id);
      });
      dayDiv.appendChild(eventElement);
    });

    dayDiv.addEventListener("click", () => showEventDialog(dateString));
    calendarBody.appendChild(dayDiv);
  }
}

function showEventDialog(date) {
  let dayEvents = events.filter((event) => event.date === date);
  if (dayEvents.length > 0) {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "";

    dayEvents.forEach((event) => {
      let li = document.createElement("li");
      li.innerHTML = `${event.title} <button onclick="deleteEvent(${event.id})">Delete</button>`;
      eventList.appendChild(li);
    });

    document.getElementById("dialog-title").textContent = `Events on ${date}`;
    document.getElementById("eventDialog").showModal();
  } else {
    alert("No events on this day.");
  }
}

function deleteEvent(eventId) {
  events = events.filter((event) => event.id !== eventId);
  renderCalendar(currentYear, currentMonth);
  closeDialog();
}

function closeDialog() {
  document.getElementById("eventDialog").close();
}



function overrideEvent() {
  const selectedDays = [];
  document
    .querySelectorAll(".checkbox-grid input:checked")
    .forEach((checkbox) => {
      selectedDays.push(checkbox.value);
    });

  if (
    eventTitle.value &&
    eventStart.value &&
    eventEnd.value &&
    selectedDays.length > 0
  ) {
    // Remove existing events within date range and selected days
    events = events.filter((event) => {
      const eventStartDate = new Date(event.start);
      const eventEndDate = new Date(event.end);
      const newStartDate = new Date(eventStart.value);
      const newEndDate = new Date(eventEnd.value);

      return !(
        newStartDate <= eventEndDate &&
        newEndDate >= eventStartDate &&
        selectedDays.some((day) => event.days.includes(day))
      );
    });

    // Add the new event with updated details
    events.push({
      title: eventTitle.value,
      start: eventStart.value,
      end: eventEnd.value,
      days: selectedDays,
    });

    renderCalendar(currentYear, currentMonth);
    // alert("Events overridden successfully!");

    eventTitle.value = "";
    eventStart.value = "";
    eventEnd.value = "";
    weekdayOptions.classList.add("hidden");
  } else {
    alert("Please fill all fields and select at least one day.");
  }
}

function overrideSpecificDays() {
  const selectedDays = [];
  document
    .querySelectorAll(".checkbox-grid input:checked")
    .forEach((checkbox) => {
      selectedDays.push(checkbox.value);
    });

  if (
    eventTitle.value &&
    eventStart.value &&
    eventEnd.value &&
    selectedDays.length > 0
  ) {
    let startDate = new Date(eventStart.value);
    let endDate = new Date(eventEnd.value);

    while (startDate <= endDate) {
      let dayOfWeek = startDate.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (selectedDays.includes(dayOfWeek)) {
        // Find existing event on this day and override
        events = events.map((event) => {
          if (
            event.start <= startDate.toISOString().split("T")[0] &&
            event.end >= startDate.toISOString().split("T")[0] &&
            event.days.includes(dayOfWeek)
          ) {
            return {
              title: eventTitle.value,
              start: event.start,
              end: event.end,
              days: event.days,
            };
          }
          return event;
        });
      }

      startDate.setDate(startDate.getDate() + 1);
    }

    renderCalendar(currentYear, currentMonth);
    alert("Selected days overridden successfully!");

    eventTitle.value = "";
    eventStart.value = "";
    eventEnd.value = "";
    weekdayOptions.classList.add("hidden");
  } else {
    alert("Please fill all fields and select at least one day.");
  }
}

function clearAndOverride() {
  if (eventStart.value && eventEnd.value) {
    // Clear all events in the selected date range
    events = events.filter((event) => {
      return event.end < eventStart.value || event.start > eventEnd.value;
    });

    addEvent();
    alert("All events in the selected range have been overridden.");
  } else {
    alert("Please select start and end dates.");
  }
}


function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
}

renderCalendar(currentYear, currentMonth);
