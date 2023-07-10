import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone",
    }),
    integrations: [svelte()],
    site: import.meta.env.PROD
        ? "https://motorsport-cal-v2.netlify.app"
        : "http://localhost:3000",
});
