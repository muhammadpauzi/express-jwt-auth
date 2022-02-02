const { validateBodyUser, randomKey } = require("../helpers");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { verifyJwtToken, blockLoggedInUser } = require("../middlewares");

const router = require("express").Router();

router.post("/login", blockLoggedInUser, async (req, res) => {
  const {
    username: requestUsername,
    password,
    remember_me = false,
  } = validateBodyUser(req, res);

  try {
    const user = await User.findOne({
      username: requestUsername,
      password,
    });
    // username or password are not registered on database
    if (!user) return res.status(401).json({ message: "CREDENTIALS_ERROR" });
    // for securing jwt -> pzn video php jwt ngobar
    const sessionId = await randomKey();
    await User.updateOne(
      { username: user.username },
      {
        sessionId,
      }
    );

    const payload = jwt.sign(
      {
        user: { id: user.id },
        sessionId: sessionId,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: remember_me ? "5d" : "1d",
      }
    );

    res.cookie("token", payload, { httpOnly: true });

    return res.status(200).json({
      message: "USER_HAS_BEEN_SUCESSFULLY_LOGGED_IN",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "SERVER_ERROR", error_message: error.message });
  }
});

router.post("/register", blockLoggedInUser, async (req, res) => {
  const { username: requestUsername, password } = validateBodyUser(req, res);

  try {
    const user = await User.findOne({
      username: requestUsername,
    });

    if (user) return res.status(409).json({ message: "USER_ALREADY_EXISTS" });

    const { _id: id, username } = await User.create({
      username: requestUsername,
      password,
    });

    return res.status(201).json({
      message: "USER_HAS_BEEN_SUCCESSFULLY_REGISTERED",
      user: {
        id,
        username,
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "SERVER_ERROR", error_message: error.message });
  }
});

router.delete("/logout", verifyJwtToken, async (req, res) => {
  try {
    const { id } = req.user;
    // reset sessionId of the user
    await User.updateOne(
      { _id: id },
      {
        sessionId: null,
      }
    );
    // reset token in cookie
    res.cookie("token", "");

    return res
      .status(200)
      .json({ message: "USER_HAS_BEEN_SUCCESSFULLY_LOGGED_OUT" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "SERVER_ERROR", error_message: error.message });
  }
});

router.get("/csrf-token", (req, res) => {
  res.cookie("x-csrf-token", req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;
