import * as z from "zod"
import { CompleteAccount, RelatedAccountZ, CompleteUserSession, RelatedUserSessionZ } from "./index"

export const UserZ = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof UserZ> {
  accounts: CompleteAccount[]
  sessions: CompleteUserSession[]
}

/**
 * RelatedUserZ contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserZ: z.ZodSchema<CompleteUser> = z.lazy(() => UserZ.extend({
  accounts: RelatedAccountZ.array(),
  sessions: RelatedUserSessionZ.array(),
}))
