const express = require("express");

const router = express.Router();

const {
    magicLoginUser, magicLoginCreator, getAllCreators, getCreatorInfo, joinMembership, setCreatorInfo, updateVotingInfo, getSubscriptionListOfUser, getToken, verifyToken, getUser
} = require("../controllers/user");

router.get("/getToken", getToken);
router.get("/getUser/:address", getUser);
router.post("/verifyToken", verifyToken);
router.post("/magicLoginUser", magicLoginUser);
router.post("/magicLoginCreator", magicLoginCreator);
router.get("/getAllCreators", getAllCreators);
router.get("/getCreatorInfo", getCreatorInfo);
router.post("/setCreatorInfo", setCreatorInfo);
router.post("/joinMembership", joinMembership);
router.post("/updateVotingInfo", updateVotingInfo);
router.get("/getSubscriptionListOfUser", getSubscriptionListOfUser);

module.exports = router;
