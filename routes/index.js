const { verifyJwtToken } = require("../middlewares");

const router = require("express").Router();

router.get("/", verifyJwtToken, (req, res) => {
  return res.status(200).json({ message: "SUCCESS" });
});

module.exports = router;
