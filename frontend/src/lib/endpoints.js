// One function per backend route. Pages import these instead of touching
// the API client directly. Mirrors the contract in docs/SPEC.md.
import { api } from "./apiClient";

// Authentication endpoints
export const AuthAPI = {
  me: () => api.get("/api/auth/me"),
};

// Profile endpoints
export const ProfileAPI = {
  get: () => api.get("/api/profile"),
  save: (profile) => api.post("/api/profile", profile),
  update: (profile) => api.post("/api/profile", profile),
  completion: () => api.get("/api/profile/completion"),
};

// Chat Assistant thread/messages endpoints
export const ChatAPI = {
  send: ({ message, chatId }) => api.post("/api/chat", { message, chatId }),
  history: () => api.get("/api/chat/history"),
  get: (id) => api.get(`/api/chat/${id}`),
  remove: (id) => api.del(`/api/chat/${id}`),
};

// Scheme Finder matching and saved recommendations endpoints
export const SchemesAPI = {
  find: (profile) => api.post("/api/schemes", profile),
  save: ({ scheme, profileSnapshot }) =>
    api.post("/api/schemes/save", { scheme, profileSnapshot }),
  saved: () => api.get("/api/schemes/saved"),
  remove: (id) => api.del(`/api/schemes/saved/${id}`),
};

// Document Checklist matching and collection endpoints
export const ChecklistAPI = {
  generate: ({ service }) => api.post("/api/checklist", { service }),
  save: ({ service, checklist }) =>
    api.post("/api/checklist/save", { service, checklist }),
  saved: () => api.get("/api/checklist/saved"),
  remove: (id) => api.del(`/api/checklist/saved/${id}`),
};

// Government Notification Simplifier endpoints
export const SimplifyAPI = {
  run: ({ text }) => api.post("/api/simplify", { text }),
};

// Civic Complaint matching, formatting, and tracking folder endpoints
export const ComplaintAPI = {
  generate: ({ description, location }) =>
    api.post("/api/complaint", { description, location }),
  save: ({ complaint, location }) =>
    api.post("/api/complaint/save", { complaint, location }),
  history: () => api.get("/api/complaint/history"),
  remove: (id) => api.del(`/api/complaint/${id}`),
};

// User Dashboard aggregation endpoints
export const DashboardAPI = {
  summary: () => api.get("/api/dashboard/summary"),
};
