import type { Circuit, Round, Session } from "@prisma/client";
import type { APIRoute } from "astro";
import { DateArray, EventAttributes, createEvents } from "ics";
import { getSeriesEmoji } from "lib/utils";
import prisma from "../../lib/prisma-client";

const TITLE = "Motorsport Calendar";
const PRODUCT = "benjamiin..";

const getCalDate = (date: Date): DateArray => {
    // const date = new Date(dateString);
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

export type FeedSession = Session & { round: Round & { circuit: Circuit } };
export const getFeed = async (
    items: FeedSession[]
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
            description: `It is time for the ${title}!${
                round.link &&
                ` Watch this race and its sessions via this link: ${round.link}`
            }`,
            // htmlContent:
            // 	'<!DOCTYPE html><html><body><p>This is<br>test<br>html code.</p></body></html>',
            location: round.circuit.title,
            url: round.link ?? undefined,
            geo:
                circuit.lon && circuit.lat
                    ? { lon: circuit.lon, lat: circuit.lat }
                    : undefined,
        });
    }

    return events;
};

export const get: APIRoute = async ({ params, request }) => {
    try {
        const sessions = await prisma.session.findMany({
            include: {
                round: {
                    include: {
                        circuit: true,
                    },
                },
            },
        });

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
