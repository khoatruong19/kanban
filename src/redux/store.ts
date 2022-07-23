import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authReducer from "../redux/features/authSlice"
import boardReducer from "../redux/features/boardSlice"
import favouriteReducer from "../redux/features/favouriteSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        board: boardReducer,
        favourite: favouriteReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false
    }),
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store