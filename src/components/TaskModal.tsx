import { DeleteOutline } from '@mui/icons-material'
import { Backdrop, Box, Divider, Fade, IconButton, Modal, TextField, Typography } from '@mui/material'
import { Task } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import Moment from "moment"
import { trpc } from '../utils/trpc'

interface IProps{
    task?: Task
    boardId: string
    onClose: () => void
    onUpdate: (task: Task) => void
    onDelete: (task: Task) => void
}

const modalStyle = {
    outline: 'none',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    width: '50%',
    bgcolor: '#fff',
    boxShadow: 24,
    p:1,
    height: '80%'
}

let timer : NodeJS.Timeout
const timeout = 500

const TaskModal = ({task: selectedTask, boardId, onClose, onUpdate, onDelete}: IProps) => {
    const [task, setTask] = useState<Task | undefined>(selectedTask || undefined)
    const [title, setTitle] = useState(selectedTask?.title || '')
    const [content, setContent] = useState(selectedTask?.content || '')

    const deleteTask = trpc.useMutation(['task.delete'])
    const updateTask = trpc.useMutation(['task.update'])

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        clearTimeout(timer)
        const newTitle = e.target.value
        timer = setTimeout(() => {
          updateTask.mutate({taskId: `${task?.id}`, title: newTitle}, )
        }, timeout)
        setTitle(newTitle)
        onUpdate({...task, title: newTitle} as Task)
    }

    const handleChangeContent = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      clearTimeout(timer)
        const newContent = e.target.value
        timer = setTimeout(() => {
          updateTask.mutate({taskId: `${task?.id}`, content: newContent })
        }, timeout)
        setContent(newContent)
        onUpdate({...task, content: newContent} as Task)
    }

    const handleDeleteTask = () => {
      deleteTask.mutate({taskId: `${task?.id}` },{
        onError(error){alert(error)},
        onSuccess(){
          onDelete(task as Task)
          setTask(undefined)
        }
      })
    }

    const onCloseModal = () => {
      onUpdate({...task, title, content} as Task)
      onClose()
      setTitle('')
      setContent('')
    }


  useEffect(() => {
    setTask(selectedTask)
    setTitle(selectedTask !== undefined ? selectedTask.title : '')
    setContent(selectedTask !== undefined ? selectedTask.content : '')

  }, [selectedTask])
  
  return (
    <Modal onClose={onCloseModal} open={task !== undefined} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{timeout: 500}} >
        <Fade in={task !== undefined}>
             <Box sx={modalStyle}>
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    width: '100%'
                  }}> 
                    <IconButton color='error' onClick={handleDeleteTask}>
                        <DeleteOutline/>
                    </IconButton>
                  </Box>
                  <Box sx={{
                    display: "flex",
                    height: '100%',
                    flexDirection: 'column',
                    padding: '2rem 5rem 5rem'
                  }}> 
                    <TextField onChange={handleChangeTitle} placeholder={!title ?  "Untitled" : ""}   value={title}  variant='outlined' fullWidth sx={
                  { 
                    width: '100%',
                    '& .MuiOutlinedInput-input' : {padding: 0},
                    '& .MuiOutlinedInput-notchedOutline' : {border: 'unset'},
                    '& .MuiOutlinedInput-root' : { fontSize: "2rem", fontWeight: '700'},
                  }} />
                  <Typography variant='body2' fontWeight={700}>
                    {task !== undefined ? Moment(task.createdAt).format('YYYY-MM-DD') : ''}
                  </Typography>
                  <Divider sx={{margin: '1.5rem 0'}} />
                  <Box sx={{marginTop: "1rem"}}>
                    <TextField onChange={handleChangeContent}  value={content} placeholder={!content ?  "To do..." : ""} variant='outlined' fullWidth sx={
                    { 
                      width: '100%',
                      '& .MuiOutlinedInput-input' : {padding: 0},
                      '& .MuiOutlinedInput-notchedOutline' : {border: 'unset'},
                      '& .MuiOutlinedInput-root' : { fontSize: "1.5rem", fontWeight: '700'},
                    }} />
                  </Box>
                  </Box>
             </Box>
        </Fade>
    </Modal>
  )
}

export default TaskModal