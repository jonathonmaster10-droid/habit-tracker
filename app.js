/* =====================================================
   HABIT TRACKER - JavaScript
   Capstone Project

   This file is split into 6 sections so each team
   member can present their own part.
   ===================================================== */


/* =====================================================
   GLOBAL DATA
   These two variables hold everything our app remembers.
   ===================================================== */

// This list keeps all the habit names the user added.
// Example: ["Water intake", "Gym", "Reading"]
let habits = [];

// This object remembers which habits were finished on which day.
// The key is the date as text, and the value is a list of habit names.
// Example:
//   completed["2026-05-25"] = ["Water intake", "Gym"]
//   completed["2026-05-26"] = ["Water intake"]
let completed = {};

// A list of motivational quotes. We pick one each day.
let quotes = [
  "Small steps every day lead to big results!",
  "Don't break the chain — keep going!",
  "Discipline beats motivation.",
  "You are what you repeatedly do.",
  "Progress, not perfection.",
  "One day at a time.",
  "A little bit every day is better than a lot once in a while.",
  "Believe you can and you're halfway there.",
  "The secret of getting ahead is getting started."
];


/* =====================================================
   SECTION 1 (Team Member 1)
   HELPER FUNCTIONS + SAVE / LOAD
   These functions help the rest of the program.
   ===================================================== */

// Returns today's date as a string like "2026-05-25"
function getTodayString() {
  let today = new Date();
  return formatDate(today);
}

// Takes a Date object and gives back a string "YYYY-MM-DD"
function formatDate(dateObject) {
  let year = dateObject.getFullYear();
  let month = dateObject.getMonth() + 1;  // months start at 0 in JS
  let day = dateObject.getDate();

  // Put a 0 in front if the number is less than 10
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }

  return year + "-" + month + "-" + day;
}

// Save our data into the browser so it stays after a refresh
function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("completed", JSON.stringify(completed));
}

// Load saved data when the page opens
function loadData() {
  let savedHabits = localStorage.getItem("habits");
  let savedCompleted = localStorage.getItem("completed");

  if (savedHabits !== null) {
    habits = JSON.parse(savedHabits);
  }
  if (savedCompleted !== null) {
    completed = JSON.parse(savedCompleted);
  }
}


/* =====================================================
   SECTION 2 (Team Member 2)
   SHOW THE DATE + THE QUOTE
   ===================================================== */

function showDate() {
  let today = new Date();
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };
  let nice = today.toLocaleDateString(undefined, options);
  document.getElementById("todayDate").textContent = nice;
}

function showQuote() {
  // Use the day number so the quote changes once per day
  let dayNumber = new Date().getDate();
  let index = dayNumber % quotes.length;
  document.getElementById("quoteText").textContent = quotes[index];
}


/* =====================================================
   SECTION 3 (Team Member 3)
   ADD AND DELETE HABITS
   ===================================================== */

// Called when the "Add Habit" button is clicked
function addHabit() {
  let input = document.getElementById("habitInput");
  let name = input.value.trim();

  if (name === "") {
    alert("Please type a habit name!");
    return;
  }

  // Don't allow duplicates
  for (let i = 0; i < habits.length; i++) {
    if (habits[i] === name) {
      alert("You already have this habit!");
      return;
    }
  }

  habits.push(name);
  input.value = "";
  saveData();
  showEverything();
}

// Called when a preset button is clicked (e.g. "Water intake")
function addPreset(name) {
  // Don't allow duplicates
  for (let i = 0; i < habits.length; i++) {
    if (habits[i] === name) {
      alert("You already have this habit!");
      return;
    }
  }

  habits.push(name);
  saveData();
  showEverything();
}

// Called when the Delete button on a habit is clicked
function deleteHabit(name) {
  let sure = confirm("Delete the habit '" + name + "'?");
  if (sure === false) {
    return;
  }

  // Make a new list without that habit
  let newHabits = [];
  for (let i = 0; i < habits.length; i++) {
    if (habits[i] !== name) {
      newHabits.push(habits[i]);
    }
  }
  habits = newHabits;

  // Also remove it from the completed history
  for (let date in completed) {
    let cleaned = [];
    for (let i = 0; i < completed[date].length; i++) {
      if (completed[date][i] !== name) {
        cleaned.push(completed[date][i]);
      }
    }
    completed[date] = cleaned;
  }

  saveData();
  showEverything();
}


/* =====================================================
   SECTION 4 (Team Member 4)
   MARK HABITS DONE + STREAK CALCULATIONS
   ===================================================== */

// Called when the "Done" or "Undo" button is clicked.
// If the habit isn't done today, mark it done. Otherwise un-mark it.
function toggleHabit(name) {
  let today = getTodayString();

  // Make sure today's list exists
  if (!completed[today]) {
    completed[today] = [];
  }

  // See if this habit is already in today's list
  let alreadyDone = false;
  for (let i = 0; i < completed[today].length; i++) {
    if (completed[today][i] === name) {
      alreadyDone = true;
    }
  }

  if (alreadyDone === true) {
    // Remove it from the list
    let newList = [];
    for (let i = 0; i < completed[today].length; i++) {
      if (completed[today][i] !== name) {
        newList.push(completed[today][i]);
      }
    }
    completed[today] = newList;
  } else {
    // Add it to the list
    completed[today].push(name);
  }

  saveData();
  showEverything();
}

// Check if a habit was done on a certain date
function wasDoneOn(name, dateString) {
  if (!completed[dateString]) {
    return false;
  }
  for (let i = 0; i < completed[dateString].length; i++) {
    if (completed[dateString][i] === name) {
      return true;
    }
  }
  return false;
}

