import type { SessionType } from "lib/types";

export const getSessionTitle = (s: SessionType, number: number) => {
    const titles: Record<SessionType, string> = {
        RACE: `Race`,
        SPRINT: `Sprint`,
        QUALIFYING: `Qualifying`,
        SPRINT_QUALIFYING: `Sprint Qualifying`,
        PRACTICE: `Practice`,
        SHAKEDOWN: `Shakedown`,
    };
    return `${titles[s]} ${number > 0 ? number : ""}`;
};
