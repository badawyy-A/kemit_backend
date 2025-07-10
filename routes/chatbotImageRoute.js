const express = require("express");
const router = express.Router();
const {
  uploadImage,
  resizeImage,
  saveChat,
  getChats,
} = require("../services/chatbotImageService");
const { protect } = require("../services/authService");

router.post("/", protect, uploadImage, resizeImage, saveChat);
router.get("/", protect, getChats); // pagination with query: ?page=1&limit=10

module.exports = router;
