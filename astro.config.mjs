import { defineConfig } from "astro/config";
import fastify from "@matthewp/astro-fastify";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: fastify({
        logger: false,
        port: 8080,
    }),
    integrations: [svelte()],
    site: import.meta.env.PROD
        ? "https://motorsport-cal-v2.netlify.app"
        : "http://localhost:3000",
    vite: {
        resolve: {
            alias: {
                ".prisma/client/index-browser":
                    "./node_modules/.prisma/client/index-browser.js",
            },
        },
    },
});
