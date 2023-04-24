import * as z from "zod"
import { CompleteUser, RelatedUserZ } from "./index"

export const UserSessionZ = z.object({
  id: z.string(),
  sessionToken: z.string(),
  userId: z.string(),
  expires: z.date(),
})

export interface CompleteUserSession extends z.infer<typeof UserSessionZ> {
  user: CompleteUser
}

/**
 * RelatedUserSessionZ contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSessionZ: z.ZodSchema<CompleteUserSession> = z.lazy(() => UserSessionZ.extend({
  user: RelatedUserZ,
}))
