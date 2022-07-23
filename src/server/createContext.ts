import { NextApiRequest, NextApiResponse } from "next";
import {prisma} from "../utils/prisma"
import { verifyJwt } from "../utils/jwt";

export interface CtxUser{
    id: string
    username:string
    iat: number
    exp: number
}

const getUserFromRequest = (req: NextApiRequest) => {
    const token = req.cookies.token
    if(token){
        try{
            const verified = verifyJwt<CtxUser>(token)

            return verified
        }catch(error) {
            return null
        }
    }
    else{
        return null
    }
}

export function createContext({
    req,res
} : {
    req: NextApiRequest,
    res: NextApiResponse
}){
    const user = getUserFromRequest(req)
    return {req, res, prisma, user}
}``

export type Context = ReturnType<typeof createContext>