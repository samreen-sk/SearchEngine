const historyListEl = document.getElementById("historyList");
const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
const deleteHistoryQueryInput = document.getElementById("deleteHistoryQueryInput");
const deleteHistoryQueryBtn = document.getElementById("deleteHistoryQueryBtn");

function renderHistory(items) {
  historyListEl.innerHTML = "";

  if (!items || items.length === 0) {
    historyListEl.innerHTML =
      `<div class="history-empty">No searches yet.</div>`;
    return;
  }

  const groups = new Map();
  for (const item of items) {
    const rawTime = item?.searchedAt ?? item?.searched_at ?? item?.time ?? "";
    const parsed = rawTime ? new Date(rawTime) : null;
    const dayKey = parsed && !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "Unknown date";

    if (!groups.has(dayKey)) {
      groups.set(dayKey, []);
    }
    groups.get(dayKey).push({ item, parsed, rawTime });
  }

  for (const [dayKey, entries] of groups.entries()) {
    const dayHeader = document.createElement("div");
    dayHeader.className = "history-day";
    dayHeader.textContent = dayKey;
    historyListEl.appendChild(dayHeader);

    for (const entry of entries) {
      const row = document.createElement("div");
      row.className = "history-item";

      const queryText =
        entry.item?.queryText ?? entry.item?.query_text ?? entry.item?.query ?? "";
      const id = entry.item?.id;

      const queryBtn = document.createElement("button");
      queryBtn.type = "button";
      queryBtn.className = "history-query";
      queryBtn.textContent = queryText || "(empty)";
      queryBtn.addEventListener("click", () => {
        const query = String(queryText || "").trim();
        if (!query) {
          return;
        }
        window.location.href = `/?q=${encodeURIComponent(query)}`;
      });

      const time = document.createElement("div");
      time.className = "history-time";
      if (entry.parsed && !Number.isNaN(entry.parsed.getTime())) {
        time.textContent = entry.parsed.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit"
        });
      } else {
        time.textContent = entry.rawTime || "Unknown time";
      }

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "ghost danger tiny";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async () => {
        if (!id) {
          return;
        }
        await deleteHistoryById(id);
        loadHistory();
      });

      const right = document.createElement("div");
      right.className = "history-right";
      right.appendChild(time);
      right.appendChild(deleteBtn);

      row.appendChild(queryBtn);
      row.appendChild(right);
      historyListEl.appendChild(row);
    }
  }
}

async function loadHistory() {
  try {
    const response = await fetch("/api/search/history");
    if (!response.ok) {
      historyListEl.innerHTML =
        `<div class="history-empty">Unable to load history.</div>`;
      return;
    }
    const data = await response.json();
    renderHistory(data);
  } catch {
    historyListEl.innerHTML =
      `<div class="history-empty">Unable to load history.</div>`;
  }
}

async function deleteHistoryById(id) {
  await fetch(`/api/search/history/${id}`, { method: "DELETE" });
}

async function deleteHistoryByQuery(query) {
  await fetch(`/api/search/history?query=${encodeURIComponent(query)}`, {
    method: "DELETE"
  });
}

if (refreshHistoryBtn) {
  refreshHistoryBtn.addEventListener("click", loadHistory);
}

if (deleteHistoryQueryBtn) {
  deleteHistoryQueryBtn.addEventListener("click", async () => {
    const query = (deleteHistoryQueryInput.value || "").trim();
    if (!query) {
      return;
    }
    await deleteHistoryByQuery(query);
    deleteHistoryQueryInput.value = "";
    loadHistory();
  });
}

window.addEventListener("load", () => {
  loadHistory();
});
