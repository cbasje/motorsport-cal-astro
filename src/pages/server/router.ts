import { TRPCError, initTRPC } from "@trpc/server";
import { NewCircuitZ, NewRoundZ, NewSessionZ } from "lib/types/api";
import { CircuitZ } from "lib/types/prisma";
import { CircuitWikipediaZ } from "lib/types/wikipedia";
import superjson from "superjson";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
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

    getNextRace: publicProcedure.use(logger).query(() =>
        prisma.session.findFirst({
            orderBy: { startDate: "asc" },
            where: {
                type: "RACE",
                endDate: {
                    gte: new Date(),
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
    ),
});

const sessions = router({
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

const database = router({
    reset: publicProcedure
        .use(logger)
        .input(z.object({ sure: z.boolean() }))
        .mutation(async ({ input }) => {
            if (!input.sure)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: '"sure" is required',
                });

            await prisma.session.deleteMany();
            await prisma.round.deleteMany();
            await prisma.circuit.deleteMany();
        }),

    deleteSeason: publicProcedure
        .use(logger)
        .input(z.object({ year: z.string(), includeCurrent: z.boolean() }))
        .mutation(async ({ input }) => {
            if (!input.year)
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: '"year" is required',
                });

            const sessions = await prisma.session.deleteMany({
                where: {
                    round: {
                        AND: {
                            season: {
                                contains: input.year,
                                not: input.includeCurrent
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
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Nothing deleted",
                });
        }),
});

const scraper = router({
    getAllCircuits: publicProcedure.use(logger).query(() =>
        prisma.circuit.findMany({
            select: {
                id: true,
                title: true,
            },
        })
    ),

    saveRound: publicProcedure
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

    saveSessions: publicProcedure
        .use(logger)
        .input(z.array(NewSessionZ))
        .mutation(({ input }) =>
            Promise.all(
                input.map(async (row) => {
                    await prisma.session.upsert({
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
            )
        ),

    saveWikipediaData: publicProcedure
        .use(logger)
        .input(z.array(CircuitWikipediaZ))
        .mutation(({ input }) =>
            Promise.all(
                input.map(async (row) => {
                    await prisma.circuit.update({
                        data: {
                            lat: row.lat,
                            lon: row.lon,
                            wikipediaPageId: row.wikipediaPageId,
                        },
                        where: {
                            id: row.id,
                        },
                    });
                })
            )
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
    database,
    scraper,
    feed,
});

// export type definition of API
export type AppRouter = typeof appRouter;
