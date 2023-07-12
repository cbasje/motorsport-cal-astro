import * as z from "zod";
import { CompleteRound, RelatedRoundZ } from "./index";

export const CircuitZ = z.object({
    id: z.string(),
    created_at: z.date(),
    title: z.string(),
    wikipediaPageId: z.number().int().nullish(),
    lon: z.number().nullish(),
    lat: z.number().nullish(),
});

export interface CompleteCircuit extends z.infer<typeof CircuitZ> {
    rounds: CompleteRound[];
}

/**
 * RelatedCircuitZ contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCircuitZ: z.ZodSchema<CompleteCircuit> = z.lazy(() =>
    CircuitZ.extend({
        rounds: RelatedRoundZ.array(),
    })
);
