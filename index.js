import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDb } from "./db/index.js";
import { app, server } from "./socket/socket.js";

dotenv.config();
const port = process.env.PORT || 8000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("hello, world!");
});


import authRouter from "./router/auth.router.js";
import { messageRouter } from "./router/message.router.js";
import { userRoute } from "./router/user.router.js";
import postRouter from './router/post.router.js'

app.use("/auth", authRouter);
app.use("/message", messageRouter);
app.use("/user", userRoute);
app.use('/post', postRouter)

server.listen(port, () => {
  connectDb();
  console.log(`Server is running on port http://localhost:${port}`);
});
