import type { SeriesId } from "../types";

export const getSeriesIcon = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "dashing-away",
        F2: "boy",
        F3: "baby",
        FE: "battery",
        INDY: "eagle",
        WEC: "stopwatch",
        F1A: "girl",
    };
    return titles[s];
};

export const getSeriesEmoji = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "💨",
        F2: "👦🏻",
        F3: "👶🏻",
        FE: "🔋",
        INDY: "🦅",
        WEC: "⏱️",
        F1A: "👧🏻",
    };
    return titles[s];
};

export const getSeriesTitle = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "Formula 1",
        F2: "Formula 2",
        F3: "Formula 3",
        FE: "Formula E",
        INDY: "Indycar",
        WEC: "WEC",
        F1A: "F1 Academy",
    };
    return titles[s];
};

export const getSeriesColour = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "#E10500",
        F2: "#0090D0",
        F3: "#440099",
        FE: "#0000FF",
        INDY: "#01A0F6",
        WEC: "#03FD9D",
        F1A: "#BE107E",
    };
    return titles[s];
};
