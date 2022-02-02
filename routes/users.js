const { verifyJwtToken } = require("../middlewares");

const router = require("express").Router();

router.get("/user", verifyJwtToken, (req, res) => {
  return apiResponse(res, 200, { message: "SUCCESS", data: req.user });
});

module.exports = router;
