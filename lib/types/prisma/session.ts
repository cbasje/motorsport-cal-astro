import * as z from "zod"
import { SessionType } from "@prisma/client"
import { CompleteRound, RelatedRound } from "./index"

export const Session = z.object({
  id: z.string(),
  created_at: z.date(),
  number: z.number().int(),
  startDate: z.date(),
  endDate: z.date(),
  roundId: z.string(),
  type: z.nativeEnum(SessionType),
})

export interface CompleteSession extends z.infer<typeof Session> {
  round: CompleteRound
}

/**
 * RelatedSession contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSession: z.ZodSchema<CompleteSession> = z.lazy(() => Session.extend({
  round: RelatedRound,
}))
