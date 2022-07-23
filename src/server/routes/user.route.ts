import { createRouter } from "../createRouter";
import * as trpc from "@trpc/server"
import { createUserSchema } from "../../schema/user.schema";
import argon2 from "argon2"
import jsonwebtoken from "jsonwebtoken"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { serialize } from "cookie";

const userRouter = createRouter()
.query("hello", {
    async resolve({ctx}){
        return "hello world"
    }
})
.mutation("register", {
    input: createUserSchema,
    async resolve({input, ctx}){
        const {username, password} = input
        try {
            const hashedPassword = await argon2.hash(password)
            const user = await ctx.prisma.user.create({data: {username, password: hashedPassword}})

            const token = jsonwebtoken.sign({
                id: user.id,
                username: user.username
            },`${process.env.JWT_SECRECT_KEY}`, {expiresIn: '24h'})

            ctx.res.setHeader('Set-Cookie', serialize('token', token, {path: "/"}))

            const {password: userPassword, ...rest} = user

            return {user: rest, token}
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === "P2002"){
                    throw new trpc.TRPCError({
                        code: 'CONFLICT',
                        message: 'User already exists'
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
.mutation("login", {
    input: createUserSchema,
    async resolve({input, ctx}){
            const {username, password} = input
            const existingUser = await ctx.prisma.user.findUnique({where: {username}})
            let reqError 
            try{

                if(!existingUser) {
                    reqError = new trpc.TRPCError({
                        code: "BAD_REQUEST",
                        message: 'Username is invalid',
                    
                    })
                    throw Error()
                }
                const verifyPassword = await argon2.verify(existingUser.password, password)
                console.log(verifyPassword)
    
                if(!verifyPassword) {
                    reqError = new trpc.TRPCError({
                        code: "BAD_REQUEST",
                        message: 'Password is invalid',
                    })
                    throw Error()
                }
    
                const token = jsonwebtoken.sign({
                    id: existingUser.id,
                    username: existingUser.username
                },`${process.env.JWT_SECRECT_KEY}`, {expiresIn: '24h'})
    
                ctx.res.setHeader('Set-Cookie', serialize('token', token, {path: "/", maxAge: 1000 * 60 * 60}))
    
                const {password: userPassword, ...rest} = existingUser
    
                return {user: rest, token}
            
            }catch(error){
                if(reqError) throw reqError
                throw new trpc.TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Something went wrong"
                })
            }
    }
})
.query("me", {
    resolve({ctx}){
        return ctx.user
    }
})
.mutation("logout", {
    resolve({ctx}){
        ctx.res.setHeader('Set-Cookie', serialize('token', "", {path: "/"}))
    }
})

export default userRouter