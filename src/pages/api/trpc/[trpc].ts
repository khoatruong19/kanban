import * as trpcNext from "@trpc/server/adapters/next"
import { createContext } from "../../../server/createContext"
import { appRouter } from "../../../server/routes/app.route"

export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
    onError({error}){
        if(error.code === "INTERNAL_SERVER_ERROR"){
            console.log("Something is wrong, ",error)
        }else{
            console.error(error)
        }
    }
})