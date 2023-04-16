import type { SeriesId } from "./types";

export const getSeriesIcon = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "dashing-away",
        FE: "battery",
        XE: "low-battery",
        INDY: "eagle",
        W: "woman",
        WEC: "stopwatch",
    };
    return titles[s];
};

export const getSeriesTitle = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "Formula 1",
        FE: "Formula E",
        XE: "Extreme E",
        INDY: "Indycar",
        W: "W Series",
        WEC: "WEC",
    };
    return titles[s];
};

export const getSeriesColour = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "#E10500",
        FE: "#0000FF",
        XE: "#03FD9D",
        INDY: "#0086BF",
        W: "#440099",
        WEC: "#01A0F6",
    };
    return titles[s];
};
