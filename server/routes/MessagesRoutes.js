import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  getMessages,
  deleteForMe,
  deleteForEveryone,
} from "../controllers/MessagesController.js";
import { uploadFile } from "../controllers/fileController.js";
import upload from "../config/multer.js";

const messagesRoutes = Router();

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/delete-for-me", verifyToken, deleteForMe);
messagesRoutes.post("/delete-for-everyone", verifyToken, deleteForEveryone);
messagesRoutes.post("/upload", upload.single("file"), uploadFile);

export default messagesRoutes;