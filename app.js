// app.ts
var API_URL = "https://script.google.com/macros/s/AKfycbx04NJaSkQc4wbbkpO3DnLRNIazA48k_GV0R65bMpoGLcR1aB2JKRAcWO4tkv1Vcvt0/exec";
var dateEl = document.getElementById("date");
var subjectEl = document.getElementById("subject");
var durationEl = document.getElementById("duration");
var descriptionEl = document.getElementById("description");
var logEl = document.getElementById("log");
var addBtn = document.getElementById("add");
var reloadBtn = document.getElementById("reload");
if (dateEl) {
  dateEl.valueAsNumber = Date.now() - (/* @__PURE__ */ new Date()).getTimezoneOffset() * 6e4;
}
async function loadLog() {
  logEl.textContent = "Loading\u2026";
  const res = await fetch(`${API_URL}?t=${Date.now()}`);
  const data = await res.json();
  console.log("Loaded data:", {
    data
  });
  const rows = data.rows ?? [];
  if (!rows.length) {
    logEl.textContent = "No entries yet.";
    return;
  }
  const headers = [
    "Date",
    "Subject",
    "Duration",
    "Description"
  ];
  const lines = [
    headers.join(" | "),
    ...rows.map((r) => headers.map((h) => r[h] ?? "").join(" | "))
  ];
  logEl.textContent = lines.join("\n");
}
async function addEntry() {
  const payload = {
    Date: dateEl.value,
    Subject: subjectEl.value,
    Duration: durationEl.value,
    Description: descriptionEl.value
  };
  if (!payload.Date || !payload.Subject || !payload.Duration) {
    alert("Please fill Date, Subject, and Duration.");
    return;
  }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (text !== "OK") {
    alert("Something went wrong: " + text);
    return;
  }
  descriptionEl.value = "";
  await loadLog();
}
addBtn.addEventListener("click", () => {
  addEntry().catch((err) => {
    console.error(err);
    alert("Error adding entry, see console.");
  });
});
reloadBtn.addEventListener("click", () => {
  loadLog().catch((err) => {
    console.error(err);
    alert("Error loading log, see console.");
  });
});
loadLog().catch((err) => {
  console.error(err);
  logEl.textContent = "Error loading log (see console).";
});
