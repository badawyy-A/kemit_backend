const Chat = require("../models/chatbotTextModel");
const asyncHandler = require("express-async-handler");

exports.saveChat = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { text, response } = req.body;

    if (!text || !response) {
      return res.status(400).json({ error: "Text and response are required." });
    }

    const chat = await Chat.create({ userId, text, response });

    res.status(201).json({
      message: "chat saved successfully.",
      chat,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});

exports.getChats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalChats = await Chat.countDocuments({ userId });

    const chats = await Chat.find({ userId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "chat history retrieved successfully.",
      currentPage: page,
      totalPages: Math.ceil(totalChats / limit),
      totalChats,
      chats,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error." });
  }
});
