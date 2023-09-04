import { icons } from "@iconify-json/fluent-emoji-high-contrast";
import { getIconData, iconToHTML, iconToSVG, replaceIDs } from "@iconify/utils";
import type { APIRoute } from "astro";
import sharp from "sharp";
import type { SeriesId } from "../../../../lib/types";
import { getSeriesColor, getSeriesIcon } from "../../../../lib/utils/series";

export const GET: APIRoute = async ({ params }) => {
    const series = params.series?.split("-");

    if (!series || !series.length)
        return new Response(undefined, {
            status: 404,
        });

    const id = getSeriesIcon(series.at(0) as SeriesId);

    // Get content for icon
    const iconData = getIconData(icons, id);
    if (!iconData)
        return new Response(`Icon "${id}" is missing`, {
            status: 404,
        });

    // Use it to render icon
    const renderData = iconToSVG(iconData, {
        height: "auto",
    });

    // Generate SVG string
    const svg = iconToHTML(replaceIDs(renderData.body), {
        ...renderData.attributes,
        style: `color: ${getSeriesColor(series.at(0) as SeriesId)}`,
    });

    const png = sharp(Buffer.from(svg)).png();
    const response = await png.toBuffer();

    return new Response(response, {
        status: 200,
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
        },
    });
};
