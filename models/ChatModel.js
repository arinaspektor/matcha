const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

mongoose.model("chat", chatSchema)