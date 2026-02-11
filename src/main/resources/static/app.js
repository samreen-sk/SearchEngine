const form = document.getElementById("searchForm");
const queryInput = document.getElementById("queryInput");
const pageInput = document.getElementById("pageInput");
const resultsEl = document.getElementById("results");
const statusText = document.getElementById("statusText");
const elapsedText = document.getElementById("elapsedText");
const resetBtn = document.getElementById("resetBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
let lastQuery = "";

function setStatus(message, elapsedMs) {
  statusText.textContent = message;
  elapsedText.textContent =
    typeof elapsedMs === "number" ? `Elapsed: ${elapsedMs} ms` : "";
}

function renderResults(results) {
  resultsEl.innerHTML = "";

  if (!results || results.length === 0) {
    resultsEl.innerHTML = `<div class="result-card">No results found.</div>`;
    return;
  }

  for (const item of results) {
    const card = document.createElement("article");
    card.className = "result-card";

    const title = document.createElement("div");
    title.className = "result-title";
    title.textContent = item.title || "Untitled";

    const link = document.createElement("a");
    link.className = "result-link";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item.url;

    const meta = document.createElement("div");
    meta.className = "result-meta";
    meta.innerHTML = `
      <span class="badge">Rank ${item.rank}</span>
      <span>Relevance: ${Number(item.score).toFixed(3)}</span>
    `;

    card.appendChild(title);
    card.appendChild(link);
    card.appendChild(meta);
    resultsEl.appendChild(card);
  }
}

async function search(query, page, size) {
  const payload = {
    query,
    page,
    size
  };

  const start = performance.now();
  setStatus("Searching...");

  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const elapsed = Math.round(performance.now() - start);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const err = await response.json();
      if (err && err.message) {
        message = err.message;
      }
    } catch {
      // ignore
    }
    setStatus(message, elapsed);
    renderResults([]);
    return;
  }

  const data = await response.json();
  setStatus(`Results: ${data.length}`, elapsed);
  renderResults(data);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = queryInput.value.trim();
  if (!query) {
    setStatus("Enter a query to search.");
    return;
  }

  pageInput.value = 0;
  const page = Math.max(0, Number(pageInput.value || 0));
  const size = 10;

  lastQuery = query;
  search(query, page, size);
});

function refreshOnControlsChange() {
  if (!lastQuery) {
    return;
  }
  const page = Math.max(0, Number(pageInput.value || 0));
  const size = 10;
  search(lastQuery, page, size);
}

pageInput.addEventListener("change", refreshOnControlsChange);

prevPageBtn.addEventListener("click", () => {
  const page = Math.max(0, Number(pageInput.value || 0) - 1);
  pageInput.value = page;
  refreshOnControlsChange();
});

nextPageBtn.addEventListener("click", () => {
  const page = Math.max(0, Number(pageInput.value || 0) + 1);
  pageInput.value = page;
  refreshOnControlsChange();
});

resetBtn.addEventListener("click", () => {
  queryInput.value = "";
  pageInput.value = 0;
  resultsEl.innerHTML = "";
  lastQuery = "";
  setStatus("Enter a query to start.");
  elapsedText.textContent = "";
});

window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get("q") || "").trim();
  if (q) {
    queryInput.value = q;
    pageInput.value = 0;
    lastQuery = q;
    search(q, 0, 10);
  }
});
