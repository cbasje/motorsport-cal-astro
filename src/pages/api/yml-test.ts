import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "path";
import yaml from "js-yaml";

export const get: APIRoute = async () => {
    try {
        let res = [];

        const t = await fs.readdir(".");
        console.log(process.cwd(), t);
        // console.log(process.cwd(), path.relative(".", "./lib/scraper-data"));

        const fileNames = await fs.readdir("./lib/scraper-data");
        for (const f of fileNames) {
            const fileContents = await fs.readFile(
                path.resolve("./lib/scraper-data", f),
                "utf-8"
            );
            const data = yaml.load(fileContents, {
                onWarning: (error) => {
                    throw error;
                },
            });

            res.push(data);
        }

        return new Response(
            JSON.stringify({
                success: true,
                data: res,
            })
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, reason: error }), {
            status: 500,
        });
    }
};
