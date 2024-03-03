import * as feed from "$db/feed-repository";
import { createEvents, type DateArray, type EventAttributes } from "ics";
import { getSeriesEmoji } from "./series";
import { getSessionTitle } from "./sessions";

type Session = Awaited<ReturnType<typeof feed.getAllSessions>>[number];

const TITLE = "Porpoise Motorsport Calendar";
const PRODUCT = "benjamiin..";

const getCalDate = (date: Date): DateArray => {
	return [
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
	];
};

export const generateFeed = async (items: Session[]): Promise<string> => {
	let events: EventAttributes[] = [];

	for (const session of items) {
		if (!session.start || !session.end) {
			continue;
		}

		const type = getSessionTitle(session.series, session.type, session.number);
		const title = `${getSeriesEmoji(session.series)} ${session.series} ${
			session.roundTitle
		} - ${type}`;

		events.push({
			calName: TITLE,
			productId: PRODUCT,
			title,
			startInputType: "utc",
			start: getCalDate(session.start),
			end: getCalDate(session.end),
			description: `It is time for the ${session.series} ${session.roundTitle}!${
				session.link && ` Watch this race and its sessions via this link: ${session.link}`
			}`,
			// htmlContent:
			// 	'<!DOCTYPE html><html><body><p>This is<br>test<br>html code.</p></body></html>',
			location: session.circuitTitle || undefined,
			url: session.link || undefined,
			geo: session.lon && session.lat ? { lon: session.lon, lat: session.lat } : undefined,
		});
	}

	const feed = await new Promise<string>((resolve, reject) => {
		createEvents(events, (error: Error | undefined, value: string) => {
			if (error) {
				reject(error);
				console.error(error);
			}
			resolve(value);
		});
	});

	return feed;
};
