
import { Board } from '@prisma/client'
import { createSlice } from '@reduxjs/toolkit'

interface InitialStateData {
    boards: Board[] 
}

const initialState  : InitialStateData= {
    boards: []
}

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload
    }
  }
})

export const { setBoards } = boardSlice.actions

export default boardSlice.reducer