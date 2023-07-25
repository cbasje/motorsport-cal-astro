import { TRPCError, initTRPC } from "@trpc/server";
import { SeriesIdZ, seriesIds } from "../../../lib/types";
import superjson from "superjson";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { NewCircuitZ, NewRoundZ, NewSessionZ } from "../../../lib/types/api";
import { CircuitZ } from "../../../lib/types/prisma";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const logger = middleware(async ({ path, type, next }) => {
    const start = Date.now();
    const result = await next();
    const ms = Date.now() - start;
    console.log(`tRPC ${result.ok ? "✅" : "🚨"} ${type} ${path} - ${ms}ms`);
    return result;
});

// const auth = middleware(async ({ ctx, next }) => {
//     if (!ctx.user) {
//         throw new TRPCError({ code: "UNAUTHORIZED" });
//     }
//     return next({
//         ctx: {
//             user: ctx.user,
//         },
//     });
// });

const circuits = router({
    getOne: publicProcedure
        .use(logger)
        .input(z.string())
        .query(({ input }) =>
            prisma.circuit.findFirst({
                where: { id: input },
                include: {
                    rounds: true,
                    _count: {
                        select: { rounds: true },
                    },
                },
            })
        ),

    getAll: publicProcedure.use(logger).query(() =>
        prisma.circuit.findMany({
            orderBy: { created_at: "asc" },
            include: {
                rounds: true,
                _count: {
                    select: { rounds: true },
                },
            },
        })
    ),

    deleteAll: publicProcedure
        .use(logger)
        .mutation(() => prisma.circuit.deleteMany({})),

    createCircuit: publicProcedure
        .use(logger)
        .input(NewCircuitZ)
        .mutation(({ input }) =>
            prisma.circuit.create({
                data: input,
            })
        ),

    updateMultiple: publicProcedure
        .use(logger)
        .input(z.array(CircuitZ))
        .mutation(({ input }) =>
            Promise.all(
                input.map(async (row) => {
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
            )
        ),
});

const rounds = router({
    getOne: publicProcedure
        .use(logger)
        .input(z.string())
        .query(({ input }) =>
            prisma.round.findFirst({
                where: { id: input },
                include: {
                    circuit: true,
                    sessions: {
                        orderBy: { startDate: "asc" },
                    },
                    _count: {
                        select: { sessions: true },
                    },
                },
            })
        ),

    getAll: publicProcedure.use(logger).query(() =>
        prisma.round.findMany({
            orderBy: { series: "asc" },
            include: {
                sessions: {
                    orderBy: { startDate: "asc" },
                },
                _count: {
                    select: { sessions: true },
                },
            },
        })
    ),

    deleteAll: publicProcedure
        .use(logger)
        .mutation(() => prisma.round.deleteMany({})),

    create: publicProcedure
        .use(logger)
        .input(NewRoundZ)
        .mutation(({ input }) =>
            prisma.round.upsert({
                create: {
                    title: input.title,
                    number: input.number,
                    season: input.season,
                    series: input.series,
                    link: input.link,
                    circuit: {
                        connectOrCreate: {
                            where: {
                                title: input.circuitTitle,
                            },
                            create: {
                                title: input.circuitTitle,
                            },
                        },
                    },
                },
                update: {
                    title: input.title,
                    number: input.number,
                    season: input.season,
                    series: input.series,
                    link: input.link,
                },
                where: {
                    uniqueRoundPerSeriesSeason: {
                        title: input.title,
                        number: input.number,
                        season: input.season,
                        series: input.series,
                    },
                },
            })
        ),

    getAllRaces: publicProcedure.use(logger).query(() =>
        prisma.session.findMany({
            orderBy: { startDate: "asc" },
            where: {
                type: "RACE",
            },
            select: {
                id: true,
                startDate: true,
                endDate: true,
                round: {
                    select: {
                        title: true,
                        series: true,
                    },
                },
            },
        })
    ),

    getNextRaces: publicProcedure
        .use(logger)
        .input(z.optional(z.array(SeriesIdZ)))
        .query(({ input }) =>
            Promise.all(
                (input ?? seriesIds).map((series) =>
                    prisma.session.findFirst({
                        orderBy: { startDate: "asc" },
                        where: {
                            type: "RACE",
                            endDate: {
                                gte: new Date(),
                            },
                            round: {
                                series,
                            },
                        },
                        select: {
                            startDate: true,
                            endDate: true,
                            round: {
                                select: {
                                    title: true,
                                    series: true,
                                },
                            },
                        },
                    })
                )
            )
        ),

    getWeekends: publicProcedure
        .input(z.object({ startDate: z.date(), endDate: z.date() }))
        .query(({ input }) =>
            prisma.round.findMany({
                orderBy: { startDate: "asc" },
                where: {
                    sessions: {
                        some: {
                            AND: {
                                startDate: { gte: input.startDate },
                                endDate: { lte: input.endDate },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    title: true,
                    series: true,
                    sessions: {
                        orderBy: { startDate: "asc" },
                        select: {
                            type: true,
                            startDate: true,
                            endDate: true,
                            number: true,
                        },
                    },
                    circuit: {
                        select: {
                            wikipediaTitle: true,
                        },
                    },
                },
            })
        ),
});

const sessions = router({
    getOne: publicProcedure
        .use(logger)
        .input(z.string())
        .query(({ input }) =>
            prisma.session.findFirst({
                where: { id: input },
            })
        ),

    getAll: publicProcedure.use(logger).query(() =>
        prisma.session.findMany({
            orderBy: { startDate: "desc" },
        })
    ),

    deleteAll: publicProcedure
        .use(logger)
        .mutation(() => prisma.session.deleteMany({})),

    create: publicProcedure
        .use(logger)
        .input(NewSessionZ)
        .mutation(({ input }) =>
            prisma.session.upsert({
                create: {
                    type: input.type,
                    number: input.number,
                    roundId: input.roundId,
                    startDate: input.startDate,
                    endDate: input.endDate,
                },
                update: {
                    type: input.type,
                    number: input.number,
                    roundId: input.roundId,
                    startDate: input.startDate,
                    endDate: input.endDate,
                },
                where: {
                    uniqueSessionPerRoundId: {
                        type: input.type,
                        number: input.number,
                        roundId: input.roundId,
                    },
                },
            })
        ),
});

const feed = router({
    getAllSessions: publicProcedure.use(logger).query(() =>
        prisma.session.findMany({
            include: {
                round: {
                    include: {
                        circuit: true,
                    },
                },
            },
        })
    ),
});

export const appRouter = router({
    circuits,
    rounds,
    sessions,
    feed,
});

// export type definition of API
export type AppRouter = typeof appRouter;
