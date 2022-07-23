import { useRouter } from "next/router"
import { useEffect } from "react"
import { setUser } from "../redux/features/authSlice"
import { useAppDispatch, useAppSelector } from "../redux/store"
import { trpc } from "../utils/trpc"

export const useCheckAuth = () => {
    const router = useRouter()
    const {data: me, isLoading} = trpc.useQuery(['users.me'])
    const {user} = useAppSelector(state => state.auth)
    const dispatch = useAppDispatch()
    useEffect(() => {
        if(!isLoading){

            if(!isLoading && me ){
                if(!user) dispatch(setUser(me))
                if(router.route === '/login' || router.route === '/register' ) router.replace('/')
                else return
            }
            else if(!me){
                if(router.route === '/register') return
                router.replace('/login')
            }
        }

        
    },[me,isLoading])

    return {me, isLoading}
}