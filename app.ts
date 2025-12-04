const API_URL =
  'https://script.google.com/macros/s/AKfycbx04NJaSkQc4wbbkpO3DnLRNIazA48k_GV0R65bMpoGLcR1aB2JKRAcWO4tkv1Vcvt0/exec';

const dateEl = document.getElementById('date') as HTMLInputElement;
const subjectEl = document.getElementById('subject') as HTMLInputElement;
const detailsEl = document.getElementById('details') as HTMLInputElement;
const durationEl = document.getElementById('duration') as HTMLInputElement;
const notesEl = document.getElementById('notes') as HTMLInputElement;
const logBody = document.getElementById('log-body') as HTMLTableSectionElement;
const addBtn = document.getElementById('add') as HTMLButtonElement;
const reloadBtn = document.getElementById('reload') as HTMLButtonElement;

type HomeworkRow = {
  Date: string;
  Subject: string;
  Details: string;
  Duration: string;
  Notes: string;
};

type ApiResponse = {
  version: number;
  rows: HomeworkRow[];
};

// Default date = today in local time
if (dateEl) {
  dateEl.valueAsNumber = Date.now() - new Date().getTimezoneOffset() * 60000;
}

async function loadLog() {
  logBody.innerHTML = '<tr><td colspan="4">Loading…</td></tr>';

  const res = await fetch(`${API_URL}?t=${Date.now()}`); // t=… to avoid caching
  const data = (await res.json()) as ApiResponse;
  console.log('Loaded data:', { data });

  const rows = data.rows ?? [];

  logBody.innerHTML = ''; // Clear loading message

  if (!rows.length) {
    logBody.innerHTML = '<tr><td colspan="4">No entries yet.</td></tr>';
    return;
  }

  const headers = ['Date', 'Subject', 'Details', 'Duration', 'Notes'] as const;

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    headers.forEach((header) => {
      const td = document.createElement('td');
      td.textContent = row[header] ?? '';
      tr.appendChild(td);
    });
    logBody.appendChild(tr);
  });
}

async function addEntry() {
  const payload: HomeworkRow = {
    Date: dateEl.value,
    Subject: subjectEl.value,
    Details: detailsEl.value,
    Duration: durationEl.value,
    Notes: notesEl.value,
  };

  if (!payload.Date || !payload.Subject || !payload.Duration) {
    alert('Please fill Date, Subject, and Duration.');
    return;
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // ✅ simple: no CORS preflight
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (text !== 'OK') {
    alert('Something went wrong: ' + text);
    return;
  }

  // Clear description, keep others for convenience
  notesEl.value = '';

  await loadLog();
}

addBtn.addEventListener('click', () => {
  addEntry().catch((err) => {
    console.error(err);
    alert('Error adding entry, see console.');
  });
});

reloadBtn.addEventListener('click', () => {
  loadLog().catch((err) => {
    console.error(err);
    alert('Error loading log, see console.');
  });
});

// Load initially
loadLog().catch((err) => {
  console.error(err);
  logBody.innerHTML =
    '<tr><td colspan="4" style="color:red">Error loading log.</td></tr>';
});
