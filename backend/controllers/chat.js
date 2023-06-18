const { Magic } = require("@magic-sdk/admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Creator = require("../models/Creator");
const uploadImage = require("./uploadImage");
const fs = require("fs");
const Post = require("../models/Post");
const Chat = require("../models/Chat");

exports.sendChat = async (req, res) => {
  try {
    const { chatBody, walletAddress, userName, creatorWalletAddress } =
      req.body;

    const creatorChats = await Chat.findOne({
      walletAddress: creatorWalletAddress,
    });

    if (!creatorChats) {
      await Chat.create({
        walletAddress: creatorWalletAddress,
        chats: [],
      });
    }

    const updatedChats = await Chat.findOneAndUpdate(
      { walletAddress: creatorWalletAddress },
      { $push: { chats: { walletAddress, chatBody, userName } } }
    );

    return res.send(updatedChats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

exports.getByCreatorWallet = async (req, res) => {
  try {
    const { walletAddress } = req.query;
    const creatorChats = await Chat.findOne({ walletAddress });
    return res.send(creatorChats.chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
