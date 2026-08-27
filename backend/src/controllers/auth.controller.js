import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  //   console.log("Request body", req.body);

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //hashing password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should have more than 6 characters" });
    }
    //Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    //making hashed salt from given pasword
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate jwt tokens
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json({ message: "Invalid User data" });
    }
  } catch (error) {
    console.log("Error while creating account", error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password); //initially hashed password by bcrypt

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    //generate jwt tokens
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error while login", error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};
export const logout = (req, res) => {
  //just clear the cookie to logout the user
  try {
    res.cookie("jwt", "", { maxAge: 0 }); //cookie which expires immediately
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error while logout", error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic); //uploading image to cloudinary

    const user = await User.findById(userId);

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true } //new:user--> returns updated user...otherwise it will return old user
    ); //updating profile pic of user in database
    // console.log(updateUser,"UpdatedUser");
    return res.status(200).json(updateUser);
  } catch (error) {
    console.log("Error while updating profile", error);
    return res.status(500).json({ message: "Interval Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user); //just send the user back to the client ...
  } catch (error) {
    console.log("Error while checking auth", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
