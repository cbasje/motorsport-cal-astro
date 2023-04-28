import { icons } from "@iconify-json/ph";
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from "@iconify/utils";

export const flattenObject = (obj: Record<string, any>) => {
    return Object.keys(obj).reduce((acc, key) => {
        if (typeof obj[key] === "object" && obj[key] !== null) {
            const flatObject = flattenObject(obj[key]);
            for (const flatKey in flatObject) {
                acc[`${key}.${flatKey}`] = flatObject[flatKey];
            }
        } else {
            acc[key] = obj[key];
        }
        return acc;
    }, {} as Record<string, any>);
};

export const getHtmlForIcon = (iconName: string) => {
    // Get content for icon
    const iconData = getIconData(icons, iconName);
    if (!iconData) {
        throw new Error(`Icon "${iconName}" is missing`);
    }

    // Use it to render icon
    const renderData = iconToSVG(iconData, {
        height: "auto",
    });

    // Generate SVG string
    return iconToHTML(replaceIDs(renderData.body), renderData.attributes);
};
