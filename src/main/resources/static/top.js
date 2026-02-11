const topQueriesListEl = document.getElementById("topQueriesList");
const refreshTopBtn = document.getElementById("refreshTopBtn");

function renderTopQueries(items) {
  topQueriesListEl.innerHTML = "";

  if (!items || items.length === 0) {
    topQueriesListEl.innerHTML =
      `<div class="history-empty">No top queries yet.</div>`;
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "top-item";

    const query = document.createElement("div");
    query.className = "top-query";
    query.textContent = item?.query || item?.queryText || "(empty)";

    const count = document.createElement("div");
    count.className = "top-count";
    count.textContent = `${item?.count ?? 0} searches`;

    row.appendChild(query);
    row.appendChild(count);
    topQueriesListEl.appendChild(row);
  }
}

async function loadTopQueries() {
  try {
    const response = await fetch("/api/search/top");
    if (!response.ok) {
      topQueriesListEl.innerHTML =
        `<div class="history-empty">Unable to load top queries.</div>`;
      return;
    }
    const data = await response.json();
    renderTopQueries(data);
  } catch {
    topQueriesListEl.innerHTML =
      `<div class="history-empty">Unable to load top queries.</div>`;
  }
}

if (refreshTopBtn) {
  refreshTopBtn.addEventListener("click", loadTopQueries);
}

window.addEventListener("load", () => {
  loadTopQueries();
});
