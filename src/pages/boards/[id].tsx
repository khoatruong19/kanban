import { DeleteOutlined, Star, StarBorderOutlined, StarOutline } from '@mui/icons-material'
import { Box, Button, Divider, IconButton, TextField, Typography } from '@mui/material'
import { Board, Section, Task } from '@prisma/client'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { trpc } from '../../utils/trpc'
import { useAppDispatch, useAppSelector } from '../../redux/store'
import { setBoards } from '../../redux/features/boardSlice'
import EmojiPicker from '../../components/EmojiPicker'
import { setFavouriteList } from '../../redux/features/favouriteSlice'
import Kanban from '../../components/Kanban'
import { GetServerSideProps } from 'next'

export type CompleteSectionType = Section & {tasks: Task[]}

let timer : NodeJS.Timeout
const timeout = 500

const BoardPage = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const {id} = router.query
    const {data, isLoading} = trpc.useQuery(['board.getOne', {id: `${id}`}])
    const {boards} = useAppSelector(state => state.board)
    const {favouriteList} = useAppSelector(state => state.favourite)
    const updateBoard = trpc.useMutation(['board.update'])
    const deleteBoard = trpc.useMutation(['board.delete'])

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [sections, setSections] = useState<CompleteSectionType[]>([])
    const [isFavourite, setIsFavourite] = useState(false)
    const [icon, setIcon] = useState("")

    const handleChangeIcon = (value: string) => {
      let temp = [...boards]
      const index = temp.findIndex(board => board.id === id)
      temp[index] = {...temp[index], icon: value}
      setIcon(value)
      dispatch(setBoards(temp))

      if(isFavourite){
        let temp = [...favouriteList]
        const index = temp.findIndex(board => board.id === id)
        temp[index] = {...temp[index], icon: value}
        dispatch(setFavouriteList(temp))
      }

      updateBoard.mutate({
        id: `${id}`,
        icon: value
      }, {
        onError(error){
          alert(error.message)
        }
      })
    }


    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement> ) => {
      clearTimeout(timer)
      const newTitle = e.target.value
      setTitle(newTitle)
      let temp = [...boards]
      const index = temp.findIndex(board => board.id === id)
      temp[index] = {...temp[index], title: newTitle}
      dispatch(setBoards(temp))

      if(isFavourite){
        let temp = [...favouriteList]
        const index = temp.findIndex(board => board.id === id)
        temp[index] = {...temp[index], title: newTitle}
        dispatch(setFavouriteList(temp))
      }


      timer = setTimeout(() => {
        updateBoard.mutate({
          id: `${id}`,
          title: newTitle
        }, {
          onError(error){
            alert(error.message)
          }
        })
      }, timeout)
    }

    const handleChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement> ) => {
      clearTimeout(timer)
      const newDesc = e.target.value
      setDescription(newDesc)
      let temp = [...boards]
      const index = temp.findIndex(board => board.id === id)
      temp[index] = {...temp[index], description: newDesc}
      dispatch(setBoards(temp))

      if(isFavourite){
        let temp = [...favouriteList]
        const index = temp.findIndex(board => board.id === id)
        temp[index] = {...temp[index], description: newDesc}
        dispatch(setFavouriteList(temp))
      }

      timer = setTimeout(() => {
        updateBoard.mutate({
          id: `${id}`,
          description: newDesc
        }, {
          onError(error){
            alert(error.message)
          }
        })
      }, timeout)
    }

    const handleAddFavourite = () => {
      updateBoard.mutate({
        id: `${id}`,
        favourite: !isFavourite
      }, {
        onError(error){
          alert(error.message)
        },
        onSuccess(data){
          let temp = [...favouriteList]
          if(isFavourite){
            temp = temp.filter(board => board.id !== id)
          }else{
            temp.unshift(data.updatedBoard)
          }
          dispatch(setFavouriteList(temp))
          setIsFavourite(!isFavourite)
        }
      })
    }

    const handleDeleteBoard = () => {
      deleteBoard.mutate({id: `${id}`}, {
        onError(error){
          alert(error.message)
        },
        onSuccess(){
          if(isFavourite){
            const temp = favouriteList.filter(board => board.id !== id)
            dispatch(setFavouriteList(temp))
          }
          const temp = boards.filter(board => board.id !== id)
          if(temp.length === 0) {
            router.push("/boards")
          }
          else{
            router.push(`/boards/${temp[0].id}`)
          }
          dispatch(setBoards(temp))
        }
      })
    }
    
    useEffect(() => {
      if(!isLoading && data){
        const {board} = data 
        setTitle(board.title)
        setDescription(board.description)
        setSections(board.sections)
        setIsFavourite(board.favourite)
        setIcon(board.icon)
        
      }
    },[data,isLoading])


    
  return (
        <Layout>
            <Box sx={{width: "100%", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <IconButton onClick={handleAddFavourite}>
                {
                  isFavourite ? (
                    <Star sx={{color: "yellow"}} />
                  ) : (
                    <StarBorderOutlined sx={{color: "whitesmoke"}}/>
                  )
                }
              </IconButton>
                <IconButton color='error' onClick={handleDeleteBoard}>
                  <DeleteOutlined/>
                </IconButton>
            </Box>
            <Box sx={{padding:"10px 50px"}}>
                <Box>
                <EmojiPicker icon={icon} changeIcon={handleChangeIcon} />
                <TextField onChange={handleChangeTitle}  value={title} placeholder="Untitled" variant='outlined' fullWidth sx={
                  { 
                    '& .MuiOutlinedInput-input' : {padding: 0},
                    '& .MuiOutlinedInput-notchedOutline' : {border: 'unset'},
                    '& .MuiOutlinedInput-root' : { fontSize: "2rem", fontWeight: '700'},
                  }} />
                   <TextField onChange={handleChangeDescription} value={description} multiline placeholder="Add a description" variant='outlined' fullWidth sx={
                  { 
                    '& .MuiOutlinedInput-input' : {padding: 0},
                    '& .MuiOutlinedInput-notchedOutline' : {border: 'unset'},
                    '& .MuiOutlinedInput-root' : { fontSize: "0.8rem"},
                  }} />
                <Kanban boardId={id as string} sections={sections} />
                </Box>

            </Box>
          

         
      </Layout>
  )
}

export default BoardPage