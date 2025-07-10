const express = require("express");
const router = express.Router();
const {
  createPlace,
  getPlaces,
  getPlace,
  updatePlace,
  deletePlace,
  getNearbyPlaces,
  uploadImage,
  resizeImage,
  insertManyPlaces,
} = require("../services/placesService");

router.route("/near").get(getNearbyPlaces);

router.route("/").post(uploadImage, resizeImage, createPlace).get(getPlaces);

router
  .route("/:id")
  .get(getPlace)
  .put(uploadImage, resizeImage, updatePlace)
  .delete(deletePlace);

router.post("/bulk", insertManyPlaces);

module.exports = router;
