import express from "express";
import { authenticatedClients } from "./index";

const router = express.Router();

router.get("/lan", (req, res) => {
  const onlineUsers = Array.from(authenticatedClients.keys());
  res.json({ onlineUsers });
});

export default router;