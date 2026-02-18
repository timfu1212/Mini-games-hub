import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Mini-games-hub/", // ✅ 必須跟 repository 名稱一樣
});
