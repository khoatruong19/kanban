import { User } from '@prisma/client'
import { createSlice } from '@reduxjs/toolkit'

interface InitialStateData {
    user: Omit<User, "password"> | null
}

const initialState  : InitialStateData= {
    user: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    }
  }
})

export const { setUser } = authSlice.actions

export default authSlice.reducer