const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    emailId: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    picUrl: {
        type: String
    },
    caption: {
        type: String
    },
    likes: [{
        walletAddress: String
    }],
    isMemberOnly: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);