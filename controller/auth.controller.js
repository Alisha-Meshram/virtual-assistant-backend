import { generateToken } from "../config/token.js";
import {User} from "../models/user.js";
import bcrypt from "bcrypt";


export const Register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ message: "This email already exsist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be atleast 6" });
    }

    const user = await User.create({ name, email, password: hashPassword });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });
    res.status(201).json(user);
  } catch (error) {
    console.log(error)

    res.status(500).json({ message: error.message });
  }
};


export const Login= async(req,res)=>{
try {
    const{email,password}=req.body

    const user= await User.findOne({email})

    if(!user){
        return res.status(400).json({message:"User not found"})
    }
    const isMatch= await bcrypt.compare(password,user.password)

    if(!isMatch){
        return res.status(400).json({message:"incorrect password"})
    }
    const token=generateToken(user._id)
    console.log(token,"token")


    res.cookie('token',token,{
        httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    })

    res.status(200).json({message:"Login successfull",})
} catch (error) {
    res.status(500).json({message:`login error ${error}`})
}
}

export const Logout=async(req,res)=>{
try {
    res.clearCookie('token')
    res.status(200).json({message:"Logout Successfull"})
} catch (error) {
    res.status(500).json({message:`logout error ${error}`})
}
}