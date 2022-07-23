import { AddOutlined, DeleteOutline } from '@mui/icons-material'
import { Button, Card, Divider, IconButton, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import {  Task } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import {DragDropContext, Draggable, Droppable, DropResult} from "react-beautiful-dnd"
import { TaskType } from '../../prisma/zod/task'
import { CompleteSectionType } from '../pages/boards/[id]'
import { trpc } from '../utils/trpc'
import TaskModal from './TaskModal'

interface IProps{
    boardId: string
    sections: CompleteSectionType[]
}

let timer : NodeJS.Timeout
const timeout = 500

const Kanban = ({boardId, sections}: IProps) => {
    const [data, setData] = useState<CompleteSectionType[]>([])
    const [seletedTask, setSeletedTask] = useState<Task | undefined>(undefined)

    const addSection = trpc.useMutation(['section.create'])
    const updateSection = trpc.useMutation(['section.update'])
    const deleteSection = trpc.useMutation(['section.delete'])
    const createTask = trpc.useMutation(['task.create'])
    const updateTaskPosition = trpc.useMutation(['task.updatePosition'])

    const onDragEnd = (result: DropResult) => {
        const {source, destination} = result
        if (!destination) {
            return
        }
        const sourceColIndex = data.findIndex(section => section.id === source.droppableId)
        const destinationColIndex = data.findIndex(section => section.id === destination.droppableId)
        const sourceCol = data[sourceColIndex]
        const destinationCol = data[destinationColIndex]

        const sourceSectionId = sourceCol.id
        const destinatitonSectionId = destinationCol.id

        const sourceTasks = [...sourceCol.tasks]
        const destinationTasks = [...destinationCol.tasks]

        if(source.droppableId !== destination.droppableId){
            const [removed] = sourceTasks.splice(source.index,1)
            destinationTasks.splice(destination.index, 0, removed)
            data[sourceColIndex].tasks = sourceTasks
            data[destinationColIndex].tasks = destinationTasks
        }else{
            const [removed] = destinationTasks.splice(source.index,1)
            destinationTasks.splice(destination.index, 0, removed)
            data[destinationColIndex].tasks = destinationTasks
        }


        updateTaskPosition.mutate({
            resourceList: sourceTasks as TaskType,
            destinationList: destinationTasks as TaskType,
            resourceSectionId: sourceSectionId,
            destinationSectionId: destinatitonSectionId
        },{
            onError(error){alert(error.message)},
            onSuccess(){setData(data)}
        })

    }

    const handleAddSection = () => {
        addSection.mutate({boardId}, {
            onError(error){alert(error.message)},
            onSuccess({section}){
                setData([...data, section])
            }
        })
    }

    const handleDeleteSection = (sectionId: string) => {
        deleteSection.mutate({sectionId}, {
            onError(error){alert(error.message)},
            onSuccess(){
                const temp = data.filter(section => section.id !== sectionId)
                setData(temp)
            }
        })
    }

    const handleUpdateTitle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, sectionId: string) => {
        clearTimeout(timer)
        const newTitle = e.target.value
        const newData = [...data]
        const index = newData.findIndex(section => section.id === sectionId)
        newData[index].title = newTitle
        setData(newData)
        timer = setTimeout(() => {
            updateSection.mutate({title: newTitle, sectionId}, {
                onError(error){alert(error.message)},
            })
        }, timeout)
    }

    const handleCreateTask = (sectionId: string) => {
        createTask.mutate({sectionId}, {
            onError(error){alert(error.message)},
            onSuccess({task}){
                const newData = [...data]
                const index = newData.findIndex(section => section.id === sectionId)
                newData[index].tasks.unshift(task)
                setData(newData)
            }
        })
    }

    const onUpdateTask = (task: Task) => {
        const newData = [...data]
        const sectionIndex = newData.findIndex(section => section.id === task.sectionId)
        const taskIndex = newData[sectionIndex].tasks.findIndex(task => task.id === task.id)
        newData[sectionIndex].tasks[taskIndex] = task
        setData(newData)
    }

    const onDeleteTask = (task: Task) => {
        const newData = [...data]
        const sectionIndex = newData.findIndex(section => section.id === task.sectionId)
        const taskIndex = newData[sectionIndex].tasks.findIndex(task => task.id === task.id)
        newData[sectionIndex].tasks.splice(taskIndex, 1)
        setData(newData)
    }

    
    useEffect(() => {
        if(sections) setData(sections)
    }, [sections])

    return (
    <>
        <Box sx={{display: "flex", alignItems: "center",
        justifyContent: "space-between"
        }}>
            <Button onClick={handleAddSection}>Add a section</Button>
            <Typography variant='body2' fontWeight={700}>
            {data.length} Sections
            </Typography>
        </Box>
        <Divider sx={{margin:" 10px 0"}} />
        <DragDropContext onDragEnd={onDragEnd}>
            <Box sx={{
                display:"flex",
                maxWidth: "80vw",
                overflowX: 'auto',
            }}>
                {data.map(section => (
                    <div key={section.id} style={{width:'300px'}} >
                        <Droppable key={section.id} droppableId={section.id}>
                            {(provided) => (
                                <Box ref={provided.innerRef} {...provided.droppableProps} sx={{
                                    width: "300px",
                                    padding: "10px",
                                    marginRight: "10px"
                                }}>
                                    <Box sx={{
                                        display:"flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "10px"
                                    }}>
                                        <TextField value={section.title} placeholder="Untitled" variant='outlined' sx={{
                                            flexGrow:1,
                                            '& .MuiOutlinedInput-input' : {padding: 0},
                                            '& .MuiOutlinedInput-notchedOutline' : {border: 'unset'},
                                            '& .MuiOutlinedInput-root' : { fontSize: "1.3rem", fontWeight: '700'},
                                        }} onChange={(e) => handleUpdateTitle(e, section.id)}/>
                                        <IconButton onClick={() => handleCreateTask(section.id)} size='small' sx={{color: 'gray', '&:hover': {color:"green"}}}>
                                            <AddOutlined />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteSection(section.id)} size='small' sx={{color: 'gray', '&:hover': {color:"red"}}}>
                                            <DeleteOutline />
                                        </IconButton>
                                    </Box>
                                   {
                                    section.tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <Card ref={provided.innerRef} {...provided.dragHandleProps} {...provided.draggableProps} sx={{
                                                    padding: "10px",
                                                    marginBottom: "10px",
                                                    cursor: snapshot.isDragging ? 'grab' : 'pointer!important'
                                                }} onClick={() => setSeletedTask(task)}>
                                                    <Typography>
                                                        {task.title === '' ? "Untitled" : task.title}
                                                    </Typography>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))
                                   }
                                   {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    </div>
                ))}
            </Box>
        </DragDropContext>
        <TaskModal  onClose={() => setSeletedTask(undefined)} onDelete={onDeleteTask} onUpdate={onUpdateTask} task={seletedTask} boardId={boardId} />
    </>
  )
}

export default Kanban