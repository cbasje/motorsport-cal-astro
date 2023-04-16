import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma-client";

export const get: APIRoute = async () => {
    try {
        const session = await prisma.session.findFirst({
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

        if (!session)
            return new Response(
                JSON.stringify({
                    success: false,
                    reason: "No 'session' found",
                }),
                {
                    status: 404,
                    statusText: "No 'session' found",
                }
            );

        return new Response(
            JSON.stringify({
                success: true,
                data: session,
            })
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, reason: error }), {
            status: 500,
        });
    }
};
