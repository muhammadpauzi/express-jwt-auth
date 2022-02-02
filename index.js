const express = require("express");
const csrf = require("csurf");
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(
  csrf({ cookie: true, httpOnly: true, sessionKey: process.env.SESSION_KEY })
);
app.use(cors());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/", require("./routes/index"));

mongoose.connect(
  process.env.MONGODB_URI,
  {
    keepAlive: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  (err) => {
    if (err) {
      return console.log("Error connecting to MongoDB :", err);
    }
    console.log("Connected to mongodb");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  }
);
