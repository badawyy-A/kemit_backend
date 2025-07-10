const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

const User = require("../../models/userModel");

exports.idUserValidator = [
  check("id")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("User ID is not valid"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("firstName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("firstname must be at least 3 characters long")
    .matches(/^[\p{L}'][ \p{L}'-]{1,49}$/u)
    .withMessage("firstname should only contain English letters"),
  check("lastName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("lastName must be at least 3 characters long")
    .matches(/^[\p{L}'][ \p{L}'-]{1,49}$/u)
    .withMessage("lastName should only contain English letters"),
  check("userName")
    .optional()
    .isLength({ min: 3 })
    .withMessage("userName must be at least 3 characters long")
    .matches(/^[\p{L}'][ \p{L}'-]{1,49}$/u)
    .withMessage("userName should only contain English letters"),

  validatorMiddleware,
];
