import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { createRouter } from "../createRouter";
import {createBoardSchema, updateBoardSchema} from "../../schema/board.schema"
import {Board} from "@prisma/client"
import { _BoardModel } from "../../../prisma/zod";
import { z } from "zod";
import { notEqual } from "assert";

const boardRouter = createRouter()
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
    async resolve({ctx}){
        try {
            const boardsCount = await ctx.prisma.board.count()
            const board = await ctx.prisma.board.create({
                data: {
                    user: {
                        connect: {
                            id: ctx.user.id
                        }
                    },
                    position: boardsCount > 0 ? boardsCount : 0
                }
            })
            return {board}
        } catch (error) {
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.query("getAll", {
    async resolve({ctx}){
        try {
            const boards = await ctx.prisma.board.findMany({where: {
                userId: ctx.user.id,
            }, orderBy: {position: "desc"}})
            return {boards}
        } catch (error) {
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.mutation('updatePosition',{
    input: createBoardSchema,
    async resolve({input: boards, ctx: {prisma}}){
        try{
            for(const key in boards.reverse()){
                const board = boards[key]
                await prisma.board.update({where: {id: board.id}, data:{
                    position: parseInt(key)
                }})
            }
            return {
                message: "Boards position updated!!!"
            }
        }catch (error) {
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.query('getOne',{
    input: z.object({
        id: z.string()
    }),
    async resolve({input: {id},ctx: {prisma, req}}){
        let errorResponse
        try{
            const board = await prisma.board.findUnique({where: {id: id}, include: {
                sections: {
                    include:{
                        tasks: true
                    }
                },
            }})
            if(!board) {
                errorResponse = new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Board doesnt exist!"
                })
                throw Error()
            }
            
            return {
                board
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
.mutation("update", {
    input: updateBoardSchema,
    async resolve({input, ctx: {prisma}}){
        let errorResponse
        let {id: boardId,title, description, favourite} = input
        try{
            if(title == "") input.title = "Untitled"
            if(description == "") input.description = "Add description here 🟢"
            
            const board = await prisma.board.findUnique({where: {id: boardId}})
            if(!board) {
                errorResponse = new trpc.TRPCError({
                    code: "NOT_FOUND",
                    message: "Board doesnt exist!"
                })
                throw Error()
            }

            if(favourite !== undefined && board.favourite !== favourite){
                
                const favourites = await prisma.board.findMany({
                    where:{
                        userId: board.userId,
                        favourite: true,
                        NOT:{
                            id: boardId
                        }
                    }
                })


                if(favourite){
                    input.favouritePosition = favourites.length > 0  ? favourites.length : 0
                }
                else{
                    for(const key in favourites){
                        const element = favourites[key]
                        await prisma.board.update({where: {
                            id: element.id
                        }, data: {favouritePosition: parseInt(key)}})
                    }
                }
            }

            const {id, ...rest} = input

            const updatedBoard = await prisma.board.update({
                where:{
                    id: board.id
                },
                data:{
                    ...rest
                }
            })

            
            return {
                updatedBoard
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
.mutation('updateFavouritePosition',{
    input: createBoardSchema,
    async resolve({input: boards, ctx: {prisma}}){
        try{
            for(const key in boards.reverse()){
                const board = boards[key]
                await prisma.board.update({where: {id: board.id}, data:{
                    favouritePosition: parseInt(key)
                }})
            }
            return {
                message: "Boards position updated!!!"
            }
        }catch (error) {
            throw new trpc.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong"
            })
        }
    }
})
.mutation('delete', {
    input: z.object({
        id: z.string()
    }),
    async resolve({input: {id}, ctx: {prisma}}){
        let errorResponse
        try{
           const board = await prisma.board.findUnique({where: {id}})
           if(!board) {
            errorResponse = new trpc.TRPCError({
                code: "NOT_FOUND",
                message: "Board doesnt exist!"
            })
            throw Error()
            }   
            await prisma.board.delete({where: {id}})
            return {
                message: "Deleted board!!!"
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


export default boardRouter