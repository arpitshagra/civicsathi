import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev server runs on 5173 (matches the backend CORS_ORIGINS default in the plan).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
