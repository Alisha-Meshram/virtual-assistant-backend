import express from 'express'
import { Login, Logout, Register } from '../controller/auth.controller.js'

export const authRouter=express.Router()

authRouter.post('/register',Register)
authRouter.post('/login',Login)
authRouter.get('/logout',Logout)