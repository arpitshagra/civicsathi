// Thin fetch wrapper around the CivicSathi backend.
// - Injects the Firebase ID token as `Authorization: Bearer <token>`.
// - Unwraps the `{ status, message, data }` envelope, returning `data`.
// - Throws an Error with `.code` and `.status` on any error response.
import { auth } from "../firebase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

// Current UI/output language, persisted across sessions. Read by every request
// and by the language toggle in the sidebar.
export function getLanguage() {
  return localStorage.getItem("lang") || "en";
}

export function setLanguage(lang) {
  localStorage.setItem("lang", lang);
}

async function request(method, path, body) {
  const headers = {
    "Content-Type": "application/json",
    "X-Language": getLanguage(),
  };

  // Attach the current user's token when signed in.
  const currentUser = auth.currentUser;
  if (currentUser) {
    const token = await currentUser.getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network / server-unreachable failure.
    throw new ApiError("Cannot reach the server. Is the backend running?", "NETWORK", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || (json && json.status === "error")) {
    const message = (json && json.message) || `Request failed (${res.status})`;
    const code = (json && json.code) || "ERROR";
    throw new ApiError(message, code, res.status);
  }

  // Success envelope: return the payload.
  return json ? json.data : null;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  del: (path) => request("DELETE", path),
};

export { ApiError };
