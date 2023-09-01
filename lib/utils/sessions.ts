import type { SeriesId, SessionType } from "lib/types";

type TitleRecords = Record<SessionType, string>;
export const getSessionTitle = (
    series: SeriesId,
    s: SessionType,
    number: number
) => {
    const feederTitles: TitleRecords = {
        R: "Feature Race",
        S: "Sprint Race",
        Q: "Qualifying",
        SQ: "",
        FP: "Practice",
        T: "Shakedown",
    };
    const defaultTitles: TitleRecords = {
        R: "Race",
        S: "Sprint",
        Q: "Qualifying",
        SQ: "Sprint Qualifying",
        FP: "Practice",
        T: "Shakedown",
    };

    if (series === "F2" || series === "F3") {
        return `${feederTitles[s]} ${number > 0 ? number : ""}`;
    } else {
        return `${defaultTitles[s]} ${number > 0 ? number : ""}`;
    }
};
