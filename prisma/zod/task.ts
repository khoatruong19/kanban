import * as z from "zod"
import { CompleteSection } from "./index"

export const _TaskModel = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  position: z.number().int(),
  sectionId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).array()



export interface CompleteTask extends z.infer<typeof _TaskModel> {
  section: CompleteSection
}

/**
 * TaskModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */

