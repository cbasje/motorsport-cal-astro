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
        INDY: "IndyCar",
        WEC: "WEC",
        F1A: "F1 Academy",
    };
    return titles[s];
};

export const getSeriesTitleShort = (s: SeriesId) => {
    const titles: Record<SeriesId, string> = {
        F1: "F1",
        F2: "F2",
        F3: "F3",
        FE: "FE",
        INDY: "Indy",
        WEC: "WEC",
        F1A: "F1A",
    };
    return titles[s];
};

export const getSeriesColor = (s: SeriesId) => {
    const colors: Record<SeriesId, string> = {
        F1: "#F75B65",
        F2: "#00A2FE",
        F3: "#BC70EE",
        FE: "#6C8DFE",
        INDY: "#00BAA8",
        WEC: "#60B01A",
        F1A: "#E95DA9",
    };
    return colors[s];
};
