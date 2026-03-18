import jwt from 'jsonwebtoken'

async function auth(req,res,next){
    try {
        const token= req.cookies.token

        if(!token){
            return res.status(400).json({message:"Token does not found"})
        }

        const verifyToken= jwt.verify(token,process.env.SECRET_KEY)

        req.userId=verifyToken.userId
        next()

    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export default auth