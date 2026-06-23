const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");

const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");
const attendeeListEl = document.getElementById("attendeeList");
const celebrationEl = document.getElementById("celebration");

var attendeeCount = 0;
var waterCount = 0;
var zeroCount = 0;
var powerCount = 0;
var MAX_ATTENDEES = 50;
var attendees = [];

function saveState() {
  var data = {
    attendeeCount: attendeeCount,
    waterCount: waterCount,
    zeroCount: zeroCount,
    powerCount: powerCount,
    attendees: attendees,
  };
  try {
    localStorage.setItem("checkInData", JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}

function loadState() {
  try {
    var raw = localStorage.getItem("checkInData");
    if (!raw) return;
    var data = JSON.parse(raw);
    attendeeCount = data.attendeeCount || 0;
    waterCount = data.waterCount || 0;
    zeroCount = data.zeroCount || 0;
    powerCount = data.powerCount || 0;
    attendees = Array.isArray(data.attendees) ? data.attendees : [];

    attendeeCountEl.textContent = attendeeCount;
    waterCountEl.textContent = waterCount;
    zeroCountEl.textContent = zeroCount;
    powerCountEl.textContent = powerCount;
    var percent = Math.round((attendeeCount / MAX_ATTENDEES) * 100);
    progressBar.style.width = percent + "%";
    renderAttendees();
    if (attendeeCount >= MAX_ATTENDEES) {
      showCelebration();
    }
  } catch (e) {
    console.warn("Could not load state", e);
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = nameInput.value.trim();
  var team = teamSelect.value;

  if (!name || !team) {
    return;
  }

  if (attendeeCount >= MAX_ATTENDEES) {
    greeting.textContent = "Event capacity reached.";
    greeting.className = "";
    greeting.style.display = "block";
    return;
  }

  attendeeCount = attendeeCount + 1;
  attendeeCountEl.textContent = attendeeCount;

  var percent = Math.round((attendeeCount / MAX_ATTENDEES) * 100);
  progressBar.style.width = percent + "%";

  if (team === "water") {
    waterCount = waterCount + 1;
    waterCountEl.textContent = waterCount;
  } else if (team === "zero") {
    zeroCount = zeroCount + 1;
    zeroCountEl.textContent = zeroCount;
  } else if (team === "power") {
    powerCount = powerCount + 1;
    powerCountEl.textContent = powerCount;
  }

  var entry = { name: name, team: team };
  attendees.push(entry);
  renderAttendees();
  saveState();

  var teamName =
    team === "water"
      ? "Team Water Wise"
      : team === "zero"
        ? "Team Net Zero"
        : "Team Renewables";
  greeting.textContent =
    "Thanks, " + name + ". Checked in for " + teamName + ".";
  greeting.className = "success-message";
  greeting.style.display = "block";

  form.reset();

  setTimeout(function () {
    greeting.style.display = "none";
  }, 3000);
  if (attendeeCount >= MAX_ATTENDEES) {
    showCelebration();
  }
});

function renderAttendees() {
  if (!attendeeListEl) return;
  attendeeListEl.innerHTML = "";
  attendees.forEach(function (a, i) {
    var div = document.createElement("div");
    div.className = "attendee-item";
    var nameSpan = document.createElement("span");
    nameSpan.className = "attendee-name";
    nameSpan.textContent = a.name;
    var teamSpan = document.createElement("span");
    teamSpan.className = "attendee-team";
    var teamLabel =
      a.team === "water"
        ? "🌊 Team Water Wise"
        : a.team === "zero"
          ? "🌿 Team Net Zero"
          : "⚡ Team Renewables";
    teamSpan.textContent = teamLabel;
    div.appendChild(nameSpan);
    div.appendChild(teamSpan);
    attendeeListEl.appendChild(div);
  });
}

function showCelebration() {
  if (!celebrationEl) return;
  // determine winner
  var max = Math.max(waterCount, zeroCount, powerCount);
  var winners = [];
  if (waterCount === max) winners.push("🌊 Team Water Wise");
  if (zeroCount === max) winners.push("🌿 Team Net Zero");
  if (powerCount === max) winners.push("⚡ Team Renewables");

  var message = "Goal reached! ";
  if (winners.length === 1) {
    message += winners[0] + " wins 🎉";
  } else {
    message += "It's a tie between " + winners.join(" & ") + " 🎉";
  }

  celebrationEl.textContent = message;
  celebrationEl.style.display = "block";

  // highlight winner cards
  // remove existing winner classes
  var cards = document.querySelectorAll(".team-card");
  cards.forEach(function (c) {
    c.classList.remove("winner");
  });
  if (winners.length === 1) {
    var cls = winners[0].includes("Water")
      ? ".team-card.water"
      : winners[0].includes("Net Zero")
        ? ".team-card.zero"
        : ".team-card.power";
    var el = document.querySelector(cls);
    if (el) el.classList.add("winner");
  }
}

// initialize
loadState();
