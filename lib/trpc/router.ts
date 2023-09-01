import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { prisma } from "../prisma";
import { SeriesIdSchema, seriesIds } from "../types";
import type { Context } from "./server";
import { getWeekendDates } from "lib/utils/date";

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

    getMapMarkers: loggedProcedure.query(() =>
        prisma.circuit.findMany({
            orderBy: { created_at: "asc" },
            select: {
                lat: true,
                lon: true,
                title: true,
                rounds: {
                    orderBy: { series: "asc" },
                    select: {
                        series: true,
                    },
                },
            },
        })
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

    getAllRaces: loggedProcedure.query(() =>
        prisma.session.findMany({
            orderBy: { startDate: "asc" },
            where: {
                type: "R",
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
        .input(z.optional(z.array(SeriesIdSchema)))
        .query(({ input }) =>
            Promise.all(
                (input ?? seriesIds).map((series) =>
                    prisma.session.findFirst({
                        orderBy: { startDate: "asc" },
                        where: {
                            type: "R",
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

    getWeekend: loggedProcedure
        .input(
            z.object({
                weekOffset: z.number().int().min(-52).max(52).default(0),
                now: z.date().optional(),
                showSessions: z.boolean().optional().default(false),
            })
        )
        .query(({ input }) => {
            const [startDate, endDate] = getWeekendDates(input.weekOffset);
            return prisma.round.findMany({
                orderBy: { series: "asc" },
                where: {
                    sessions: {
                        some: {
                            AND: {
                                startDate: { gte: startDate },
                                endDate: { lte: endDate },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    title: true,
                    series: true,
                    startDate: true,
                    endDate: true,
                    circuit: {
                        select: {
                            title: true,
                        },
                    },
                    sessions: input.showSessions
                        ? {
                              orderBy: {
                                  startDate: "asc",
                              },
                              take: 1,
                              where:
                                  input.now !== undefined
                                      ? {
                                            endDate: { gte: input.now },
                                        }
                                      : undefined,
                              select: {
                                  type: true,
                                  number: true,
                                  startDate: true,
                                  endDate: true,
                              },
                          }
                        : false,
                },
            });
        }),
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

    getNextSessionByRoundId: loggedProcedure
        .input(z.object({ now: z.date(), roundId: z.string() }))
        .query(({ input }) =>
            prisma.session.findFirst({
                orderBy: { startDate: "asc" },
                where: {
                    AND: { roundId: input.roundId, endDate: { gt: input.now } },
                },
                select: {
                    type: true,
                    startDate: true,
                    endDate: true,
                    number: true,
                    round: {
                        select: {
                            series: true,
                            circuit: {
                                select: {
                                    timezone: true,
                                },
                            },
                        },
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
