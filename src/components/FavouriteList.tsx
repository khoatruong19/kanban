import { Box, ListItem, ListItemButton, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { setFavouriteList } from '../redux/features/favouriteSlice'
import { useAppDispatch, useAppSelector } from '../redux/store'
import { trpc } from '../utils/trpc'
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd"

const FavouriteList = () => {
    const {data, isLoading} = trpc.useQuery(['board.getFavourites'])
    const updateFavouritePostion = trpc.useMutation(['board.updateFavouritePosition'])
    const router = useRouter()
    const dispatch = useAppDispatch()
    const {favouriteList} = useAppSelector(state => state.favourite)
    const [activeIndex, setActiveIndex] = useState<number | null>()
    const {id} = router.query

    const onDragEnd = (result: DropResult) => {
        const {source, destination} = result
        if (!destination) {
            return
        }
        const newList = [...favouriteList]
        const [removed] = newList.splice(source.index, 1)
        newList.splice(destination.index, 0, removed)

        const activeItem = newList.findIndex(board => board.id === id)
        setActiveIndex(activeItem)
        dispatch(setFavouriteList(newList))
        updateFavouritePostion.mutate(newList, {
            onError(error) {
                alert(error.message)
            },
        })
    }

    const handleRouting = (address: string) => {
        router.push(address)
    }

    useEffect(() => {
      if(!isLoading && data) dispatch(setFavouriteList(data.boards))
    }, [data, isLoading])
    
    useEffect(() => {
        const index = favouriteList.findIndex(e => e.id === id)
        setActiveIndex(index)
      }, [favouriteList, id])
  

  return (
    <>
    <ListItem>
        <Box sx={{
            width: '100%',
            display: "flex",
            alignItems: "center",
            justifyContent:"space-between",
        }}>
            <Typography variant="body2" fontWeight='700' color="black">
                Favorites
            </Typography>
        </Box>
    </ListItem>
     <DragDropContext onDragEnd={onDragEnd}>
     <Droppable key={'list-board-droppable'} droppableId={'list-board-droppable'}>
       {(provided) => (
         <div ref={provided.innerRef} {...provided.droppableProps}>
           {
             favouriteList && favouriteList.map((item, index) => (
               <Draggable key={item.id} draggableId={item.id} index={index}>
                 {(provided, snapshot) => (
                   <ListItemButton onClick={() => handleRouting(`/boards/${item.id}`)} selected={index === activeIndex} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} sx={{pl: '20px', cursor: snapshot.isDragging ? 'grab' : 'pointer!important'}}>
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
   </>
  )
}

export default FavouriteList