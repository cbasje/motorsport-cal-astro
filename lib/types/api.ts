import type { Circuit, Round, Session } from "@prisma/client";

export type NewRound = Omit<Round, "circuitId" | "id" | "created_at"> & {
    circuitTitle: string;
};
export type NewSession = Omit<Session, "id" | "created_at">;
export type NewCircuit = Omit<Circuit, "id" | "created_at">;
