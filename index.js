const express = require("express");
const dotenv = require("dotenv");
const ApiError = require("./utils/apiError");
dotenv.config({ path: "config.env" });
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const mountRoutes = require("./routes/index");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/database");
//Routes
// const mountRoutes = require("./routes");
const path = require("path");
//connect with db
dbConnection();

//express app
const app = express();

// // forgetpassword
// const session = require("express-session");

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET, // Replace with your own secret
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false, maxAge: 30 * 60 * 1000 }, // Set secure to true if using HTTPS 30 دقيقة
//   })
// );

// إعدادات الخادم وزيادة الحد المسموح به للبيانات
app.use(express.json({ limit: "100mb" })); // تحديد الحد الأقصى لحجم JSON إلى 5 ميجابايت
app.use(express.urlencoded({ limit: "100mb", extended: true })); // زيادة الحد لحجم البيانات المشفرة بـ URL

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

//Middleware
// app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads"))); // /name photo => in localhost

if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
  console.log(process.env.NODE_ENV);
}

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.use((req, res, next) => {
//   res.status(404).send("Can't find this route: " + req.originalUrl);
// });

//
const Verification = require("./models/codeModel");

const deleteExpiredVerifications = async () => {
  const now = new Date();

  try {
    // Find all expired records
    const expiredVerifications = await Verification.find({
      expiresAt: { $lt: now },
    });

    // Delete all expired records
    await Verification.deleteMany({
      _id: { $in: expiredVerifications.map((v) => v._id) },
    });

    console.log(
      `${expiredVerifications.length} expired verifications deleted.`
    );
  } catch (err) {
    console.error("Error deleting expired verifications:", err);
  }
};

// Call the function
deleteExpiredVerifications();

//Mount Routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  //Create error and send it to error handling middleware
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

//Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

//handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down...`);
    process.exit(1);
  });
});
