import type { Circuit, Round, Session } from "@prisma/client";
import type { APIRoute } from "astro";
import { DateArray, EventAttributes, createEvents } from "ics";
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
        if (
            !session.startDate ||
            !session.endDate ||
            !session.round ||
            !session.round.circuit
        ) {
            continue;
        }

        const type = session.type ? ` - ${session.type}` : "";
        const number = session.number !== 0 ? ` ${session.number}` : "";
        const title = `${session.round.sport} ${session.round.title}${type}${number}`;

        events.push({
            calName: TITLE,
            productId: PRODUCT,
            title,
            startInputType: "utc",
            start: getCalDate(session.startDate),
            end: getCalDate(session.endDate),
            description: `It is time for the ${title}!${
                session.round.link &&
                ` Watch this race and its sessions via this link: ${session.round.link}`
            }`,
            // htmlContent:
            // 	'<!DOCTYPE html><html><body><p>This is<br>test<br>html code.</p></body></html>',
            location: session.round.circuit.title,
            url: session.round.link ?? "",
            // geo:
            //     session.round.circuit.lon && session.round.circuit.lat
            //         ? session.round.circuit
            //         : null,
        });
    }

    return events;
};

export const get: APIRoute = async ({ params, request }) => {
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
};
