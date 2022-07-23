
import { Board } from '@prisma/client'
import { createSlice } from '@reduxjs/toolkit'

interface InitialStateData {
    favouriteList: Board[] 
}

const initialState  : InitialStateData= {
    favouriteList: []
}

export const favouriteSlice = createSlice({
  name: 'favourite',
  initialState,
  reducers: {
    setFavouriteList: (state, action) => {
      state.favouriteList = action.payload
    }
  }
})

export const { setFavouriteList } = favouriteSlice.actions

export default favouriteSlice.reducer