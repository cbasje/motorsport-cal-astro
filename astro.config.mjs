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
		? "https://motorsport.benjami.in"
		: "http://localhost:3000",
});
