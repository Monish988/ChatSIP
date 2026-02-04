import express from 'express';
import  {signup,login,logout,update}  from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcJetProtection } from '../middleware/arcjet.middleware.js';

const router = express.Router();

router.use(arcJetProtection);

router.post('/signup',signup)

router.post('/login',login)

router.post('/logout',logout)

router.put("/update-profile",protectRoute,update)

router.get('/check-auth',protectRoute,(req,res)=>res.status(200).json({message:"Authorized",user:req.user}))

export default router;