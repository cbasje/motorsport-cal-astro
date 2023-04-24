import netlify from "@astrojs/netlify/functions";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import auth from "auth-astro";
import GitHub from "@auth/core/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: netlify(),
    integrations: [
        tailwind(),
        svelte(),
        auth({
            adapter: PrismaAdapter(prisma),
            providers: [
                GitHub({
                    clientId: import.meta.env.GITHUB_CLIENT_ID,
                    clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
                }),
            ],
        }),
    ],
    site: import.meta.env.PROD
        ? "https://motorsport.benjami.in"
        : "http://localhost:3000",
});
