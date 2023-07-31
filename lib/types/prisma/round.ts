import { SeriesId } from "@prisma/client";
import * as z from "zod";
import {
    CompleteCircuit,
    CompleteSession,
    RelatedCircuitSchema,
    RelatedSessionSchema,
} from "./index";

export const RoundSchema = z.object({
    id: z.string(),
    created_at: z.date(),
    number: z.number().int(),
    title: z.string(),
    season: z.string(),
    link: z.string().nullish(),
    startDate: z.date().nullish(),
    endDate: z.date().nullish(),
    circuitId: z.string(),
    series: z.nativeEnum(SeriesId),
});

export interface CompleteRound extends z.infer<typeof RoundSchema> {
    circuit: CompleteCircuit;
    sessions: CompleteSession[];
}

/**
 * RelatedRoundSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoundSchema: z.SchemaodSchema<CompleteRound> = z.lazy(() =>
    RoundSchema.extend({
        circuit: RelatedCircuitSchema,
        sessions: RelatedSessionSchema.array(),
    })
);
