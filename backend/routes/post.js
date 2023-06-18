const express = require("express");
const { createPost, getPostsByUserWallet, getPostsOfCreator } = require("../controllers/post");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' })

const router = express.Router();

router.post("/create", upload.single('image'), createPost);
router.get("/getByUserWallet", getPostsByUserWallet);
router.get("/getPostsOfCreator", getPostsOfCreator);

module.exports = router;
