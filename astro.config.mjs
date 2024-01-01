import svelte from "@astrojs/svelte";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import bun from "./adapter/index";

export default defineConfig({
	output: "server",
	adapter: bun({
		port: 3000,
	}),

	integrations: [
		svelte(),
		icon({
			include: {
				// FIXME:
				// ph: ["*"],
				// lucide: ["*"],
				"fluent-emoji-high-contrast": ["*"],
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

	site: import.meta.env.PROD
		? "https://motorsport-cal-astro.fly.dev"
		: "http://localhost:3000",
});
