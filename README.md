# [Motorsport calendar](https://motorsport.benjami.in/)

This is a website that shows motorsport events from around the world. Currently, it is a list with interactive filtering and a countdown but the plan is to expand on this in the future.

## Stack

-   Site generator: [Astro](https://astro.build/)
-   Interactive framework: [Svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/)
-   Deployment: [Fly.io](https://fly.io/)
-   Styling: [SCSS](https://sass-lang.com/documentation/syntax) + [open-props](https://open-props.style/)
-   Icons: [Phosphor Icons](https://phosphoricons.com/)
-   Server: [tRPC](https://trpc.io/)

## Development

| Command             | Action                                           |
| :------------------ | :----------------------------------------------- |
| `yarn`              | Installs dependencies                            |
| `yarn dev`          | Starts local dev server at `localhost:3000`      |
| `yarn build`        | Builds production site to `./dist/`              |
| `yarn astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `yarn astro --help` | Get help using the Astro CLI                     |
