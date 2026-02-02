import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import generateToken from "../lib/utils.js";

const signup = async (req, res)=>{
    const {fullname,email,password} = req.body;
    try{
    

    if(!fullname || !email || !password){
        return res.status(400).json({message:"All fields are required"});
    }
   

    if(password.length < 6){
        return res.status(400).json({message:"Password must be at least 6 characters long"});
    }

    if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)){
        return res.status(400).json({message:"Invalid email address"});
    }
   

    const user = await User.findOne({email:email})

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    if(user){
        return res.status(400).json({message:"User with this email already exists"});
    }

    const newUser = new User({
        fullname,
        email,
        password:hashedPassword
    })

    if(newUser){
        generateToken(newUser._id,res);
        await newUser.save();
        return res.status(201).json({message:"User created successfully",user:newUser});
    }
    else{
        return res.status(500).json({message:"Failed to create user"});
    }

}
catch(err){
    console.error("Error in Signup Controller:",err);
    return res.status(500).json({message:"Internal server error"});
}
res.send('Signup Route');

}

export default signup;