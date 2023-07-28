import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import type { Context } from "./server";
import { prisma } from "../prisma";
import { SeriesIdZ, seriesIds } from "../types";
import { NewCircuitZ, NewRoundZ, NewSessionZ } from "../types/api";
import { CircuitZ } from "../types/prisma";

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});

export const router = t.router;
const middleware = t.middleware;
const publicProcedure = t.procedure;

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
const logger = middleware(async ({ path, type, next }) => {
    const start = Date.now();
    const result = await next();
    const ms = Date.now() - start;
    console.log(`tRPC ${result.ok ? "✅" : "🚨"} ${type} ${path} - ${ms}ms`);
    return result;
});

// const protectedProcedure = publicProcedure.use(auth);
const loggedProcedure = publicProcedure.use(logger);
// const loggedAndMockedProcedure = loggedProcedure.use(mock);

const circuits = router({
    getOne: loggedProcedure.input(z.string()).query(({ input }) =>
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

    getAll: loggedProcedure.query(() =>
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

    deleteAll: loggedProcedure.mutation(() => prisma.circuit.deleteMany({})),

    createCircuit: loggedProcedure.input(NewCircuitZ).mutation(({ input }) =>
        prisma.circuit.create({
            data: input,
        })
    ),

    updateMultiple: loggedProcedure
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
    getOne: loggedProcedure.input(z.string()).query(({ input }) =>
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

    getAll: loggedProcedure.query(() =>
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

    deleteAll: loggedProcedure.mutation(() => prisma.round.deleteMany({})),

    create: loggedProcedure.input(NewRoundZ).mutation(({ input }) =>
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

    getAllRaces: loggedProcedure.query(() =>
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

    getNextRaces: loggedProcedure
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

    getWeekends: loggedProcedure
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
    getOne: loggedProcedure.input(z.string()).query(({ input }) =>
        prisma.session.findFirst({
            where: { id: input },
        })
    ),

    getAll: loggedProcedure.query(() =>
        prisma.session.findMany({
            orderBy: { startDate: "desc" },
        })
    ),

    deleteAll: loggedProcedure.mutation(() => prisma.session.deleteMany({})),

    create: loggedProcedure.input(NewSessionZ).mutation(({ input }) =>
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
    getAllSessions: loggedProcedure.query(() =>
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
