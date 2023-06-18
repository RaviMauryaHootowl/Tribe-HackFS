const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true
    },
    emailId: {
        type: String
    },
    isCreator: {
        type: Boolean,
        default: false,
        required: true
    },
    isOwnWallet: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);