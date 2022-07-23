import { z } from "zod";
import { _BoardModel } from "../../prisma/zod";

export const createBoardSchema = z.array(_BoardModel)

export const updateBoardSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    favourite: z.boolean().optional(),
    favouritePosition: z.number().optional(),
    position: z.number().optional(),
    icon: z.string().optional()
})

export type UpdateBoardInput = z.TypeOf<typeof updateBoardSchema>
export type CreateBoardInput = z.TypeOf<typeof createBoardSchema>