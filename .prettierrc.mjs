/** @type {import("prettier").Config} */
export default {
	useTabs: true,
	tabWidth: 4,
	singleQuote: false,
	trailingComma: "es5",
	printWidth: 100,
	plugins: ["prettier-plugin-astro", "prettier-plugin-svelte"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
		{ files: "*.svelte", options: { parser: "svelte" } },
	],
};
