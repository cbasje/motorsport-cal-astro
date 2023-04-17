import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export const get: APIRoute = async () => {
    try {
        let res = [];

        const fileNames = await new Promise<string[]>((res, rej) => {
            fs.readdir("lib/scraper-data", (err, files) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(files);
            });
        });

        for (const f of fileNames) {
            const fileContents = fs.readFileSync(
                path.resolve("lib/scraper-data", f),
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
