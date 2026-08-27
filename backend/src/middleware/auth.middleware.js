import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); //since jwt will return error if token is invalid..so we are using try catch block
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    // console.log("decoded", decoded);
    const user = await User.findById(decoded.userId).select("-password"); //not sending password to client for security purpose....
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
