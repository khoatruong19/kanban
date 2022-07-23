import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { updateSectionSchema } from "../../schema/section.schema";
import { updateTaskPositionSchema, updateTaskSchema } from "../../schema/task.schema";
import { createRouter } from "../createRouter";

const taskRouter = createRouter()
.middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
        ctx: {
          ...ctx,
          user: ctx.user, // user value is known to be non-null now
        },
    })
  })
.mutation("create", {
    input: z.object({
        sectionId: z.string()
    }),
    async resolve({input:{sectionId}, ctx: {prisma}}){
        let errorResponse
        try {
            const section = await prisma.section.findUnique({where:{id: sectionId}})
            if(!section){
                errorResponse = new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Section not found!"
                })
                throw Error()
            }
            const tasksCount = await prisma.task.count({where: {sectionId}})
            const task = await prisma.task.create({data: {
                sectionId,
                position: tasksCount > 0 ? tasksCount : 0
            }, include: {section: true}})
            return {task}
        } catch (error) {
            if(errorResponse) throw errorResponse
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.mutation("update", {
    input: updateTaskSchema,
    async resolve({input: {taskId, title, content}, ctx: {prisma}}){
        try{
            const task = await prisma.task.update({where: {id: taskId}, data:{
                title,
                content
            }})
            return {
                task
            }
        }catch (error) {
            if(error instanceof PrismaClientKnownRequestError ){
                if(error.code === "NOT_FOUND"){
                    throw new trpc.TRPCError({
                        code: "NOT_FOUND",
                        message: "Task not found!"
                    })
                }
            }
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})

.mutation('delete', {
    input: z.object({
        taskId: z.string()
    }),
    async resolve({input: {taskId}, ctx: {prisma}}){
        let errorResponse
        try{
           const task = await prisma.task.findUnique({where: {id: taskId}})
            if(!task) {
                errorResponse = new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Task doesnt exist!"
                })
                throw Error()
            }   
            await prisma.task.delete({where: {id: taskId}})
            const tasks = await prisma.task.findMany({where:{
                sectionId: task.sectionId
            }, orderBy: {position: "asc"}})
            for(const key in tasks) {
                let index = parseInt(key)
                await prisma.task.update({where: {
                    id: tasks[index].id
                }, data: {position: index}}) 
            }
            return {
                message: "Deleted task!!!"
            }
        }catch (error) {
            if(errorResponse) throw errorResponse
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.mutation("updatePosition", {
    input: updateTaskPositionSchema,
    async resolve({input:{destinationList,resourceList,destinationSectionId,resourceSectionId}, ctx:{prisma}}){
        let errorResponse
        let index: number
        const resourceListReverse = resourceList.reverse()
        const destinationListReverse = destinationList.reverse()
        try{
           if(resourceSectionId !== destinationSectionId){
                for(const key in resourceListReverse){
                    index = parseInt(key)
                    await prisma.task.update({where: {
                        id: resourceListReverse[index].id
                    }, data:{
                        sectionId: resourceSectionId,
                        position: index
                    }})
                }
            }    

            for(const key in destinationListReverse){
                index = parseInt(key)
                await prisma.task.update({where: {
                    id: destinationListReverse[index].id
                }, data:{
                    sectionId: destinationSectionId,
                    position: index
                }})
            }

            return {
                message: "Updated task!!!"
            }
        }catch (error) {
            if(errorResponse) throw errorResponse
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})


export default taskRouter