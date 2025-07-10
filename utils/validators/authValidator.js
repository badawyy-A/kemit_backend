const { check } = require("express-validator");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const User = require("../../models/userModel");

const gmailRegex = /^[a-zA-Z0-9._%+-]+@(?:gmail\.com)$/i;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%*?&])[A-Za-z\d#$@!%*?&]{8,}$/;

exports.signupUserValidator = [
  check("firstName")
    .notEmpty()
    .withMessage("firstname required")
    .isLength({ min: 3 })
    .withMessage("firstname must be at least 3 characters long")
    .matches(/^[\p{L}'][ \p{L}'-]{1,49}$/u)
    .withMessage("firstname should only contain English letters"),
  check("lastName")
    .notEmpty()
    .withMessage("lastName required")
    .isLength({ min: 3 })
    .withMessage("lastName must be at least 3 characters long")
    .matches(/^[\p{L}'][ \p{L}'-]{1,49}$/u)
    .withMessage("lastName should only contain English letters"),
  check("userName")
    .notEmpty()
    .withMessage("userName required")
    .isLength({ min: 3 })
    .withMessage("userName must be at least 3 characters long")
    .matches(/^[\p{L}'][ \p{L}'-]{1,49}$/u)
    .withMessage("userName should only contain English letters"),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email")
    .custom(async (val, { req }) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already exists");
      }
      if (!gmailRegex.test(val)) {
        throw new Error(
          "email must be start with char, Matches the '@' symbol and Non-capturing group that matches the literal characters 'gmail.com '"
        );
      }
    }),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      if (!strongPasswordRegex.test(password)) {
        throw new Error(
          "Password must be at least 8 characters ,have at least one capital letter ,have at least one small letters ,have at least one digit and one special charachter"
        );
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirmation required"),
  check("role").optional(),

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email"),
  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters"),
  validatorMiddleware,
];

exports.resetValidator = [
  check("newPassword")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 8 })
    .withMessage("password must be at least 6 characters")
    .custom((newPassword, { req }) => {
      if (newPassword !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      if (!strongPasswordRegex.test(newPassword)) {
        throw new Error(
          "Password must be at least 8 characters ,have at least one capital letter ,have at least one small letters ,have at least one digit and one special charachter"
        );
      }
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirmation required"),
  validatorMiddleware,
];
