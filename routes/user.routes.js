import express from 'express'
import { askToGemini, getCurrentUser, updateUser } from '../controller/user.controller.js'
import auth from '../middleware/auth.js'
import { upload } from '../middleware/multer.js'

export const userRouter=express.Router()

userRouter.get('/current',auth,getCurrentUser)
userRouter.post('/update',auth,upload.single("assistantImage"),updateUser)
userRouter.post('/asktoassistant',auth,askToGemini)