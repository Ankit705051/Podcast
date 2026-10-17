import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/@react-three/")) return "react-three";
          if (id.includes("/three-stdlib/") || id.includes("/maath/")) return "three-tools";
          if (id.includes("/three/")) return "three";
          if (id.includes("/framer-motion/") || id.includes("/motion-dom/") || id.includes("/motion-utils/")) return "motion";
          if (id.includes("/gsap/")) return "gsap";
          if (id.includes("/lucide-react/")) return "icons";
          if (id.includes("/react-router/") || id.includes("/react-router-dom/")) return "router";
          if (id.includes("/react-dom/") || id.includes("/scheduler/") || /\/react\//.test(id)) return "react";
        },
      },
    },
  },
});
