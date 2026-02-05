import express from "express";
import {
  getAllContacts,
  getUserChats,
  sendMessage,
  getChatPartners
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcJetProtection } from "../middleware/arcjet.middleware.js";
const router = express.Router();

router.use(protectRoute);
router.get("/contacts",getAllContacts);

router.get("/chats",getChatPartners);

router.get("/:id",  getUserChats);

router.post("/send/:id", sendMessage);

export default router;
