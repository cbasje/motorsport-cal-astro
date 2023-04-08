import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma-client";
import type { NewRound } from "../../../lib/types";

export const get: APIRoute = async ({ params, request }) => {
    const rounds = await prisma.round.findMany({
        orderBy: { sport: "asc" },
        include: {
            sessions: {
                orderBy: { startDate: "asc" },
            },
            _count: {
                select: { sessions: true },
            },
        },
    });

    return new Response(JSON.stringify(rounds));
};

export const del: APIRoute = async ({ request }) => {
    await prisma.round.deleteMany({});
    return new Response();
};

export const post: APIRoute = async ({ request }) => {
    const body = await request.json();

    if (!body.data) throw new Error("'data' not defined)");

    const data = body.data as NewRound;
    console.info("Adding round:", data.title);

    const round = await prisma.round.upsert({
        create: {
            title: data.title,
            season: data.season,
            sport: data.sport,
            link: data.link,
            circuit: {
                connectOrCreate: {
                    where: {
                        title: data.circuitTitle,
                    },
                    create: {
                        title: data.circuitTitle,
                        // lon: 52.388819444444444,
                        // lat: 4.540922222222222,
                    },
                },
            },
        },
        update: {
            title: data.title,
            season: data.season,
            sport: data.sport,
            link: data.link,
        },
        where: {
            uniqueRoundPerSportSeason: {
                title: data.title,
                season: data.season,
                sport: data.sport,
            },
        },
    });

    return new Response(JSON.stringify(round));
};
