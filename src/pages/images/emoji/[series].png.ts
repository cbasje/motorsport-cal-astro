import type { SeriesId } from "$db/types";
import { CustomError, errorRes, imageRes } from "$lib/utils/response";
import { getSeriesColor, getSeriesIcon } from "$lib/utils/series";
import { icons } from "@iconify-json/fluent-emoji-high-contrast";
import { getIconData, iconToHTML, iconToSVG, replaceIDs } from "@iconify/utils";
import type { APIRoute } from "astro";
import sharp from "sharp";

export const GET: APIRoute = async ({ params }) => {
	const seriesSet = new Set(params.series?.split("-"));
	const series = [...seriesSet];

	if (!series || !series.length) return errorRes(new CustomError("No series found", 400));

	const id = getSeriesIcon(series.at(0) as SeriesId);

	// Get content for icon
	const iconData = getIconData(icons, id);
	if (!iconData) return errorRes(new CustomError(`Icon '${id}' is missing`, 400));

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
	const buffer = await png.toBuffer();

	return imageRes(buffer);
};
