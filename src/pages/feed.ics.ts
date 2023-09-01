import type { APIRoute } from "astro";
import { type DateArray, type EventAttributes, createEvents } from "ics";
import type { trpc } from "../../lib/trpc/client";
import { appRouter } from "../../lib/trpc/router";
import { getSeriesEmoji } from "../../lib/utils/series";

const TITLE = "Motorsport Calendar";
const PRODUCT = "benjamiin..";

const getCalDate = (date: Date): DateArray => {
    // const arr = DateTime.fromJSDate(date, { zone: "utc" })
    //     .toFormat("yyyy-M-d-H-m")
    //     .split("-")
    //     .map((s: string) => Number(s));
    return [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
    ];
};

type AllSessions = Awaited<ReturnType<typeof trpc.feed.getAllSessions.query>>;

export const getFeed = async (
    items: AllSessions
): Promise<EventAttributes[]> => {
    let events: EventAttributes[] = [];

    for (const session of items) {
        const { round } = session;
        const { circuit } = round;

        if (!session.startDate || !session.endDate || !round || !circuit) {
            continue;
        }

        const type = session.type ? ` - ${session.type}` : "";
        const number = session.number !== 0 ? ` ${session.number}` : "";
        const title = `${getSeriesEmoji(session.round.series)} ${
            session.round.series
        } ${session.round.title}${type}${number}`;

        events.push({
            calName: TITLE,
            productId: PRODUCT,
            title,
            startInputType: "utc",
            start: getCalDate(session.startDate),
            end: getCalDate(session.endDate),
            description: `It is time for the ${session.round.series} ${
                session.round.title
            }!${
                round.link &&
                ` Watch this race and its sessions via this link: ${round.link}`
            }`,
            // htmlContent:
            // 	'<!DOCTYPE html><html><body><p>This is<br>test<br>html code.</p></body></html>',
            location: round.circuit.title,
            url:
                round.link !== "" && round.link !== null
                    ? round.link
                    : undefined,
            geo:
                circuit.lon && circuit.lat
                    ? { lon: circuit.lon, lat: circuit.lat }
                    : undefined,
        });
    }

    return events;
};

export const GET: APIRoute = async ({ request }) => {
    try {
        const caller = appRouter.createCaller({
            req: request,
            resHeaders: request.headers,
        });
        const sessions = await caller.feed.getAllSessions();

        const events = await getFeed(sessions);
        const feed = await new Promise<string>((resolve, reject) => {
            createEvents(events, (error: Error | undefined, value: string) => {
                if (error) {
                    reject(error);
                    console.error(error);
                }
                resolve(value);
            });
        });

        return new Response(feed, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(null, {
            status: 500,
        });
    }
};
