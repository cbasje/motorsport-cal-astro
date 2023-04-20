import type { SeriesId } from "./types";

export const getSeriesIcon = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "dashing-away",
        F2: "boy",
        FE: "battery",
        XE: "low-battery",
        INDY: "eagle",
        W: "woman",
        WEC: "stopwatch",
        F1A: "girl",
    };
    return titles[s];
};

export const getSeriesEmoji = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "💨",
        F2: "👦🏻",
        FE: "🔋",
        XE: "🪫",
        INDY: "🦅",
        W: "👩🏻",
        WEC: "⏱️",
        F1A: "👧🏻",
    };
    return titles[s];
};

export const getSeriesTitle = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "Formula 1",
        F2: "Formula 2",
        FE: "Formula E",
        XE: "Extreme E",
        INDY: "Indycar",
        W: "W Series",
        WEC: "WEC",
        F1A: "F1 Academy",
    };
    return titles[s];
};

export const getSeriesColour = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "#E10500",
        F2: "#0090D0",
        FE: "#0000FF",
        XE: "#03FD9D",
        INDY: "#0086BF",
        W: "#440099",
        WEC: "#01A0F6",
        F1A: "#BE107E",
    };
    return titles[s];
};

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
