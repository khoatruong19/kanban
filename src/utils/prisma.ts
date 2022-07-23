import { PrismaClient } from "@prisma/client";

declare global{
    var prisma: PrismaClient | undefined
}

export const prisma = new PrismaClient() || global.prisma

if(process.env.NODE_ENV !== 'production'){
    global.prisma = prisma
}