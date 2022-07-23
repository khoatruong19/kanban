import * as z from "zod"
import {  CompleteTask} from "./index"

export const _SectionModel = z.object({
  id: z.string(),
  boardId: z.string(),
  title: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteSection extends z.infer<typeof _SectionModel> {
  tasks: CompleteTask[]
}

/**
 * SectionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */



