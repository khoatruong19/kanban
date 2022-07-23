import { Close } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { emojies } from '../constants'

interface IProps{
    icon: string
    changeIcon: (value: string) => void
}

const EmojiPicker = ({icon,changeIcon}: IProps) => {
    const [isShowPicker, setIsShowPicker] = useState(false)

    const selectEmoji = (value: string) => {
        changeIcon(value)
        setIsShowPicker(false)
    }
    
    const togglePickerShow = () => setIsShowPicker(!isShowPicker)


  return (
    <Box sx={{position: " relative", width:"max-content"}}>
        <Typography variant='h3' fontWeight={700} sx={{cursor: "pointer"}} onClick={togglePickerShow} >
            {icon}
        </Typography>
        <Box sx={{
            display: isShowPicker ? 'block' : 'none',
            position: 'absolute',
            top: "100%",
            zIndex: '9999'
        }}>
            {isShowPicker && 
                <Box sx={{padding:"0.5rem",backgroundColor:"white" ,position: " relative",display: "flex", width:"200px", flexWrap: "wrap", gap:"1rem"}}>
                {emojies.map((emoji, index) => (
                    <IconButton onClick={() => selectEmoji(emoji)} key={index} sx={{fontSize:"1.5rem"}}>
                        {emoji}
                    </IconButton>
                ))}
                <IconButton onClick={togglePickerShow} sx={{position: "absolute", right: "-1rem", top:"-2.5rem"}} >
                    <Close  color='error' fontSize='large' />
                </IconButton>
                </Box>
             }
        </Box>
    </Box>
  )
}

export default EmojiPicker