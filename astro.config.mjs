import netlify from "@astrojs/netlify/functions";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: netlify(),
    integrations: [svelte()],
    site: import.meta.env.PROD
        ? "https://motorsport-cal-astro.netlify.app"
        : "http://localhost:3000",
});
