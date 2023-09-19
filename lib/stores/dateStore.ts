import { atom } from "nanostores";

type TimeFormat = "track" | "your" | "rel";
export const timeFormat = atom<TimeFormat>("your");

export const cycleTimeFormat = () => {
    const curr = timeFormat.get();
    switch (curr) {
        case "your":
            timeFormat.set("track");
            break;
        case "track":
            timeFormat.set("rel");
            break;
        default:
            timeFormat.set("your");
            break;
    }
};
