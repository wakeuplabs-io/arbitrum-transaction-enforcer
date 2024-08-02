import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'


// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    TanStackRouterVite(),
    react(), 
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
