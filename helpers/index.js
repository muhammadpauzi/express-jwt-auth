const crypto = require("crypto");
const User = require("../models/User");

const validateBodyUser = (req, res) => {
  const { username = "", password = "" } = req.body;

  if (!username || !password) {
    return res.status(422).json({
      message: "VALIDATION_ERROR",
      errors: {
        username: "USERNAME_REQUIRED",
        password: "PASSWORD_REQUIRED",
      },
    });
  }

  return req.body;
};

const randomKey = (length = 10) => {
  return new Promise((resolve, reject) => {
    return crypto.randomBytes(length, (err, buffer) => {
      if (err) return reject(err);
      return resolve(buffer.toString("base64"));
    });
  });
};

module.exports = {
  validateBodyUser,
  randomKey,
};
