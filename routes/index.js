const { verifyJwtToken } = require("../middlewares");

const router = require("express").Router();

router.get("/", verifyJwtToken, (req, res) => {
  return apiResponse(res, 200, { message: "SUCCESS" });
});

module.exports = router;
