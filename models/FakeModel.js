const mongoose = require("mongoose");

const fakeReportsSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "user"
    }
});

mongoose.model("fake", fakeReportsSchema);
