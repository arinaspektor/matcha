const   mongoose = require("mongoose");

const   notificationSchema = new mongoose.Schema({
    notType: String,
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
},  { timestamps: true})

mongoose.model("notification", notificationSchema);