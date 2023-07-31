import * as z from "zod";
import { CompleteCircuit, RelatedCircuitSchema } from "./index";

export const WeatherSchema = z.object({
    id: z.string(),
    temp: z.number(),
    weatherId: z.number().int(),
    circuitId: z.string().nullish(),
    dt: z.date(),
});

export interface CompleteWeather extends z.infer<typeof WeatherSchema> {
    circuit?: CompleteCircuit | null;
}

/**
 * RelatedWeatherSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedWeatherSchema: z.SchemaodSchema<CompleteWeather> = z.lazy(
    () =>
        WeatherSchema.extend({
            circuit: RelatedCircuitSchema.nullish(),
        })
);
