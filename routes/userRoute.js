const express = require("express");

const {
  getUser,
  getLoggedUserData,
  getAllUsers,
  updateUser,
  updateUserRole,
  deactvateLoggedUser,
  reactivateUser,
  getDeactivatedUsers,
  deleteLoggedUser,
  getAllAdmins,
  deleteUserAndAdmin,
  CreateAdmin,
  updateUserPassword,
  uploadUserImage,
  resizeImage,
  updateUserPhoto,
} = require("../services/userService");

const {
  idUserValidator,
  updateUserValidator,
} = require("../utils/validators/userValidator");

const { protect, allowedTo } = require("../services/authService");
const router = express.Router();

router.use(protect);

router.get("/getMe", getLoggedUserData);

router.put(
  "/updatephoto",
  updateUserValidator,
  uploadUserImage,
  resizeImage,
  updateUserPhoto
);

router.put("/updateMe", updateUserValidator, updateUser);

router.put("/deactivateMe", deactvateLoggedUser);

router.delete("/deleteMe", deleteLoggedUser);
router.put("/updateUserPassword", updateUserPassword);

//-------------------only for admin ---------------------
router.use(allowedTo("admin"));

router.put("/updateRole/:id", idUserValidator, updateUserRole);
router.put("/reactivate/:id", idUserValidator, reactivateUser);
router.get("/deactivated", getDeactivatedUsers);
router.get("/all", getAllUsers);
router.get("/getAdmins", getAllAdmins);
router.delete("/delete/:id", deleteUserAndAdmin);
router.get("/:id", idUserValidator, getUser);
router.post("/createAdmin", CreateAdmin);

module.exports = router;
