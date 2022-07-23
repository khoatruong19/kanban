import { Box, Button, TextField, Typography} from '@mui/material'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import {useForm} from "react-hook-form"
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/features/authSlice'
import { useAppSelector } from '../redux/store'
import { CreateUserInput } from '../schema/user.schema'
import { trpc } from '../utils/trpc'
const LoginPage = () => {
    const {handleSubmit, register} = useForm<CreateUserInput>()
    const loginUser = trpc.useMutation(["users.login"])
    const dispatch = useDispatch()
    const router = useRouter()
    const {data: me, isLoading} = trpc.useQuery(['users.me'])
    const onSubmit = (value: CreateUserInput) => {
        loginUser.mutate(value, {
            onSuccess({user}){
                dispatch(setUser(user))
                router.push('/')
            },
            onError({message}){
                alert(message)
            }
        })
    }

    useEffect(() => {
        if(!isLoading) {
         if(me) router.push("/")
          
        }
        
       },[me,isLoading,router,dispatch])


  return (
    <Box onSubmit={handleSubmit(onSubmit)} component="form" sx={{width: "500px", mx: "auto", mt: 10}}>
        <Typography variant='h3' textAlign="center" mb={2} >Login</Typography>
        <TextField label="Username" id='username' {...register('username')} sx={{mb: 2}} required fullWidth/>
        <TextField type="password" label="Password" id='password' {...register('password')} required fullWidth/>
        <Button disabled={loginUser.isLoading} type='submit' fullWidth variant='contained' sx={{mt: 2}}>Login</Button>
    </Box>
    )
}

export default LoginPage