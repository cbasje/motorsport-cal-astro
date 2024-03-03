import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: netlify(),
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
	],
});
