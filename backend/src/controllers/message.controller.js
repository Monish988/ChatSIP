import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    const filteredUser = await User.find({
      id: { $ne: loggedInUserId },
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
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: userId },
      ],
    });
    console.log(userId, messages);
    return res
      .status(200)
      .json({ message: "Chats fetched successfully", chats: messages });
  } catch (errr) {
    console.log("Error in fetching chats", errr);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: receiverId } = req.params;
    const { text, image } = req.body;
    console.log(userId, receiverId, text);

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId: userId,
      text: text,
      image: imageUrl,
      senderId: userId,
      receiverId: receiverId,
    });

    await newMessage.save();
    return res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.log("Error in sending message", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
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

    const partnersIds = [...new Set (messages.map((msg)=>msg.senderId.toString()===loggedInUserId.toString()?msg.receiverId.toString():msg.senderId.toString()))]

    const partners = await User.find({_id:{$in:partnersIds}}).select("-password");
    return res.status(200).json({partners});
  } catch (err) {
    console.log("Error in fetching chat partners", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
