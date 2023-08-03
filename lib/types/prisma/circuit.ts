import * as z from "zod";
import {
    CompleteRound,
    CompleteWeather,
    RelatedRoundSchema,
    RelatedWeatherSchema,
} from "./index";

export const CircuitSchema = z.object({
    id: z.string(),
    created_at: z.date(),
    title: z.string(),
    wikipediaPageId: z.number().int(),
    country: z.string().nullish(),
    timezone: z.string().nullish(),
    utcOffset: z.number().int().nullish(),
    lon: z.number().nullish(),
    lat: z.number().nullish(),
});

export interface CompleteCircuit extends z.infer<typeof CircuitSchema> {
    rounds: CompleteRound[];
    weather: CompleteWeather[];
}

/**
 * RelatedCircuitSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCircuitSchema: z.ZodSchema<CompleteCircuit> = z.lazy(() =>
    CircuitSchema.extend({
        rounds: RelatedRoundSchema.array(),
        weather: RelatedWeatherSchema.array(),
    })
);
