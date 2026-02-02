import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

export default function  generateToken (userID,res){
    const token = jwt.sign({userID:userID},ENV.JWT_SECRET,{
        expiresIn:'7d'
    })

    res.cookie('jwt',token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:true,
        secure:ENV.NODE_ENV==='production'?true:false
    })

    return token;
}