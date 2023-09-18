import svelte from "@astrojs/svelte";
import fastify from "@matthewp/astro-fastify";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: fastify({
        logger: false,
        port: 8080,
    }),
    integrations: [
        svelte(),
        icon({
            include: {
                // FIXME:
                ph: ["*"],
                lucide: ["*"],
                "fluent-emoji-high-contrast": ["*"],
            },
        }),
    ],

    site: import.meta.env.PROD
        ? "https://motorsport-cal-astro.fly.dev"
        : "http://localhost:4321",
    vite: {
        resolve: {
            alias: {
                ".prisma/client/index-browser":
                    "./node_modules/.prisma/client/index-browser.js",
            },
        },
    },
});
