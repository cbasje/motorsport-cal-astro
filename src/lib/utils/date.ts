const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;
const week = 7 * day;

export const trackTime = (timeZone: string, start: Date, end?: Date) => {
	// FIXME: language
	const trackTimeFormat = new Intl.DateTimeFormat("en-GB", {
		weekday: "short",
		hour: "numeric",
		minute: "numeric",
		timeZone,
	});

	if (end) {
		return trackTimeFormat.formatRange(start, end);
	} else {
		return trackTimeFormat.format(start);
	}
};

export const yourTime = (start: Date, end?: Date) => {
	// FIXME: language
	const yourTimeFormat = new Intl.DateTimeFormat("en-GB", {
		weekday: "short",
		hour: "numeric",
		minute: "numeric",
	});

	if (end) {
		return yourTimeFormat.formatRange(start, end);
	} else {
		return yourTimeFormat.format(start);
	}
};

export const relTime = (date: Date, now: number) => {
	const rel = date.valueOf() - now;
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

export const getWeekendDates = (weekOffset = 0) => {
	const now = new Date();

	const lastMonday = new Date();
	const nextMonday = new Date();

	const day = now.getDay();
	const diff = (day + 7 - 1) % 7; // Calculate the difference from Monday (1) to the current day

	lastMonday.setDate(now.getDate() - diff + 7 * weekOffset);
	nextMonday.setDate(now.getDate() - diff + 7 * (weekOffset + 1));

	lastMonday.setHours(12, 0, 0, 0);
	nextMonday.setHours(12, 0, 0, 0);

	return [lastMonday, nextMonday];
};
