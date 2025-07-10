const express = require("express");
const authService = require("../services/authService");
const {
  createReport,
  getMyreport,
  getReports,
  getReport,
  updateReport,
  deleteReport,
} = require("../services/reportService");

const router = express.Router();

router
  .route("/myreport")
  .get(authService.protect, authService.allowedTo("user"), getMyreport);

router
  .route("/")
  .post(authService.protect, authService.allowedTo("user"), createReport)
  .get(getReports);
router
  .route("/:id")
  .get(getReport)
  .put(authService.protect, authService.allowedTo("user"), updateReport)
  .delete(authService.protect, authService.allowedTo("admin"), deleteReport);
module.exports = router;
