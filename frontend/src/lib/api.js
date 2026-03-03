async function parseResponse(response) {
  const ct = response.headers.get("content-type") || "";
  let payload = null;
  if (ct.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }
  return payload;
}

function shouldAttachAuth(path) {
  const publicPrefixes = [
    "/api/auth/profile-login",
    "/api/auth/admin-login",
    "/api/auth/refresh",
    "/api/profiles"
  ];
  return !publicPrefixes.some((prefix) => path.startsWith(prefix));
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  const payload = await parseResponse(response);
  if (!response.ok || !payload?.accessToken) {
    return false;
  }
  localStorage.setItem("authToken", payload.accessToken);
  if (payload.refreshToken) {
    localStorage.setItem("refreshToken", payload.refreshToken);
  }
  return true;
}

export async function api(path, options = {}, retryOnAuthError = true) {
  const token = localStorage.getItem("authToken");
  const attachAuth = shouldAttachAuth(path);
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(attachAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && retryOnAuthError && attachAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return api(path, options, false);
      }
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload;
}
