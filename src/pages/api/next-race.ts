import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma-client";

export const get: APIRoute = async () => {
    try {
        const sessions = await prisma.session.findMany({
            orderBy: { startDate: "asc" },
            where: {
                type: "RACE",
                startDate: {
                    gte: new Date(),
                },
            },
            select: {
                startDate: true,
                round: {
                    select: {
                        title: true,
                        series: true,
                    },
                },
            },
        });

        if (!sessions.length)
            return new Response(
                JSON.stringify({
                    success: false,
                    reason: "No 'sessions' found",
                }),
                {
                    status: 404,
                    statusText: "No 'sessions' found",
                }
            );

        return new Response(
            JSON.stringify({
                success: true,
                data: sessions[0],
            })
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, reason: error }), {
            status: 500,
        });
    }
};
