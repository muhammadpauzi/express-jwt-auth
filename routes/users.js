const { verifyJwtToken } = require("../middlewares");

const router = require("express").Router();

router.get("/user", verifyJwtToken, (req, res) => {
  return res.status(200).json({ message: "SUCCESS", data: req.user });
});

module.exports = router;
