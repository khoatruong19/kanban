import { Box, Drawer, IconButton, List, ListItem, ListItemButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/store'
import LogoutIcon from '@mui/icons-material/Logout';
import { trpc } from '../utils/trpc';
import { useRouter } from 'next/router';
import { Add } from '@mui/icons-material';
import { setBoards } from '../redux/features/boardSlice';
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd"
import FavouriteList from './FavouriteList';

const Sidebar = () => {
    const sidebarWidth = 250
    const {boards} = useAppSelector(state => state.board)
    const router = useRouter()
    const {id} = router.query

    
    const {user} = useAppSelector(state => state.auth)
    const [active, setActive] = useState<number | null>(boards?.findIndex(board => board.id === id))
    const {data} = trpc.useQuery(['board.getAll'])
    const logoutUser = trpc.useMutation(['users.logout'])
    const createBoard = trpc.useMutation(['board.create'])
    const updatePostion = trpc.useMutation(['board.updatePosition'])
    const dispatch = useAppDispatch()

    const handleLogoutUser = () => {
        logoutUser.mutate()
        router.push("/login")
    }

    const onDragEnd = (result: DropResult) => {
        const {source, destination} = result
        if (!destination) {
            return
        }
        const newList = [...boards]
        const [removed] = newList.splice(source.index, 1)
        newList.splice(destination.index, 0, removed)

        const activeItem = newList.findIndex(board => board.id === id)
        setActive(activeItem)
        dispatch(setBoards(newList))
        updatePostion.mutate(newList, {
            onError(error) {
                alert(error.message)
            },
        })
    }

    const handleRouting = (address: string) => {
        router.push(address)
    }

    const addBoard = () => {
        createBoard.mutate(null, {
            onSuccess({board}){
                const newList = [board, ...boards]
                dispatch(setBoards(newList))
                router.push(`/boards/${board.id}`)
            },
            onError(error){
                alert(error.message)
            }
        })
    }

    useEffect(() => {
        dispatch(setBoards(data?.boards))
        
    }, [data])

    useEffect(() => {
        const activeItem = boards?.findIndex(e => e.id === id)
        if (boards?.length > 0 && id === undefined) {
          router.push(`/boards/${boards[0].id}`)
        }
        setActive(activeItem)
      }, [boards, id, router])

  return (
    <Drawer   variant="permanent" open={true} sx={{width: sidebarWidth , height: '100%',  '& > div': { borderRight: 'none' }}} >
        <List disablePadding sx={{
            width: sidebarWidth, height: '100vh', backgroundColor: "whitesmoke"
        }}>
            <ListItem sx={{marginBottom: "1rem"}}>
                <Box sx={{
                    width: '100%',
                    display: "flex",
                    alignItems: "center",
                    justifyContent:"space-between",
                }}>
                    <Typography variant="h5" fontWeight='900' color="black">
                        {user?.username}
                    </Typography>

                    <IconButton onClick={handleLogoutUser}>
                        <LogoutIcon sx={{color: "black"}}/>
                    </IconButton>
                </Box>
            </ListItem>
            
            <FavouriteList/>
            

            <ListItem sx={{marginBottom: "1rem"}}>
                <Box sx={{
                    width: '100%',
                    display: "flex",
                    alignItems: "center",
                    justifyContent:"space-between",
                }}>
                    <Typography variant="body2" fontWeight='700' color="black">
                        Private
                    </Typography>
                    
                    <IconButton onClick={addBoard}>
                        <Add sx={{color: "black"}}/>
                    </IconButton>
                </Box>
            </ListItem>

            
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable key={'list-board-droppable'} droppableId={'list-board-droppable'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {
                  boards && boards.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <ListItemButton onClick={() => handleRouting(`/boards/${item.id}`)} selected={index === active} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={{pl: '20px', cursor: snapshot.isDragging ? 'grab' : 'pointer!important'}}>
                        <Typography variant='body2' fontWeight={700} sx={{color:"black",whiteSpace: 'nowrap', overflow:'hidden',textOverflow: 'ellipsis'}}>
                           <span style={{marginRight:"0.5rem"}}>{item.icon}</span> {item.title}
                        </Typography>
                        </ListItemButton>
                      )}
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
       

        </List>
    </Drawer>
  )
}



export default Sidebar

