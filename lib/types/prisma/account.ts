import * as z from "zod"
import { CompleteUser, RelatedUserZ } from "./index"

export const AccountZ = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().nullish(),
  access_token: z.string().nullish(),
  expires_at: z.number().int().nullish(),
  token_type: z.string().nullish(),
  scope: z.string().nullish(),
  id_token: z.string().nullish(),
  session_state: z.string().nullish(),
})

export interface CompleteAccount extends z.infer<typeof AccountZ> {
  user: CompleteUser
}

/**
 * RelatedAccountZ contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedAccountZ: z.ZodSchema<CompleteAccount> = z.lazy(() => AccountZ.extend({
  user: RelatedUserZ,
}))
