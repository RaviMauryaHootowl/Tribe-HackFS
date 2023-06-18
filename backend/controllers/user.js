const { Magic } = require('@magic-sdk/admin');
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Creator = require('../models/Creator');
const uploadImage = require('./uploadImage');
const fs = require("fs");
const crypto = require("crypto");
const { recoverPersonalSignature } = require("eth-sig-util");
const rug = require("random-username-generator");

exports.getToken = (req, res) => {
    try {
        req.session.token = crypto.randomBytes(32).toString("hex");

        req.session.save((error) => {
            console.log(error);
        });

        // console.log("token",req.session.token)

        res.status(200).json({
            message:
                "Hey, Sign this message to prove you have access to this wallet, this is your token " +
                req.session.token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error,
        });
    }
};

exports.verifyToken = async (req, res) => {
    const nounce =
        "Hey, Sign this message to prove you have access to this wallet, this is your token " +
        req.session.token;

    console.log("TOKEN, VERIFY", req.body);

    const signature = recoverPersonalSignature({
        data: nounce,
        sig: req.body.signature,
    });

  console.log(signature)

    // if (signature.toLowerCase() != req.body.address.toLowerCase()) {
    if (false) {
        res.status(401).json({
            message: "Invalid signature",
        });
    } else {
        // save user in data base if not exist

        const userExist = await User.findOne({
            walletAddress: req.body.address
        });
        if (!userExist) {
            var new_username = rug.generate();

            const newUser = await User.create({
                userName: `${new_username}`,
                fullName: `Full Name_${new_username}`,
                walletAddress: req.body.address,
                emailId: ""
            });
            // const newUser = await User.create({
            //     wallet_address: req.body.address,
            //     username: new_username,
            // });
        }

    const token = jwt.sign(
      { address: req.body.address },
      process.env.JWT_SECRET
    );

        res.status(200).json({
            message: "Token verified",
            token,
        });
    }
};

