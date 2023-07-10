import type { DefineFastifyRoutes } from "@matthewp/astro-fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defineRoutes: DefineFastifyRoutes = (fastify) => {
    fastify.get("/fastify", async (request, response) => {
        const data = await prisma.listItem.findMany({});

        response.send(data);
    });
};

export default defineRoutes;
