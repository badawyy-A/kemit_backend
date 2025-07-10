const Chat = require("../models/chatbotImageModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinary");
const { uploadSingleImage } = require("../middleware/uploadImageMiddleware");

exports.uploadImage = uploadSingleImage("file");

//Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const transformationOptions = {
      width: 500,
      height: 500,
      crop: "fill",
      gravity: "auto",
      format: "auto",
      quality: "auto",
    };
    // upload file to cloadnairy
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "Kemet/traces", // specify cloudinary folder
      // resource_type : "video", // specify video resource type
      transformation: transformationOptions, // specify transformation options
    });

    req.body.file = result.secure_url;
    // Return the url of the uploaded file
    // return res.json({ url: result.secure_url });
  }
  next();
});

exports.saveChat = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { file, king_name, description, video } = req.body;

    if (!file) {
      return res.status(400).json({ error: "file مطلوب." });
    }

    const chat = await Chat.create({
      userId,
      file,
      king_name,
      description,
      video,
    });

    res.status(201).json({
      message: "تم حفظ الشات بنجاح.",
      chat,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ في السيرفر." });
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
