import { z } from "zod";

export const createUserSchema= z.object({
    username: z.string().min(3, "Username length must be greater than 2"),
    password: z.string().min(3, "Username length must be greater than 2")
})

export type CreateUserInput = z.TypeOf<typeof createUserSchema>