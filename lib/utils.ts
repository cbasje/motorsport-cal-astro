import type { SportId } from "./types";

export const getSeriesTitle = (s: SportId) => {
    const titles: Record<SportId, string> = {
        F1: "Formula 1",
        FE: "Formula E",
        XE: "Extreme E",
        INDY: "Indycar",
        W: "W Series",
        WEC: "WEC",
    };
    return titles[s];
};
