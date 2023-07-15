const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;

const trackTime = (date: Date) => {
    return 0;
};

const yourTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
};

const relTime = (date: Date) => {
    const rel = date.valueOf() - Date.now();
    const relTimeFormat = new Intl.RelativeTimeFormat("en-GB", {
        style: "long",
        numeric: "auto",
    });

    if (Math.abs(rel) > week) {
        return relTimeFormat.format(Math.floor(rel / week), "week");
    } else if (Math.abs(rel) > day) {
        return relTimeFormat.format(Math.floor(rel / day), "day");
    } else if (Math.abs(rel) > hour) {
        return relTimeFormat.format(Math.floor(rel / hour), "hour");
    } else if (Math.abs(rel) > minute) {
        return relTimeFormat.format(Math.floor(rel / minute), "minute");
    }
};

const getWeekend = (weekOffset = 0) => {
    const now = new Date();

    const lastMonday = new Date();
    const nextMonday = new Date();

    const day = now.getDay();
    const diff = (day + 7 - 1) % 7; // Calculate the difference from Monday (1) to the current day

    lastMonday.setDate(now.getDate() - diff + 7 * weekOffset);
    nextMonday.setDate(lastMonday.getDate() + 7);

    lastMonday.setHours(12, 0, 0, 0);
    nextMonday.setHours(12, 0, 0, 0);

    return [lastMonday, nextMonday];
};

export { trackTime, yourTime, relTime, getWeekend };
