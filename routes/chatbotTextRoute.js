const express = require("express");
const router = express.Router();
const { saveChat, getChats } = require("../services/chatbotTextService");
const { protect } = require("../services/authService");

router.post("/", protect, saveChat);
router.get("/", protect, getChats); // pagination with query: ?page=1&limit=10

module.exports = router;
