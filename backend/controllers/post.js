const { Magic } = require("@magic-sdk/admin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Creator = require("../models/Creator");
const uploadImage = require("./uploadImage");
const fs = require("fs");
const Post = require("../models/Post");

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

        const newPost = await Post.create({
            walletAddress,
            emailId,
            picUrl: resImg.secure_url,
            caption,
            likes: [],
            isMemberOnly,
        });

        return res.send(newPost);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};

exports.getPostsByUserWallet = async (req, res) => {
    try {
        const { emailId } = req.query;

        const creatorsList = await Creator.find({ "members.emailId": emailId });
        const validPostsList = [];
        console.log(creatorsList);
        for (let i = 0; i < creatorsList.length; ++i) {
            const creator = creatorsList[i];
            const user = await User.findOne({emailId: creator.emailId});
            const posts = await Post.find({ emailId: creator.emailId });
            posts.forEach((post) => {
                validPostsList.push({...(post.toObject()), profilePic: creator.profilePic, fullName: user.fullName})
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

        const isMemberOfCreatorObj = await Creator.findOne({ emailId: creatorEmailId, "members.emailId": emailId });
        const isMember = isMemberOfCreatorObj ? true : (emailId == creatorEmailId ? true : false);
        const validPostsList = [];
        
        const user = await User.findOne({emailId: creatorEmailId});
        const creator = await Creator.findOne({emailId: creatorEmailId});
        let posts = [];
        if(isMember){
            posts = await Post.find({ emailId: creatorEmailId });
        }else {
            posts = await Post.find({ emailId: creatorEmailId, isMemberOnly: false });
        }
        posts.forEach((post) => {
            validPostsList.push({...(post.toObject()), profilePic: creator.profilePic, fullName: user.fullName})
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