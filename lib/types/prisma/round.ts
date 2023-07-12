import * as z from "zod"
import { SeriesId } from "@prisma/client"
import { CompleteCircuit, RelatedCircuitZ, CompleteSession, RelatedSessionZ } from "./index"

export const RoundZ = z.object({
  id: z.string(),
  created_at: z.date(),
  number: z.number().int(),
  title: z.string(),
  season: z.string(),
  link: z.string().nullish(),
  circuitId: z.string(),
  series: z.nativeEnum(SeriesId),
})

export interface CompleteRound extends z.infer<typeof RoundZ> {
  circuit: CompleteCircuit
  sessions: CompleteSession[]
}

/**
 * RelatedRoundZ contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoundZ: z.ZodSchema<CompleteRound> = z.lazy(() => RoundZ.extend({
  circuit: RelatedCircuitZ,
  sessions: RelatedSessionZ.array(),
}))
