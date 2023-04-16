import type { APIRoute } from "astro";
import prisma from "@/lib/prisma-client";
import type { NewSession } from "@/lib/types";

export const get: APIRoute = async ({ params, request }) => {
    const sessions = await prisma.session.findMany({
        orderBy: { startDate: "desc" },
    });

    return new Response(JSON.stringify(sessions));
};

export const del: APIRoute = async ({ params, request }) => {
    await prisma.session.deleteMany({});
    return new Response();
};

export const post: APIRoute = async ({ params, request }) => {
    const body = await request.json();

    if (!body.data) throw new Error("'data' not defined)");

    const data = body.data as NewSession[];
    console.info("Adding %d sessions...", data.length);

    const sessions = await Promise.all(
        data.map(async (row: NewSession) => {
            return await prisma.session.upsert({
                create: {
                    type: row.type,
                    number: row.number,
                    roundId: row.roundId,
                    startDate: row.startDate,
                    endDate: row.endDate,
                },
                update: {
                    type: row.type,
                    number: row.number,
                    roundId: row.roundId,
                    startDate: row.startDate,
                    endDate: row.endDate,
                },
                where: {
                    uniqueSessionPerRoundId: {
                        type: row.type,
                        number: row.number,
                        roundId: row.roundId,
                    },
                },
            });
        })
    );

    return new Response(JSON.stringify(sessions));
};
