import { trpc } from "../src/pages/client";
import type {
    CircuitTitle,
    CircuitWikipedia,
    WikipediaData,
} from "./types/wikipedia";

export const main = async () => {
    try {
        console.time("scrape");
        const res = await scrape();
        console.timeEnd("scrape");

        await trpc.scraper.saveWikipediaData.mutate(res);
    } catch (error) {
        console.error("🚨 main()", error);
    }
};

const scrape = async (): Promise<CircuitWikipedia[]> => {
    const titles: CircuitTitle[] = await trpc.scraper.getAllCircuits.query();

    let response: CircuitWikipedia[] = [];
    for await (const t of titles) {
        const params = new URLSearchParams({
            action: "query",
            prop: "coordinates",
            format: "json",
            formatversion: "2",
            origin: "*",
            generator: "search",
            gsrsearch: t.title,
            gsrnamespace: "0",
            gsrlimit: "5",
        });
        const url = new URL(
            "w/api.php?" + params.toString(),
            "https://en.wikipedia.org"
        );

        try {
            const res = await fetch(url);
            const data: WikipediaData = await res.json();

            if (data.query.pages) {
                const firstPage = data.query.pages
                    .filter((p) => p.coordinates)
                    .sort((a, b) => a.index - b.index)[0];

                if (!firstPage) continue;

                const coordinates = firstPage.coordinates
                    ? firstPage.coordinates[0]
                    : undefined;

                response.push({
                    id: t.id,
                    wikipediaPageId: firstPage.pageid,
                    lat: coordinates?.lat ?? null,
                    lon: coordinates?.lon ?? null,
                });
            }
        } catch (error) {
            console.error("🚨 scrape() '%s':", t, error);
        }
    }

    return response;
};
