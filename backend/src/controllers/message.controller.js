import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { emitToUser, isUserOnline } from "../lib/socket.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const query = (req.query.q || "").trim().toLowerCase();

    const searchFilter = query
      ? {
          $or: [
            { fullname: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
      ...searchFilter,
    }).select("-password");

    return res.status(200).json({ users: filteredUser });
  } catch (err) {
    console.log("Error in fetching contacts", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: userToChatId } = req.params;
    const { cursor, limit = "20" } = req.query;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const timeFilter = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: userId },
      ],
      ...timeFilter,
    })
      .sort({ createdAt: -1 })
      .limit(parsedLimit + 1)
      .lean();

    const hasMore = messages.length > parsedLimit;
    const paginatedMessages = hasMore ? messages.slice(0, parsedLimit) : messages;
    const orderedMessages = paginatedMessages.reverse();
    const nextCursor = hasMore ? paginatedMessages[paginatedMessages.length - 1].createdAt : null;

    const now = new Date();
    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: userId,
        readAt: null,
      },
      {
        $set: {
          deliveredAt: now,
          readAt: now,
        },
      },
    );

    emitToUser(userToChatId, "messages:read", {
      byUserId: userId,
      fromUserId: userToChatId,
      readAt: now,
    });

    return res.status(200).json({
      chats: orderedMessages,
      nextCursor,
      hasMore,
    });
  } catch (errr) {
    console.log("Error in fetching chats", errr);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: receiverId } = req.params;
    const { text, image, file } = req.body;

    if (!text && !image && !file) {
      return res.status(400).json({ message: "Message content is required" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chatsip/messages",
      });
      imageUrl = uploadResponse.secure_url;
    }

    let fileUrl;
    let fileType = null;
    if (file) {
      const uploadResponse = await cloudinary.uploader.upload(file, {
        resource_type: "raw",
        folder: "chatsip/files",
      });
      fileUrl = uploadResponse.secure_url;
      fileType = uploadResponse.format === "pdf" ? "pdf" : null;
    }

    const deliveredAt = isUserOnline(receiverId) ? new Date() : null;

    const newMessage = new Message({
      senderId: userId,
      text: text,
      image: imageUrl,
      fileUrl,
      fileType,
      receiverId: receiverId,
      deliveredAt,
    });

    await newMessage.save();

    emitToUser(receiverId, "messages:new", { message: newMessage });
    emitToUser(userId, "messages:new", { message: newMessage });

    return res.status(200).json({ message: "Message sent successfully", data: newMessage });
  } catch (err) {
    console.log("Error in sending message", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const messages = await Message.find({
      $or: [
        {
          senderId: loggedInUserId,
        },
        {
          receiverId: loggedInUserId,
        },
      ],
    });

    const partnersIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const partners = await User.find({ _id: { $in: partnersIds } })
      .select("-password")
      .lean();

    const onlineUserSet = new Set();
    partners.forEach((partner) => {
      if (isUserOnline(partner._id)) {
        onlineUserSet.add(partner._id.toString());
      }
    });

    return res.status(200).json({ partners, onlineUserIds: Array.from(onlineUserSet) });
  } catch (err) {
    console.log("Error in fetching chat partners", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const reactToMessage = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { messageId } = req.params;
    const emoji = (req.body.emoji || "").trim();

    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isParticipant =
      message.senderId.toString() === userId || message.receiverId.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "Not allowed to react to this message" });
    }

    const existingReaction = message.reactions.find((reaction) => reaction.userId.toString() === userId);
    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        message.reactions = message.reactions.filter((reaction) => reaction.userId.toString() !== userId);
      } else {
        existingReaction.emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const payload = {
      messageId: message._id,
      reactions: message.reactions,
    };

    emitToUser(message.senderId, "messages:reaction", payload);
    emitToUser(message.receiverId, "messages:reaction", payload);

    return res.status(200).json({ reactions: message.reactions });
  } catch (err) {
    console.log("Error in reacting to message", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
