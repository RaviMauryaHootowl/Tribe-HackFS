const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const creatorSchema = new Schema({
    emailId: {
        type: String,
        required: true
    },
    profilePic: {
        type: String
    },
    nftTemplate: {
        type: String
    },
    chatId: {
        type: String
    },
    description: {
        type: String
    },
    benefits: {
        type: String
    },
    socialUrl: {
        type: String
    },
    isVotingLive: {
        type: Boolean,
        default: false
    },
    projects: [{
        projectName: String,
        projectDescription: String,
        projectCover: String,
    }],
    members: [{
        emailId: String
    }],
    votingName: {
        type: String
    },
    votingDesc: {
        type: String
    }
});

module.exports = mongoose.model('Creator', creatorSchema);