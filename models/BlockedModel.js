const mongoose = require("mongoose");

const blockedSchema = new mongoose.Schema({
	blockedId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	blockerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
});

mongoose.model("block", blockedSchema);