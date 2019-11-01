const mongoose = require("mongoose");

const likesSchema = new mongoose.Schema({
    likedId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	},
	likerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	}
});

mongoose.model("likes", likesSchema);