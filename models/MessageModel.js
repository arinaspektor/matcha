const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    body: String,
    isRead: {
        type: Boolean,
        default: false
    },
    chatId: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'chat'
    }
},   { timestamps: true });

mongoose.model("message", messageSchema)