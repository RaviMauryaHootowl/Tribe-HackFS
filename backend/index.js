const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const bodyParser = require("body-parser");
const uploadImage = require("./controllers/uploadImage.js");
require("dotenv").config();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    require("express-session")({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
    })
);

// import routes
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const chatRouter = require("./routes/chat");
const mongoose = require("mongoose");
const { uploadImageController } = require("./controllers/user.js");

mongoose.connect(process.env.MONGO_URI);

const allowCORS = (req, res, next) => {
    var origin = req.get("origin");
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
};

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/chat", chatRouter);

app.post("/uploadImage", upload.single('image'), uploadImageController);


app.get("/", (req, res) => {
    console.log(req);
    res.send("Hello World");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log("[+] Listening on PORT: " + PORT);
});
