const express = require("express");
const multer = require("multer");
const { sendChat, getByCreatorWallet } = require("../controllers/chat");
const upload = multer({ dest: 'uploads/' })

const router = express.Router();

router.post("/sendChat", sendChat);
router.get("/getByCreatorWallet", getByCreatorWallet);

module.exports = router;
