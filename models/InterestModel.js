const mongoose = require("mongoose");

const InterestSchema = new mongoose.Schema({
	text: { type: String, unique: true }
});

mongoose.model("Interest", InterestSchema);