exports.getUser = async (req, res) => {
    try {
      console.log(req.params);
      const user_instance = await User.findOne({
        walletAddress: req.params.address
      });
      res.status(200).json(
        user_instance
      );
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  };

exports.magicLoginUser = async (req, res) => {
    console.log('magic login')
    try {
        const m = new Magic(process.env.MAGICLINK_PUBLISHABLE_KEY);
        const mAdmin = new Magic(process.env.MAGICLINK_SECRET_KEY);

        const DIDToken = req.body.didToken;
        const userInfo = req.body.userInfo;
        const userEmail = userInfo.email;
        const [proof, claim] = mAdmin.token.decode(DIDToken);

        const issuer = mAdmin.token.getIssuer(DIDToken);
        const publicAddress = mAdmin.token.getPublicAddress(DIDToken);

        let userObj = await User.findOne({emailId: userEmail}).exec();
        let isUserNew = false;
        if(!userObj){
            userObj = await User.create({
                userName: `username_${userEmail}`,
                fullName: `Full Name_${userEmail}`,
                walletAddress: publicAddress,
                emailId: userEmail
            });
            isUserNew = true;
        }

        console.log("CREATED USR", userObj)
        let message = "Loged in";

        const token = jwt.sign(
            { wallet_address: publicAddress },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            user_instance: userObj,
            message: message,
            token,
            isUserNew
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.magicLoginCreator = async (req, res) => {
    console.log('magic login creator')
    try {
        const m = new Magic(process.env.MAGICLINK_PUBLISHABLE_KEY);
        const mAdmin = new Magic(process.env.MAGICLINK_SECRET_KEY);

        const DIDToken = req.body.didToken;
        const userInfo = req.body.userInfo;
        const userEmail = userInfo.email;
        const [proof, claim] = mAdmin.token.decode(DIDToken);

        const issuer = mAdmin.token.getIssuer(DIDToken);
        const publicAddress = mAdmin.token.getPublicAddress(DIDToken);

        let userObj = await User.findOne({emailId: userEmail}).exec();
        let creatorObj;
        let isUserNew = false;

        if(!userObj){
            userObj = await User.create({
                userName: `username_${userEmail}`,
                fullName: `Full Name_${userEmail}`,
                walletAddress: publicAddress,
                emailId: userEmail,
                isCreator: true
            });
            creatorObj = await Creator.create({
                emailId: userEmail,
                profilePic: "",
                description: "some temp description",
                isVotingLive: false,
                projects: []
            });
            isUserNew = true;
        }else{
            creatorObj = await Creator.findOne({emailId: userEmail}).exec();
            if(!creatorObj){
                return res.status(409).json({
                    message: "Email already registered as a User"
                });
            }
        }

        console.log("CREATED USR", userObj)
        let message = "Loged in";

        console.log(userObj.toObject());

        const token = jwt.sign(
            { wallet_address: publicAddress },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            user_instance: {...(userObj.toObject()), ...(creatorObj.toObject())},
            message: message,
            token,
            isUserNew
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.getAllCreators = async (req, res) => {
    try{
        const creatorsList = await User.find({isCreator: true});
        const updatedCreatorList = [];
        for(let i = 0; i < creatorsList.length; i++){
            const creatorInfo = await Creator.findOne({emailId: creatorsList[i].emailId});
            if(creatorInfo.profilePic != ""){
                updatedCreatorList.push({...(creatorsList[i].toObject()), ...(creatorInfo.toObject())})
            }
        }
        return res.send(updatedCreatorList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.getSubscriptionListOfUser = async (req, res) => {
    try{
        const {emailId} = req.query;
        console.log(emailId);
        const creatorsList = await Creator.find();
        const updatedCreatorList = [];
        for(let i = 0; i < creatorsList.length; i++){
            const isUserSubscribed = creatorsList[i].members.filter((member) => member.emailId == emailId);
            if(isUserSubscribed.length > 0){
                const creatorUserInfo = await User.findOne({emailId: creatorsList[i].emailId});
                updatedCreatorList.push({...(creatorsList[i].toObject()), ...(creatorUserInfo.toObject())});
            }
        }
        return res.send(updatedCreatorList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.setCreatorInfo = async (req, res) => {
    try{
        const {emailId, name, description, benefits, profilePic, nftTemplate, socialUrl, chatId} = req.body;
        console.log(emailId);
        const userInfo = await User.findOne({emailId});
        if(!userInfo){
            return res.status(404).json({message: "User does not exists"});
        }
        await User.findOneAndUpdate(
            {emailId},
            {fullName: name, userName: name}
        ).exec();
        await Creator.findOneAndUpdate(
            {emailId},
            {description, benefits, profilePic, nftTemplate, socialUrl, chatId}
        ).exec();

        const updatedUserInfo = await User.findOne({emailId});
        const updatedCreatorInfo = await Creator.findOne({emailId});
        return res.send({...(updatedUserInfo.toObject()), ...(updatedCreatorInfo.toObject())});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.getCreatorInfo = async (req, res) => {
    try{
        const {walletAddress} = req.query;
        const userInfo = await User.findOne({walletAddress});
        const creatorInfo = await Creator.findOne({emailId: userInfo.emailId});
        return res.send({...(userInfo.toObject()), ...(creatorInfo.toObject())});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.joinMembership = async (req, res) => {
    try{
        const {emailIdCreator, emailId} = req.body;
        const creatorInfo = await Creator.findOne({emailId: emailIdCreator});
        if(creatorInfo.members.filter((c) => c.emailId == emailId).length == 0){
            await Creator.findOneAndUpdate(
                {emailId: emailIdCreator},
                { $push: {members: {emailId}} }
            ).exec();
        }
        return res.send({message: "success"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.updateVotingInfo = async (req, res) => {
    try{
        const {emailId, votingName, votingDesc} = req.body;
        await Creator.findOneAndUpdate(
            {emailId},
            { votingName, votingDesc }
        ).exec();

        return res.send({message: "success"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}

exports.uploadImageController = async (req, res) => {
    try{
        const { file } = req;
        console.log(file);
        const resImg = await uploadImage(file.path);
        fs.unlink(file.path, (err) => {
            console.log(err);
        });
        res.send(resImg.secure_url);
    }catch(e){
        res.status(500).send(e);
    }
}