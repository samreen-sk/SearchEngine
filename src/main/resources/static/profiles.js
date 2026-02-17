const profileNameInput = document.getElementById("profileNameInput");
const profilePasswordInput = document.getElementById("profilePasswordInput");
const createProfileBtn = document.getElementById("createProfileBtn");
const profilesGrid = document.getElementById("profilesGrid");
let visibleProfiles = [];

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts.slice(0, 2).map((v) => v[0].toUpperCase()).join("");
}

function renderProfiles(items) {
  visibleProfiles = Array.isArray(items) ? items : [];
  profilesGrid.innerHTML = "";

  if (!visibleProfiles || visibleProfiles.length === 0) {
    profilesGrid.innerHTML = `<div class="history-empty">No profiles found.</div>`;
    return;
  }

  for (const profile of visibleProfiles) {
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

    const actionBar = document.createElement("div");
    actionBar.className = "profile-actions";

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "ghost";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", async () => {
      const password = window.prompt(`Enter password for "${profile.displayName}"`);
      if (!password) {
        return;
      }
      const response = await fetch("/api/auth/profile-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: profile.id, password })
      });
      const data = await response.json();
      if (!response.ok || !data.authenticated) {
        window.alert(data.message || "Invalid password");
        return;
      }
      sessionStorage.setItem("activeProfileId", String(data.profileId || profile.id));
      sessionStorage.setItem("activeProfileName", data.displayName || profile.displayName || "Profile");
      const params = new URLSearchParams(window.location.search);
      const next = (params.get("next") || "/").trim();
      window.location.href = next || "/";
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "ghost danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      const password = window.prompt(`Enter password to delete "${profile.displayName}"`);
      if (!password) {
        return;
      }

      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        let message = "Delete failed";
        try {
          const error = await response.json();
          message = error.message || message;
        } catch {
          // ignore parse failure
        }
        window.alert(message);
        return;
      }

      visibleProfiles = visibleProfiles.filter((p) => p.id !== profile.id);
      renderProfiles(visibleProfiles);
    });

    actionBar.appendChild(openBtn);
    actionBar.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(avatar);
    card.appendChild(actionBar);
    profilesGrid.appendChild(card);
  }
}

async function loadProfiles() {
  const response = await fetch("/api/profiles", { method: "GET" });

  if (!response.ok) {
    let message = `Unable to load profiles (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // ignore parse failure
    }
    profilesGrid.innerHTML = `<div class="history-empty">${message}</div>`;
    return;
  }

  const data = await response.json();
  renderProfiles(data);
}

async function createProfile() {
  const displayName = (profileNameInput.value || "").trim();
  const password = (profilePasswordInput.value || "").trim();

  const response = await fetch("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName, password })
  });

  if (!response.ok) {
    let message = `Create failed (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // ignore parse failure
    }
    window.alert(message);
    return;
  }
  const created = await response.json();

  profileNameInput.value = "";
  profilePasswordInput.value = "";
  renderProfiles([created, ...visibleProfiles]);
}

if (createProfileBtn) {
  createProfileBtn.addEventListener("click", createProfile);
}

window.addEventListener("load", () => {
  loadProfiles();
});
