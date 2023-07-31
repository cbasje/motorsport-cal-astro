import { z } from "zod";
import { CircuitSchema, RoundSchema, SessionSchema } from "./prisma";

export const NewRoundSchema = RoundSchema.omit({
    id: true,
    created_at: true,
    circuitId: true,
}).merge(z.object({ circuitTitle: z.string() }));
export type NewRound = z.infer<typeof NewRoundSchema>;

export const NewSessionSchema = SessionSchema.omit({
    id: true,
    created_at: true,
});
export type NewSession = z.infer<typeof NewSessionSchema>;

export const NewCircuitSchema = CircuitSchema.omit({
    id: true,
    created_at: true,
});
export type NewCircuit = z.infer<typeof NewCircuitSchema>;
