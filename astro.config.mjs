import netlify from "@astrojs/netlify/functions";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: netlify(),
    integrations: [tailwind(), svelte()],
    site: import.meta.env.PROD
        ? "https://motorsport-cal-astro.netlify.app"
        : "http://localhost:3000",
});