// Current streak = how many days in a row (counting back from today)
// the user has done at least one habit.
function calculateCurrentStreak() {
  let streak = 0;
  let date = new Date();

  // If today has nothing yet, start counting from yesterday instead
  let todayKey = getTodayString();
  if (!completed[todayKey] || completed[todayKey].length === 0) {
    date.setDate(date.getDate() - 1);
  }

  // Count backwards day by day
  while (true) {
    let key = formatDate(date);
    if (completed[key] && completed[key].length > 0) {
      streak = streak + 1;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
    // Safety stop so the loop can't run forever
    if (streak > 1000) {
      break;
    }
  }

  return streak;
}

// Longest streak ever (the best run in history)
function calculateLongestStreak() {
  // Get every date that has at least one completed habit
  let dates = [];
  for (let date in completed) {
    if (completed[date].length > 0) {
      dates.push(date);
    }
  }

  // Sort them in order (oldest to newest)
  dates.sort();

  let longest = 0;
  let current = 0;
  let previousDate = null;

  for (let i = 0; i < dates.length; i++) {
    let date = dates[i];

    if (previousDate !== null && isNextDay(previousDate, date)) {
      current = current + 1;
    } else {
      current = 1;
    }

    if (current > longest) {
      longest = current;
    }

    previousDate = date;
  }

  return longest;
}

// Returns true if dateString2 is the day right after dateString1
function isNextDay(dateString1, dateString2) {
  let d = new Date(dateString1 + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return formatDate(d) === dateString2;
}


/* =====================================================
   SECTION 5 (Team Member 5)
   CALENDAR VIEW
   ===================================================== */

function showCalendar() {
  let now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // Show the month name + year at the top
  let monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  document.getElementById("calendarTitle").textContent =
    monthNames[month] + " " + year;

  // Find what weekday the 1st of the month falls on (0 = Sunday)
  let firstDay = new Date(year, month, 1).getDay();

  // Find the last date number in the month (e.g. 28, 30, 31)
  let lastDate = new Date(year, month + 1, 0).getDate();

  let html = "";

  // Add empty boxes before day 1 so the grid lines up
  for (let i = 0; i < firstDay; i++) {
    html = html + '<div class="calendar-day empty"></div>';
  }

  // Add the real day boxes
  let todayDay = now.getDate();
  for (let day = 1; day <= lastDate; day++) {
    // Build the date string for this calendar cell
    let cellDate = new Date(year, month, day);
    let key = formatDate(cellDate);

    // Figure out the CSS class for this day
    let cssClass = "calendar-day";

    // How many habits were done that day?
    let doneCount = 0;
    if (completed[key]) {
      doneCount = completed[key].length;
    }

    if (habits.length > 0 && doneCount === habits.length) {
      cssClass = cssClass + " done";        // all habits done
    } else if (doneCount > 0) {
      cssClass = cssClass + " partial";     // some done
    }

    if (day === todayDay) {
      cssClass = cssClass + " today";
    }

    html = html + '<div class="' + cssClass + '">' + day + '</div>';
  }

  document.getElementById("calendarGrid").innerHTML = html;
}


/* =====================================================
   SECTION 6 (Team Member 6)
   STATS + SHOW THE HABIT LIST
   ===================================================== */

// How many habits done today divided by total habits, as a percent
function calculateTodayPercent() {
  if (habits.length === 0) {
    return 0;
  }

  let today = getTodayString();
  let doneToday = 0;
  if (completed[today]) {
    doneToday = completed[today].length;
  }

  let percent = (doneToday / habits.length) * 100;
  return Math.round(percent);
}

// Total habits ever completed (count of all days combined)
function calculateTotalDone() {
  let total = 0;
  for (let date in completed) {
    total = total + completed[date].length;
  }
  return total;
}

function showStats() {
  let currentStreak = calculateCurrentStreak();
  let longestStreak = calculateLongestStreak();

  // The longest streak should always be at least as big as the current one
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  document.getElementById("currentStreak").textContent = currentStreak + " days";
  document.getElementById("longestStreak").textContent = longestStreak + " days";
  document.getElementById("todayPercent").textContent = calculateTodayPercent() + "%";
  document.getElementById("totalDone").textContent = calculateTotalDone();
}

function showHabitList() {
  let container = document.getElementById("habitList");

  // If there are no habits, show a friendly message
  if (habits.length === 0) {
    container.innerHTML = '<p class="empty-message">No habits yet. Add one above to get started!</p>';
    return;
  }

  let today = getTodayString();
  let html = "";

  for (let i = 0; i < habits.length; i++) {
    let name = habits[i];
    let done = wasDoneOn(name, today);

    let rowClass = "habit-item";
    if (done === true) {
      rowClass = rowClass + " done";
    }

    let buttonText = "Done";
    if (done === true) {
      buttonText = "Undo";
    }

    html = html + '<div class="' + rowClass + '">';
    html = html +   '<span class="habit-name">' + name + '</span>';
    html = html +   '<div class="habit-buttons">';
    html = html +     '<button class="done-btn" onclick="toggleHabit(\'' + name + '\')">' + buttonText + '</button>';
    html = html +     '<button class="delete-btn" onclick="deleteHabit(\'' + name + '\')">Delete</button>';
    html = html +   '</div>';
    html = html + '</div>';
  }

  container.innerHTML = html;
}


/* =====================================================
   THE MAIN FUNCTION
   This calls every "show" function so the page updates.
   Everyone uses this to refresh the screen after a change.
   ===================================================== */

function showEverything() {
  showDate();
  showQuote();
  showStats();
  showHabitList();
  showCalendar();
}


/* =====================================================
   START THE APP
   These two lines run when the page loads.
   ===================================================== */

loadData();
showEverything();
