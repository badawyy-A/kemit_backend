const authRoute = require("./authRoute");
const userRoute = require("./userRoute");
const reportRoute = require("./reportRoute");
const chatTextRoute = require("./chatbotTextRoute");
const chatImageRoute = require("./chatbotImageRoute");
const placeRoute = require("./placesRoute");

// Make sure your routes come after the session middleware

const mountRoutes = (app) => {
  app.use("/auth", authRoute);
  app.use("/users", userRoute);
  app.use("/report", reportRoute);
  app.use("/chatText", chatTextRoute);
  app.use("/chatImage", chatImageRoute);
  app.use("/place", placeRoute);
};

module.exports = mountRoutes;
