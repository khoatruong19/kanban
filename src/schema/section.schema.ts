import { z } from "zod";

export const updateSectionSchema = z.object({
    sectionId: z.string(),
    title: z.string().optional().default("Untitled"),
})

export type UpdateSectionInput = z.TypeOf<typeof updateSectionSchema>