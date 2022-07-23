import { Box, Button, TextField, Typography} from '@mui/material'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import {useForm} from "react-hook-form"
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/features/authSlice'
import { useAppSelector } from '../redux/store'
import { CreateUserInput } from '../schema/user.schema'
import { trpc } from '../utils/trpc'
const RegisterPage = () => {
  const dispatch = useDispatch()
    const {handleSubmit, register} = useForm<CreateUserInput & {confirmPassword: string}>()
    const registerUser = trpc.useMutation(["users.register"])
    const {data: me, isLoading} = trpc.useQuery(['users.me'])
    const router = useRouter()
    const onSubmit = (value: CreateUserInput & {confirmPassword: string}) => {
        if(value.password !== value.confirmPassword) alert("Password not matched!!")
        else{
            const {confirmPassword, ...rest} = value
            registerUser.mutate(rest, {
                onSuccess({user}){
                    dispatch(setUser(user))
                    router.push("/")
                }
            })
        }
    }

    useEffect(() => {
        if(!isLoading) {
         if(me) router.push("/")
          
        }
        
       },[me,isLoading,router,dispatch])


  return (
    <Box onSubmit={handleSubmit(onSubmit)} component="form" sx={{width: "500px", mx: "auto", mt: 10}}>
        <Typography variant='h3' textAlign="center" mb={2} >Register</Typography>
        <TextField label="Username" id='username' {...register('username')} sx={{mb: 2}} required fullWidth/>
        <TextField type="password" label="Password" id='password' {...register('password')} sx={{mb: 2}} required fullWidth/>
        <TextField type="password" label="Confirm password" id='confirmPassword' {...register('confirmPassword')} required fullWidth/>
        <Button type='submit' fullWidth variant='contained' sx={{mt: 2}}>Register</Button>
    </Box>
    )
}

export default RegisterPage