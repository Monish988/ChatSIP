import express from "express";
import { ENV } from "./lib/env.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import messagesRouter from "./routes/messages.route.js";
import path from "path";
import connectDB from "./lib/db.js";
import cors from "cors"
import http from "http";
import { initSocket } from "./lib/socket.js";
const __dirname = path.resolve();
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  ENV.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(",").map((item) => item.trim()))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin || "");

    if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};


app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use('/api/auth',authRouter);
app.use('/api/messages',messagesRouter);




//FOR PRODUCTION
if(ENV.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')));
    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,'../frontend/dist/index.html'));
    })
}

// Only start the server if this file is run directly (not imported as a module)
if (import.meta.url === `file://${path.resolve(process.argv[1])}`) {
  async function startServer() {
    await connectDB();
    initSocket(server, corsOptions);
    server.listen(ENV.PORT, () => {
      console.log("Server Started Successfully on port", ENV.PORT);
    });
  }
  startServer();
}

export default app;