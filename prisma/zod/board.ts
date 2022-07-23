import * as z from "zod"
import { CompleteSection, SectionModel, CompleteUser, UserModel } from "./index"

export const _BoardModel = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  description: z.string(),
  position: z.number().int(),
  favourite: z.boolean(),
  favouritePosition: z.number().int().nullish(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteBoard extends z.infer<typeof _BoardModel> {
  sections: CompleteSection[]
  user: CompleteUser
}

/**
 * BoardModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const BoardModel: z.ZodSchema<CompleteBoard> = z.lazy(() => _BoardModel.extend({
  sections: SectionModel.array(),
  user: UserModel,
}))
