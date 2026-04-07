import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullname, email, password, username } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = (username || normalizedEmail.split("@")[0]).trim().toLowerCase();

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const newUser = new User({
      fullname: fullname.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    if (newUser) {
      await newUser.save();
      generateToken(newUser._id, res);
      try {
        sendWelcomeEmail(normalizedEmail, newUser.fullname, ENV.CLIENT_URL);
      } catch (err) {}
      return res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(500).json({ message: "Failed to create user" });
    }
  } catch (err) {
    console.error("Error in Signup Controller:", err);
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Email or username already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
  res.send("Signup Route");
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPassword = password?.trim();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const user = await User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: "i" } });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(normalizedPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.log("Error in Login Controller: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logout Successfully" });
};

export const update = async (req, res) => {
  const { profilePic } = req.body;
  if (!profilePic) {
    return res.status(400).json({ message: "Profile Picture is required" });
  }

  try {
    const userId = req.user._id;
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Profile Updated Successfully", user: updatedUser });
  } catch (err) {
    console.error("Error in Update Profile Controller:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
