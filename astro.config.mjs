import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import bun from "./adapter/index";
import db from "@astrojs/db";

// https://astro.build/config
export default defineConfig({
	output: "server",

	adapter: bun({
		port: 3000,
	}),

	integrations: [
		svelte(),
		icon({
			include: {
				"fluent-emoji-high-contrast": [
					"dashing-away",
					"boy",
					"baby",
					"battery",
					"eagle",
					"baby-chick",
					"stopwatch",
					"snow-capped-mountain",
					"girl",
				],
			},
			svgoOptions: {
				plugins: [
					{
						name: "convertColors",
						params: {
							currentColor: true,
						},
					},
				],
			},
		}),
		db(),
	],

	site: import.meta.env.PROD ? "https://porpoise.benjami.in" : "http://localhost:3000",
});
