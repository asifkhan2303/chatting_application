import express from "express";
import authRoute from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import cors from "cors";

import path from "path";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: "10mb" })); //payload ki limit increase ki hai...
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
); // this is used to allow the frontend to make requests to the backend because both are running on different ports

app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoutes);


server.listen(PORT, () => {
  console.log("Server is running on Port:", PORT);
  connectDB();
});
