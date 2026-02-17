(function () {
  function normalizePath(path) {
    if (!path || path === "/index.html") {
      return "/";
    }
    return path;
  }

  const currentPath = normalizePath(window.location.pathname);
  const isProfilesPage = currentPath === "/profiles.html";
  const isAdminPage = currentPath === "/admin.html";
  const requiresProfileSession = !isProfilesPage && !isAdminPage;
  const activeProfileId = (sessionStorage.getItem("activeProfileId") || "").trim();
  const activeProfileName = (sessionStorage.getItem("activeProfileName") || "").trim();
  const pageMessage = document.getElementById("pageMessage");

  const flashMessage = sessionStorage.getItem("flashMessage");
  if (flashMessage && pageMessage) {
    pageMessage.textContent = flashMessage;
    pageMessage.classList.add("show");
    sessionStorage.removeItem("flashMessage");
  }

  const links = Array.from(document.querySelectorAll(".header-links a.history-link"));
  for (const link of links) {
    const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);
    if (linkPath === currentPath) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  }

  if (requiresProfileSession && (!activeProfileId || !activeProfileName)) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/profiles.html?next=${encodeURIComponent(next)}`;
    return;
  }

  const activeProfileText = document.getElementById("activeProfileText");
  if (activeProfileText) {
    activeProfileText.textContent = activeProfileName
      ? `Active profile: ${activeProfileName}`
      : "";
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    if (isProfilesPage && !activeProfileId) {
      logoutBtn.style.display = "none";
    }

    logoutBtn.addEventListener("click", async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // ignore network/logout errors
      } finally {
        sessionStorage.removeItem("activeProfileId");
        sessionStorage.removeItem("activeProfileName");
        sessionStorage.setItem("flashMessage", "Logged out successfully.");
        window.location.href = "/profiles.html";
      }
    });
  }
})();
