const API_URL =
  'https://script.google.com/macros/s/AKfycbx04NJaSkQc4wbbkpO3DnLRNIazA48k_GV0R65bMpoGLcR1aB2JKRAcWO4tkv1Vcvt0/exec';

const dateEl = document.getElementById('date') as HTMLInputElement;
const subjectEl = document.getElementById('subject') as HTMLInputElement;
const durationEl = document.getElementById('duration') as HTMLInputElement;
const descriptionEl = document.getElementById(
  'description'
) as HTMLTextAreaElement;
const logEl = document.getElementById('log') as HTMLPreElement;
const addBtn = document.getElementById('add') as HTMLButtonElement;
const reloadBtn = document.getElementById('reload') as HTMLButtonElement;

type HomeworkRow = {
  Date: string;
  Subject: string;
  Duration: string;
  Description: string;
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
  logEl.textContent = 'Loading…';

  const res = await fetch(`${API_URL}?t=${Date.now()}`); // t=… to avoid caching
  const data = (await res.json()) as ApiResponse;
  const rows = data.rows ?? [];

  if (!rows.length) {
    logEl.textContent = 'No entries yet.';
    return;
  }

  const headers = ['Date', 'Subject', 'Duration', 'Description'] as const;

  const lines = [
    headers.join(' | '),
    ...rows.map((r) => headers.map((h) => r[h] ?? '').join(' | ')),
  ];

  logEl.textContent = lines.join('\n');
}

async function addEntry() {
  const payload: HomeworkRow = {
    Date: dateEl.value,
    Subject: subjectEl.value,
    Duration: durationEl.value,
    Description: descriptionEl.value,
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
  descriptionEl.value = '';

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
  logEl.textContent = 'Error loading log (see console).';
});
