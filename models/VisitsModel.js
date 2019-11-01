const mongoose = require("mongoose");

const visitsSchema = new mongoose.Schema({
	profileId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
	},
	visitorId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	}
});

mongoose.model("visits", visitsSchema);