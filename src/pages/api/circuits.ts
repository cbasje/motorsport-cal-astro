import type { Circuit } from "@prisma/client";
import type { APIRoute } from "astro";
import prisma from "@/lib/prisma-client";
import type { NewCircuit } from "@/lib/types";

export const get: APIRoute = async ({ params, request }) => {
    const circuits = await prisma.circuit.findMany({
        orderBy: { created_at: "asc" },
        include: {
            rounds: true,
            _count: {
                select: { rounds: true },
            },
        },
    });

    return new Response(JSON.stringify(circuits));
};

export const patch: APIRoute = async ({ params, request }) => {
    const body = await request.json();

    if (!body.data) throw new Error("'data' not defined)");

    const data = body.data as Circuit[];
    console.info("Updating %d circuits...", data.length);

    const circuits = await Promise.all(
        data.map(async (row: Circuit) => {
            return await prisma.circuit.update({
                data: {
                    wikipediaPageId: row.wikipediaPageId,
                    lat: row.lat,
                    lon: row.lon,
                },
                where: {
                    id: row.id,
                },
            });
        })
    );

    return new Response(JSON.stringify(circuits));
};

export const del: APIRoute = async ({ params, request }) => {
    await prisma.circuit.deleteMany({});
    return new Response();
};

export const post: APIRoute = async ({ params, request }) => {
    const body = await request.json();

    if (!body.data) throw new Error("'data' not defined)");

    const data = body.data as NewCircuit;
    const circuit = await prisma.circuit.create({
        data,
    });

    return new Response(JSON.stringify(circuit));
};
