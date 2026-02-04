import express from "express";
import { ENV } from "./lib/env.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import messagesRouter from "./routes/messages.route.js";
import path from "path";
import connectDB from "./lib/db.js";
const __dirname = path.resolve();
const app = express();


app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use('/api/messages',messagesRouter);




//FOR PRODUCTION
if(ENV.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')));
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'../frontend/dist/index.html'));
    })
}

async function startServer() {
  connectDB();
  app.listen(ENV.PORT, () => {
    console.log("Server Started Successfully");
  });
}
startServer();