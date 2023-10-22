import node from "@astrojs/node";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

export default defineConfig({
    output: "server",
    adapter: node({
        mode: "standalone",
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
