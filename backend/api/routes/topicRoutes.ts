import { Router } from "express";
import {
  createTopicHandler,
  publishMessageHandler,
} from "../controllers/topicController";

const router = Router();

// POST /api/topics
router.post("/", createTopicHandler);

// POST /api/topics/:topicId/messages
router.post("/:topicId/messages", publishMessageHandler);

export default router;