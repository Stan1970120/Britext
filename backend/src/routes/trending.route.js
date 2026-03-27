import express from "express";
import { getTrendingBooks } from "../controllers/trending.controller.js";
const router = express.Router();

router.get("/", getTrendingBooks);
export default router;