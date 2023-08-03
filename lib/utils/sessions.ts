import type { SeriesId, SessionType } from "lib/types";

type TitleRecords = Record<SessionType, string>;
export const getSessionTitle = (
    series: SeriesId,
    s: SessionType,
    number: number
) => {
    const feederTitles: TitleRecords = {
        RACE: "Feature Race",
        SPRINT: "Sprint Race",
        QUALIFYING: "Qualifying",
        SPRINT_QUALIFYING: "",
        PRACTICE: "Practice",
        SHAKEDOWN: "Shakedown",
    };
    const defaultTitles: TitleRecords = {
        RACE: "Race",
        SPRINT: "Sprint",
        QUALIFYING: "Qualifying",
        SPRINT_QUALIFYING: "Sprint Qualifying",
        PRACTICE: "Practice",
        SHAKEDOWN: "Shakedown",
    };

    if (series === "F2" || series === "F3") {
        return `${feederTitles[s]} ${number > 0 ? number : ""}`;
    } else {
        return `${defaultTitles[s]} ${number > 0 ? number : ""}`;
    }
};
