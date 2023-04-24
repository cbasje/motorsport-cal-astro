import * as z from "zod"

export const VerificationTokenZ = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
})
