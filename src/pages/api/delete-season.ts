import type { APIRoute } from "astro";
import prisma from "@/lib/prisma-client";

export const get: APIRoute = async ({ request }) => {
    try {
        const params = new URL(request.url).searchParams;
        const year = params.get("year");
        const includeCurrent = params.get("include_current") === "true";

        if (!year)
            return new Response(
                JSON.stringify({
                    success: false,
                    reason: "No 'year' param included",
                }),
                {
                    status: 400,
                    statusText: "No 'year' param included",
                }
            );

        const sessions = await prisma.session.deleteMany({
            where: {
                round: {
                    AND: {
                        season: {
                            contains: year,
                            not: includeCurrent
                                ? {
                                      contains: String(
                                          new Date().getFullYear()
                                      ),
                                  }
                                : undefined,
                        },
                    },
                },
            },
        });

        if (!sessions.count)
            return new Response(
                JSON.stringify({ success: false, reason: "Nothing deleted" }),
                {
                    status: 500,
                    statusText: "Nothing deleted",
                }
            );

        return new Response(
            JSON.stringify({
                success: true,
            })
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ success: false, reason: error }), {
            status: 500,
        });
    }
};
