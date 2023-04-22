import * as z from "zod"
import { SeriesId } from "@prisma/client"
import { CompleteCircuit, RelatedCircuit, CompleteSession, RelatedSession } from "./index"

export const Round = z.object({
  id: z.string(),
  created_at: z.date(),
  number: z.number().int(),
  title: z.string(),
  season: z.string(),
  link: z.string().nullish(),
  circuitId: z.string(),
  series: z.nativeEnum(SeriesId),
})

export interface CompleteRound extends z.infer<typeof Round> {
  circuit: CompleteCircuit
  sessions: CompleteSession[]
}

/**
 * RelatedRound contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRound: z.ZodSchema<CompleteRound> = z.lazy(() => Round.extend({
  circuit: RelatedCircuit,
  sessions: RelatedSession.array(),
}))
