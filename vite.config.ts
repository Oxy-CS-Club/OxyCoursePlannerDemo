import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Port 5280 is used on purpose: common ports (5000, 5173, 8000, 9000...) are
// often taken by other local tools. strictPort makes Vite fail loudly instead
// of silently picking another port. Change both here and in compose.yaml.
const PORT = Number(process.env.PORT ?? 5280);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: PORT,
    strictPort: true,
    // File-change events don't always cross Docker bind mounts; poll instead.
    watch: { usePolling: process.env.VITE_USE_POLLING === "true", interval: 300 },
  },
  preview: { host: true, port: PORT + 1, strictPort: true },
});
