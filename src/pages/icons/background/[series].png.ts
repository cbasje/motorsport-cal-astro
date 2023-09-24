import { icons } from "@iconify-json/fluent-emoji-high-contrast";
import { getIconData, iconToSVG, replaceIDs } from "@iconify/utils";
import type { APIRoute } from "astro";
import sharp from "sharp";
import { createNoise2D } from "simplex-noise";
import type { SeriesId } from "lib/types";
import { getSeriesIcon, getSeriesSecondaryColor } from "lib/utils/series";

// Define the size of the grid
const cols = 4;
const rows = 4;

// Calculate the spacing between points
const spacingX = 400 / cols;
const spacingY = 400 / rows;

const generateGrid = (icons: string[]) => {
    const noise2D = createNoise2D();
    const noiseBetween = (
        x: number,
        y: number,
        max: number = 1,
        min: number = 0
    ) => {
        return ((noise2D(x, y) + 1) / 2) * (max - min) + min;
    };
    const randomBetween = (max: number = 1, min: number = 0) => {
        return Math.random() * (max - min) + min;
    };

    let output = "";
    const iconsData = icons.map((i) => {
        const spaceIndex = i.indexOf(" ");
        let firstPart = i.slice(0, spaceIndex);
        let lastPart = i.slice(spaceIndex + 1, i.length);

        // Make sure that svgs with multiple paths are grouped
        if (firstPart === "<path" && lastPart.indexOf("<path") !== -1) {
            lastPart = `fill="currentColor">${firstPart} ${lastPart}</g>`;
            firstPart = "<g";
        }

        return { firstPart, lastPart };
    });

    // Nested loop to create the grid
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            let xOffset = Math.random() * 32 - 16;
            let yOffset = Math.random() * 32 - 16;

            // Offset every other row/column
            if (y % 2 === 1) xOffset += 32;
            if (x % 2 === 1) yOffset += 32;

            const xPos = x * spacingX + spacingX / 2 + xOffset;
            const yPos = y * spacingY + spacingY / 2 + yOffset;

            const size = noiseBetween(x, y, 96, 48); // Random size between 32 and 80
            const rotate = randomBetween(15, -15);

            // Add path element for the custom SVG path to outpur
            // const randomIndex = Math.floor(Math.random() * iconsData.length);
            const randomIndex = randomBetween(iconsData.length);
            const { firstPart, lastPart } = iconsData.at(randomIndex)!;
            output += `${firstPart} transform="translate(${xPos - size / 2}, ${
                yPos - size / 2
            }) scale(${size / 32}) rotate(${rotate})" ${lastPart}`;
        }
    }

    return output;
};

// Custom HTML generation
const iconsToHTML = (
    body: string[],
    extraAttributes: Record<string, string>
) => {
    const iconGrid = generateGrid(body);
    const attributes: Record<string, string> = {
        ...extraAttributes,
        width: "338",
        height: "338",
        viewBox: "0 0 338 338",
    };

    let renderAttribsHTML = "";
    for (const attr in attributes) {
        renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" ${renderAttribsHTML}>${iconGrid}</svg>`;
};

export const GET: APIRoute = async ({ params }) => {
    const seriesSet = new Set(params.series?.split("-"));
    const series = [...seriesSet];

    if (!series || !series.length)
        return new Response(undefined, {
            status: 404,
        });

    let renderData: string[] = [];

    for (const id of series) {
        const iconId = getSeriesIcon(id as SeriesId);

        // Get content for icon
        const iconData = getIconData(icons, iconId);
        if (!iconData)
            return new Response(`Icon "${iconId}" is missing`, {
                status: 404,
            });

        // Use it to render icon
        const iconRenderData = iconToSVG(iconData, {
            height: "auto",
        });
        renderData.push(iconRenderData.body);
    }

    // Generate SVG string
    const svg = iconsToHTML(
        renderData.map((d) => replaceIDs(d)),
        {
            style: `color: rgba(0,0,0,0.125)`,
        }
    );

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
