import express from "express";
import { getComments, createComment } from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", createComment);

export default router;