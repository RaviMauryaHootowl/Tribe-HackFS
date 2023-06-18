const { Magic } = require("@magic-sdk/admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Creator = require("../models/Creator");
const uploadImage = require("./uploadImage");
const fs = require("fs");
const Post = require("../models/Post");
const { ethers } = require("ethers");
const { Database } = require("@tableland/sdk");

const usersTable = "users_80001_6990";
const creatorsTable = "creators_80001_7029";
const projectsTable = "projects_80001_6992";
const membersTable = "members_80001_6993";
const postsTable = "posts_80001_6995";
const likesTable = "likes_80001_6996";

const privateKey =
  "0x7a62aa11fa06bc5f21ef8819674ce87876b678f7e288b9c8347fdd3eff7faf89";
const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78"
);
const wallet = new ethers.Wallet(privateKey, provider);
const signer = wallet.connect(provider);
const db = new Database({ signer });

exports.createPost = async (req, res) => {
  try {
    const { file } = req;
    console.log(file);
    const resImg = await uploadImage(file.path);
    fs.unlink(file.path, (err) => {
      console.log(err);
    });
    // const resImg = {secure_url: "asdf"};
    const { walletAddress, emailId, caption, isMemberOnly } = req.body;
    console.log(isMemberOnly);

    var isMemOnly = 0;

    if(isMemberOnly === "true") {
        isMemOnly = 1;
    }

    const { meta: insertPost } = await db
      .prepare(
        `INSERT INTO ${postsTable} (emailId, walletAddress, picUrl, caption, isMemberOnly) values ('${emailId}', '${walletAddress}', '${resImg.secure_url}', '${caption}', '${isMemOnly}');`
      )
      .run();

    console.log("hello");

    await insertPost.txn.wait();

    const data = await db.prepare(`SELECT * FROM ${postsTable};`).all();

    return res.send(data.results[data.results.length - 1]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.getPostsByUserWallet = async (req, res) => {
  try {
    const { emailId } = req.query;

    // const creatorsList = await Creator.find({ "members.emailId": emailId });

    const creatorsListData = await db
      .prepare(
        `SELECT * FROM ${creatorsTable} where id=(SELECT creatorId from ${membersTable} WHERE memberEmail='${emailId}');`
      )
      .all();

    const creatorsList = creatorsListData.results;

    const validPostsList = [];
    console.log(creatorsList);
    for (let i = 0; i < creatorsList.length; ++i) {
      const creator = creatorsList[i];

      const userData = await db
        .prepare(
          `SELECT * FROM ${usersTable} WHERE emailId='${creator.emailId}' limit 1;`
        )
        .all();
      const user = userData.results[0]; // st user = await User.findOne({emailId: creator.emailId});

      const postsData = await db
        .prepare(
          `SELECT * FROM ${postsTable} WHERE emailId='${creator.emailId}';`
        )
        .all();

      const posts = postsData.results; // st posts = await Post.find({ emailId: creator.emailId });
      posts.forEach((post) => {
        validPostsList.push({
          ...post,
          profilePic: creator.profilePic,
          fullName: user.fullName,
        });
      });
    }

    validPostsList.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    return res.send(validPostsList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.getPostsOfCreator = async (req, res) => {
  try {
    const { emailId, creatorEmailId } = req.query;

    const isMemberOfCreatorObjData = await db
      .prepare(
        `SELECT * FROM ${creatorsTable} where emailId='${creatorEmailId}' and id in (SELECT creatorId from ${membersTable} WHERE memberEmail='${emailId}');`
      )
      .all();
    const isMemberOfCreatorObj = isMemberOfCreatorObjData.results;
    const isMember =
      isMemberOfCreatorObj.length !== 0
        ? true
        : emailId === creatorEmailId
        ? true
        : false;
    const validPostsList = [];

    const userData = await db
      .prepare(
        `SELECT * FROM ${usersTable} WHERE emailId='${creatorEmailId}' limit 1;`
      )
      .all();
    const user = userData.results[0];

    const creatorData = await db
      .prepare(
        `SELECT * FROM ${creatorsTable} WHERE emailId='${creatorEmailId}' limit 1;`
      )
      .all();
    const creator = creatorData.results[0];

    let posts = [];
    if (isMember) {
      const postsData = await db
        .prepare(
          `SELECT * FROM ${postsTable} WHERE emailId='${creatorEmailId}';`
        )
        .all();
      posts = postsData.results;
    } else {
      const postsData = await db
        .prepare(
          `SELECT * FROM ${postsTable} WHERE emailId='${creatorEmailId}' and isMemberOnly=0;`
        )
        .all();
      posts = postsData.results;
    }
    posts.forEach((post) => {
      validPostsList.push({
        ...post,
        profilePic: creator.profilePic,
        fullName: user.fullName,
      });
    });
    validPostsList.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    return res.send(validPostsList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
