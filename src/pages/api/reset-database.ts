import type { APIRoute } from "astro";
import prisma from "@/lib/prisma-client";

export const get: APIRoute = async ({ request }) => {
    try {
        const params = new URL(request.url).searchParams;
        const sure = params.get("sure") === "true";

        if (!sure)
            return new Response(
                JSON.stringify({
                    success: false,
                    reason: "Not 'sure'",
                }),
                {
                    status: 400,
                    statusText: "Not 'sure'",
                }
            );

        await prisma.session.deleteMany();
        await prisma.round.deleteMany();
        await prisma.circuit.deleteMany();

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
