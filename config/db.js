import mongoose from "mongoose"

export const  connectDatabase  =async  () =>{
    try {
       await mongoose.connect(process.env.mongoose_url)
        console.log('Databse Connected successfull')
    } catch (error) {
        console.log(error)
    }
}

