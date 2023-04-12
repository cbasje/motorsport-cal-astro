import { SessionType } from "@prisma/client";
import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma-client";

export const get: APIRoute = async ({ params, request }) => {
    try {
        const sessions = await prisma.session.findMany({
            orderBy: { startDate: "desc" },
            select: {
                type: true,
                startDate: true,
                round: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        if (!sessions.length)
            return new Response(JSON.stringify({ date: null }), {
                status: 404,
                statusText: "No 'sessions' found",
            });

        const filteredSessions = sessions
            .filter(
                (s) =>
                    s.type == SessionType.RACE &&
                    new Date(s.startDate) > new Date()
            )
            .sort(
                (a, b) =>
                    new Date(a.startDate).getTime() -
                    new Date(b.startDate).getTime()
            );

        if (!filteredSessions.length)
            return new Response(JSON.stringify({ date: null }), {
                status: 404,
                statusText: "No suitable 'sessions' found",
            });

        return new Response(
            JSON.stringify({
                success: true,
                date: filteredSessions[0].startDate,
                title: filteredSessions[0].round.title,
            })
        );
    } catch (error) {
        return new Response(JSON.stringify({ success: false }), {
            status: 500,
        });
    }
};
