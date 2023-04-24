import * as z from "zod"
import { CompleteRound, RelatedRoundZ } from "./index"

export const SessionZ = z.object({
  id: z.string(),
  created_at: z.date(),
  number: z.number().int(),
  startDate: z.date(),
  endDate: z.date(),
  roundId: z.string(),
  type: z.string(),
})

export interface CompleteSession extends z.infer<typeof SessionZ> {
  round: CompleteRound
}

/**
 * RelatedSessionZ contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSessionZ: z.ZodSchema<CompleteSession> = z.lazy(() => SessionZ.extend({
  round: RelatedRoundZ,
}))
