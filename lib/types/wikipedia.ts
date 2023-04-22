import { z } from "zod";
import { CircuitZ } from "./prisma";

const CoordinateZ = z.object({
    lat: z.number(),
    lon: z.number(),
    primary: z.boolean(),
    globe: z.string(),
});

const PageZ = z.object({
    pageid: z.number(),
    ns: z.number(),
    title: z.string(),
    index: z.number(),
    coordinates: z.array(CoordinateZ).optional(),
});

const QueryZ = z.object({
    pages: z.array(PageZ).optional(),
});

export const WikipediaDataZ = z.object({
    batchcomplete: z.boolean(),
    query: QueryZ,
});
export type WikipediaData = z.infer<typeof WikipediaDataZ>;

export const CircuitWithIdZ = CircuitZ.omit({ created_at: true });
export type CircuitWithId = z.infer<typeof CircuitWithIdZ>;

export const CircuitTitleZ = CircuitWithIdZ.pick({ id: true, title: true });
export type CircuitTitle = z.infer<typeof CircuitTitleZ>;

export const CircuitWikipediaZ = CircuitWithIdZ.omit({ title: true });
export type CircuitWikipedia = z.infer<typeof CircuitWikipediaZ>;
