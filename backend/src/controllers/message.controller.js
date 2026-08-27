import Message from "../models/message.model.js";
import User from "../models/user.models.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  //to get all users for sidebar except the logged in user(myself)

  try {
    const loggedUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password"); //find all the users except the logged in user
    //and dont give password to client even though it is hashed

    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.log("Error while getting users for sidebar", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    //get messages between sender and receiver
    const messages = await Message.find({
      $or: [
        { senderId: userToChatId, recieverId: myId }, //if userToChatId is sender and myId is receiver

        { senderId: myId, recieverId: userToChatId }, //if myId is sender and userToChatId is receiver
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error while getting messages", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    // console.log("recieverId", recieverId);
    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      //Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      //new initializes an object based on the schema, setting up the necessary properties
      senderId,
      recieverId,
      message: text,
      image: imageUrl,
    });

    await newMessage.save();
    //need of socket io..Imagine you're having a real-time conversation with someone. You don't want to constantly refresh the page to see if they've replied, right? That's where Socket.IO comes in!
    //This means messages can be sent and received instantly without needing to refresh the page.
    //socket io is used to send messages in real time

    const receiverSocketId = getReceiverSocketId(recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error while sending message", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
