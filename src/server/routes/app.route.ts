import { createRouter } from "../createRouter";
import userRouter from "./user.route";
import boardRouter from "./board.route";
import sectionRouter from "./section.route";
import taskReducer from "./task.route";

export const appRouter = createRouter()
.merge('users.', userRouter)
.merge('board.', boardRouter)
.merge('section.', sectionRouter)
.merge('task.', taskReducer)

export type AppRouter = typeof appRouter