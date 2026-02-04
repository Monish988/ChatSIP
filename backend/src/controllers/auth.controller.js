import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({ email: email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);
      try {
        sendWelcomeEmail(email, fullname, ENV.CLIENT_URL);
      } catch (err) {}
      return res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } else {
      return res.status(500).json({ message: "Failed to create user" });
    }
  } catch (err) {
    console.error("Error in Signup Controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
  res.send("Signup Route");
};

export const login = async(req,res)=>{
  const {email,password} = req.body;
  try{

    const user = await User.findOne({email:email});
    if(!user){
      return res.status(400).json({message:"Invalid Credentials"});
    }

    const isPasswordCorrect = await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect){
      return res.status(400).json({message:"Invalid Credentials"});
    }
    generateToken(user._id,res);
    return res.status(200).json({message:"Login Successful",user:user});

  }
  catch(err){
    console.log("Error in Login Controller: ",err);
    return res.status(500).json({message:"Internal Server Error"});
  }
}


export const logout = (_,res)=>{
  res.cookie('jwt','',{maxAge:0});
  res.status(200).json({message:'Logout Successfully'})
}


export const update = async(req,res)=>{
  const {profilePic} = req.body;
  if(!profilePic){
    return res.status(400).json({message:"Profile Picture is required"});
  }

  try{
    const userId = req.user._id;
    const uploadResponse  = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
    

    return res.status(200).json({message:"Profile Updated Successfully",user:updatedUser});

  }
  catch(err){
    console.error("Error in Update Profile Controller:",err);
    return res.status(500).json({message:"Internal Server Error"});
  }
}



