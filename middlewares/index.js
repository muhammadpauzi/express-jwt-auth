const { TokenExpiredError, ...jwt } = require("jsonwebtoken");
const User = require("../models/User");

const verifyJwtToken = async (req, res, next) => {
  try {
    if (!req.cookies.token)
      return res.status(401).json({ message: "NO_TOKENS_PROVIDED" });

    const { token: jwtToken } = req.cookies;
    jwt.verify(
      jwtToken,
      process.env.JWT_SECRET_KEY,
      async (err, decodedJwtToken) => {
        if (err instanceof TokenExpiredError) {
          console.log("TOKEN_WAS_EXPIRED");
          return res.status(401).json({ message: "TOKEN_WAS_EXPIRED" });
        }

        if (err) {
          console.log(err);
          return res.status(401).json({ message: "TOKEN_NOT_VALID" });
        }

        const user = await User.findOne(decodedJwtToken.id);
        if (!user)
          return res.status(404).json({ message: "NO_USER_WITH_THE_TOKEN" });

        if (!user.sessionId)
          return res
            .status(401)
            .json({ message: "THE_USER_ALREADY_LOGGED_OUT" });

        req.user = {
          id: user.id,
          username: user.username,
        };
        next();
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "SERVER_ERROR", error_message: error.message });
  }
};

const blockLoggedInUser = async (req, res, next) => {
  try {
    if (!req.cookies.token) return next();

    const { token: jwtToken } = req.cookies;
    jwt.verify(
      jwtToken,
      process.env.JWT_SECRET_KEY,
      async (err, decodedJwtToken) => {
        if (err) {
          if (err instanceof TokenExpiredError) {
            console.log("TOKEN_WAS_EXPIRED");
          }
          console.log(err);
          return next();
        }

        const user = await User.findOne(decodedJwtToken.id);
        if (user && user?.sessionId) {
          return res
            .status(403)
            .json({ message: "THE_USER_ALREADY_LOGGED_IN" });
        }
        return next(); // user not exists on db or jwt error must be run next() function
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "SERVER_ERROR", error_message: error.message });
  }
};

module.exports = { verifyJwtToken, blockLoggedInUser };
