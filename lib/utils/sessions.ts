import type { SessionType } from "lib/types";

export const getSessionTitle = (s: SessionType, number: number) => {
    const titles: Record<SessionType, string> = {
        PRACTICE: `Practice`,
        QUALIFYING: `Qualifying`,
        RACE: `Race`,
        SPRINT: `Sprint`,
        SHAKEDOWN: `Shakedown`,
    };
    return `${titles[s]} ${number > 0 ? number : ""}`;
};
