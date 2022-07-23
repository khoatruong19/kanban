import { Box } from '@mui/material'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { setUser } from '../redux/features/authSlice'
import { useAppDispatch } from '../redux/store'
import { trpc } from '../utils/trpc'
import Sidebar from './Sidebar'

interface IProps {
    children: React.ReactNode
}

const Layout = ({children} : IProps) => {
  const {data: me, isLoading} = trpc.useQuery(['users.me'])
  const router = useRouter()
  const dispatch = useAppDispatch()
  useEffect(() => {
   if(!isLoading) {
    if(me) dispatch(setUser(me))
    else  router.push("/login")
   }
   
  },[me,isLoading, router, dispatch])

  return (
    <Box sx={{display: "flex", overflowX:"hidden"}} width="100vw" height="100vh" >
        <Sidebar/>
        <Box sx={{flex:1, bgcolor: "lightgray"}}>
            {children}    
        </Box>
    </Box>
  )
}

export default Layout