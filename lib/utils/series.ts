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
    const titles: Record<SeriesId, string> = {
        F1: "#F1545C",
        F2: "#0097FF",
        F3: "#B266ED",
        FE: "#6481FF",
        INDY: "#00B19D",
        WEC: "#59A610",
        F1A: "#E255A0",
    };
    return titles[s];
};
