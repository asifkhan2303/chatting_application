import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    }, //message and images are not required because user can send only image or only message or both
    image: {
      type: String,
    },
  },
  { timestamps: true }
); //timestamps:true will automatically add createdAt and updatedAt fields

const Message = mongoose.model("Message", messageSchema);

export default Message;
