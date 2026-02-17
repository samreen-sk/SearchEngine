const storedResultsQueryInput = document.getElementById("storedResultsQueryInput");
const loadStoredResultsBtn = document.getElementById("loadStoredResultsBtn");
const deleteStoredResultsBtn = document.getElementById("deleteStoredResultsBtn");
const storedResultsListEl = document.getElementById("storedResultsList");

function renderStoredResults(items) {
  storedResultsListEl.innerHTML = "";

  if (!items || items.length === 0) {
    storedResultsListEl.innerHTML =
      `<div class="history-empty">No stored results found.</div>`;
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "stored-item";

    const title = document.createElement("div");
    title.className = "stored-title";
    title.textContent = item?.title || "Untitled";

    const link = document.createElement("a");
    link.className = "stored-link";
    link.href = item?.url || "#";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item?.url || "";

    const meta = document.createElement("div");
    meta.className = "stored-meta";
    meta.textContent = `Rank: ${item?.rank ?? "-"} | Score: ${Number(item?.score ?? 0).toFixed(3)}`;

    const actions = document.createElement("div");
    actions.className = "stored-actions";

    const rankInput = document.createElement("input");
    rankInput.type = "number";
    rankInput.placeholder = "Rank";
    rankInput.value = item?.rank ?? "";

    const scoreInput = document.createElement("input");
    scoreInput.type = "number";
    scoreInput.step = "0.001";
    scoreInput.placeholder = "Score";
    scoreInput.value = item?.score ?? "";

    const resultId = item?.resultId ?? item?.id;

    const updateBtn = document.createElement("button");
    updateBtn.type = "button";
    updateBtn.className = "ghost";
    updateBtn.textContent = "Update";
    updateBtn.addEventListener("click", async () => {
      if (!resultId) {
        return;
      }
      const payload = {};
      if (rankInput.value !== "") {
        payload.rank = Number(rankInput.value);
      }
      if (scoreInput.value !== "") {
        payload.relevanceScore = Number(scoreInput.value);
      }
      await updateStoredResult(resultId, payload);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "ghost danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!resultId) {
        return;
      }
      await deleteStoredResult(resultId);
      const query = (storedResultsQueryInput.value || "").trim();
      if (query) {
        loadStoredResults(query);
      }
    });

    actions.appendChild(rankInput);
    actions.appendChild(scoreInput);
    actions.appendChild(updateBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(title);
    row.appendChild(link);
    row.appendChild(meta);
    row.appendChild(actions);
    storedResultsListEl.appendChild(row);
  }
}

async function loadStoredResults(query) {
  try {
    const response = await fetch(`/api/search/results?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      storedResultsListEl.innerHTML =
        `<div class="history-empty">Unable to load stored results.</div>`;
      return;
    }
    const data = await response.json();
    renderStoredResults(data);
  } catch {
    storedResultsListEl.innerHTML =
      `<div class="history-empty">Unable to load stored results.</div>`;
  }
}

async function updateStoredResult(id, payload) {
  await fetch(`/api/search/results/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function deleteStoredResult(id) {
  await fetch(`/api/search/results/${id}`, { method: "DELETE" });
}

async function deleteStoredResultsByQuery(query) {
  await fetch(`/api/search/results?query=${encodeURIComponent(query)}`, {
    method: "DELETE"
  });
}

if (loadStoredResultsBtn) {
  loadStoredResultsBtn.addEventListener("click", () => {
    const query = (storedResultsQueryInput.value || "").trim();
    if (!query) {
      return;
    }
    loadStoredResults(query);
  });
}

if (deleteStoredResultsBtn) {
  deleteStoredResultsBtn.addEventListener("click", async () => {
    const query = (storedResultsQueryInput.value || "").trim();
    if (!query) {
      return;
    }
    await deleteStoredResultsByQuery(query);
    loadStoredResults(query);
  });
}

window.addEventListener("load", () => {
  storedResultsListEl.innerHTML =
    `<div class="history-empty">Enter a query and load stored results.</div>`;
});
