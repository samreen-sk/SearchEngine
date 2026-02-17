const adminPasswordInput = document.getElementById("adminPasswordInput");
const loadAdminProfilesBtn = document.getElementById("loadAdminProfilesBtn");
const adminProfilesGrid = document.getElementById("adminProfilesGrid");
const adminProfileData = document.getElementById("adminProfileData");

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts.slice(0, 2).map((v) => v[0].toUpperCase()).join("");
}

function showDataMessage(message) {
  adminProfileData.innerHTML = `<div class="history-empty">${message}</div>`;
}

function renderProfileData(payload) {
  if (!payload || !payload.profile) {
    showDataMessage("No data available.");
    return;
  }

  const history = Array.isArray(payload.history) ? payload.history : [];
  const topQueries = Array.isArray(payload.topQueries) ? payload.topQueries : [];
  const storedResults = Array.isArray(payload.storedResults) ? payload.storedResults : [];

  const historyHtml = history.length
    ? history.slice(0, 20).map((h) =>
      `<li>${h.queryText} <span class="top-count">(${new Date(h.searchedAt).toLocaleString()})</span></li>`).join("")
    : "<li>No history.</li>";

  const topHtml = topQueries.length
    ? topQueries.map((t) => `<li>${t.query} <span class="top-count">(${t.count})</span></li>`).join("")
    : "<li>No top queries.</li>";

  const resultsHtml = storedResults.length
    ? storedResults.slice(0, 30).map((r) =>
      `<li><a class="stored-link" href="${r.url}" target="_blank" rel="noopener">${r.title || r.url}</a> <span class="top-count">(rank ${r.rank}, score ${Number(r.score).toFixed(3)})</span></li>`).join("")
    : "<li>No stored results.</li>";

  adminProfileData.innerHTML = `
    <div class="admin-data-grid">
      <article class="stored-item">
        <div class="stored-title">Profile</div>
        <div>${payload.profile.displayName}</div>
        <div class="stored-meta">Created: ${payload.profile.createdAt ? new Date(payload.profile.createdAt).toLocaleString() : "-"}</div>
      </article>
      <article class="stored-item">
        <div class="stored-title">Counts</div>
        <div class="stored-meta">Total queries: ${payload.totalQueries}</div>
        <div class="stored-meta">Total results: ${payload.totalResults}</div>
      </article>
      <article class="stored-item">
        <div class="stored-title">History (latest 20)</div>
        <ul class="admin-list">${historyHtml}</ul>
      </article>
      <article class="stored-item">
        <div class="stored-title">Top queries</div>
        <ul class="admin-list">${topHtml}</ul>
      </article>
      <article class="stored-item">
        <div class="stored-title">Stored results (latest 30)</div>
        <ul class="admin-list">${resultsHtml}</ul>
      </article>
    </div>
  `;
}

async function loadProfileData(profileId) {
  const response = await fetch(`/api/admin/profiles/${profileId}/data`);

  if (!response.ok) {
    let message = `Unable to load user data (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // ignore
    }
    showDataMessage(message);
    return;
  }

  const data = await response.json();
  renderProfileData(data);
}

function renderProfiles(items) {
  adminProfilesGrid.innerHTML = "";

  if (!items || items.length === 0) {
    adminProfilesGrid.innerHTML = `<div class="history-empty">No profiles found.</div>`;
    return;
  }

  for (const profile of items) {
    const card = document.createElement("article");
    card.className = "profile-card";

    const title = document.createElement("div");
    title.className = "profile-name";
    title.textContent = profile.displayName || "Unnamed";

    const avatar = document.createElement("div");
    avatar.className = "profile-avatar";
    const text = document.createElement("span");
    text.textContent = initials(profile.displayName);
    avatar.appendChild(text);

    const meta = document.createElement("div");
    meta.className = "stored-meta";
    meta.style.textAlign = "center";
    meta.textContent = profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "";

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "ghost";
    viewBtn.textContent = "View data";
    viewBtn.addEventListener("click", () => loadProfileData(profile.id));

    card.appendChild(title);
    card.appendChild(avatar);
    card.appendChild(meta);
    card.appendChild(viewBtn);
    adminProfilesGrid.appendChild(card);
  }
}

async function loadAdminProfiles() {
  const adminPassword = (adminPasswordInput.value || "").trim();
  if (!adminPassword) {
    adminProfilesGrid.innerHTML = `<div class="history-empty">Enter admin password.</div>`;
    return;
  }

  const loginResponse = await fetch("/api/auth/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: adminPassword })
  });
  if (!loginResponse.ok) {
    let message = `Admin login failed (${loginResponse.status})`;
    try {
      const error = await loginResponse.json();
      message = error.message || message;
    } catch {
      // ignore
    }
    adminProfilesGrid.innerHTML = `<div class="history-empty">${message}</div>`;
    return;
  }

  const response = await fetch("/api/admin/profiles");

  if (!response.ok) {
    let message = `Unable to load profiles (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // ignore parse failure
    }
    adminProfilesGrid.innerHTML = `<div class="history-empty">${message}</div>`;
    return;
  }

  const data = await response.json();
  renderProfiles(data);
  showDataMessage("Click 'View data' on a profile card.");
}

if (loadAdminProfilesBtn) {
  loadAdminProfilesBtn.addEventListener("click", loadAdminProfiles);
}
