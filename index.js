import express from 'express'
import dotenv from 'dotenv'
import { connectDatabase } from './config/db.js';
import  {authRouter}  from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { userRouter } from './routes/user.routes.js';
import { geminiResponse } from './gemini.js';

dotenv.config()

const app=express()
app.use(cors({
    origin: true,
    credentials: true
  }));
 


app.use(express.json())
app.use(cookieParser())
app.use('/api/v1',authRouter)
app.use('/api/v1/user',userRouter)




const port=process.env.PORT || 5000;
app.listen(port,()=>{
    connectDatabase()
console.log(`Server is run ${port}`)
})