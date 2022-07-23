import jwt from "jsonwebtoken"

export const signJwt = (data: object) => jwt.sign(data, `${process.env.JWT_SECRECT_KEY}`)

export const verifyJwt = <T>(token:string) => {
    const user = jwt.verify(token, `${process.env.JWT_SECRECT_KEY}`) as T
    return user
}