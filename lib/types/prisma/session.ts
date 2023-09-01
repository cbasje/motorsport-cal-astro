import { SessionType } from "@prisma/client";
import * as z from "zod";
import { RelatedRoundSchema, type CompleteRound } from "./round";

export const SessionSchema = z.object({
    id: z.string(),
    created_at: z.date(),
    number: z.number().int(),
    startDate: z.date(),
    endDate: z.date(),
    roundId: z.string(),
    type: z.nativeEnum(SessionType),
});

export interface CompleteSession extends z.infer<typeof SessionSchema> {
    round: CompleteRound;
}

/**
 * RelatedSessionSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSessionSchema: z.ZodSchema<CompleteSession> = z.lazy(() =>
    SessionSchema.extend({
        round: RelatedRoundSchema,
    })
);
