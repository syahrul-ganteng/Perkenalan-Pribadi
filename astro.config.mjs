import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  publicDir: "./image",
  vite: {
    plugins: [tailwindcss()]
  }
});