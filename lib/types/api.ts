import { z } from "zod";
import { CircuitZ, RoundZ, SessionZ } from "./prisma";

export const NewRoundZ = RoundZ.omit({
    id: true,
    created_at: true,
    circuitId: true,
}).merge(z.object({ circuitTitle: z.string() }));
export type NewRound = z.infer<typeof NewRoundZ>;

export const NewSessionZ = SessionZ.omit({ id: true, created_at: true });
export type NewSession = z.infer<typeof NewSessionZ>;

export const NewCircuitZ = CircuitZ.omit({ id: true, created_at: true });
export type NewCircuit = z.infer<typeof NewCircuitZ>;
