import { z } from "zod";
import { _TaskModel } from "../../prisma/zod";

export const updateTaskSchema = z.object({
    taskId: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
})

export const updateTaskPositionSchema = z.object({
    resourceList: _TaskModel,
    destinationList: _TaskModel,
    resourceSectionId: z.string(),
    destinationSectionId: z.string(),
})

export type UpdateTaskPositionInput = z.TypeOf<typeof updateTaskPositionSchema>

export type UpdateTaskInput = z.TypeOf<typeof updateTaskSchema>