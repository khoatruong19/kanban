import * as z from "zod"
import { CompleteBoard } from "./index"

export const _UserModel = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  boards: CompleteBoard[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */