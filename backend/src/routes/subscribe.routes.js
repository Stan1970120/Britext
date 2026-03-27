import express from "express";
const router = express.Router();
import { 
  subscribeNewsletter, 
  unsubscribeNewsletter, 
  broadcastNewsletter 
} from "../controllers/subscribe.controller.js";

// Public routes
router.post("/", subscribeNewsletter);
router.get("/unsubscribe/:id", unsubscribeNewsletter);

// Admin route (Add your protect/admin middleware here later)
router.post("/broadcast", broadcastNewsletter);

export default router;