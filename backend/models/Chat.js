const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    walletAddress: {
        type: String,
        required: true,
    },
    chats: [
        {
            type: new mongoose.Schema(
                {
                    chatBody: String,
                    walletAddress: String,
                    userName: String
                },
                { timestamps: true }
            ),
        },
    ],
});

module.exports = mongoose.model("Chat", chatSchema);
