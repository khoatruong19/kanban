import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { createRouter } from "../createRouter";
import {createBoardSchema, updateBoardSchema} from "../../schema/board.schema"
import {Board} from "@prisma/client"
import { _BoardModel } from "../../../prisma/zod";
import { z } from "zod";
import { notEqual } from "assert";
import { updateSectionSchema } from "../../schema/section.schema";

const sectionRouter = createRouter()
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
        boardId: z.string()
    }),
    async resolve({input:{boardId}, ctx}){
        try {
            const section = await ctx.prisma.section.create({data: {boardId}, include: {tasks: true}})
            section.tasks = []
            return {section}
        } catch (error) {
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.mutation("update", {
    input: updateSectionSchema,
    async resolve({input: {sectionId, title}, ctx: {prisma}}){
        let errorResponse
        try{
            const section = await prisma.section.update({where: {id: sectionId}, data:{
                title
            }})
            return {
                section
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
.query("getFavourites", {
    async resolve({ctx}){
        try {
            const boards = await ctx.prisma.board.findMany({where: {
                userId: ctx.user.id,
                favourite: true
            }, orderBy: {favouritePosition: "desc"}})
            return {boards}
        } catch (error) {
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})

.mutation('delete', {
    input: z.object({
        sectionId: z.string()
    }),
    async resolve({input: {sectionId}, ctx: {prisma}}){
        let errorResponse
        try{
           const section = await prisma.section.findUnique({where: {id: sectionId}})
            if(!section) {
                errorResponse = new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Section doesnt exist!"
                })
                throw Error()
            }   
            await prisma.task.deleteMany({where: {sectionId}})
            await prisma.section.delete({where: {id: sectionId}})
            return {
                message: "Deleted section!!!"
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


export default sectionRouter