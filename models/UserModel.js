const   mongoose = require("mongoose"),
	    passportLocalMongoose = require("passport-local-mongoose"),
	    findOrCreate = require('mongoose-findorcreate');

const UserSchema = new mongoose.Schema({
		intra_id: String,
		email: {
			type: String,
			unique: true
		},
		username: String,
		firstname: String,
		lastname: String,
		age: [Number],
		gender: {
			type: String,
			default: "female"
		},
		locationname: String,
		location: {
			type: {
				type: String,
				enum: ['Point']
			},
			coordinates: {
				type: [Number]
			}
		},
		sexPreferences: {
			type: String,
			default: "bisexual"
		},
		bio: {
			type: String,
			default: "You will like me..."
		},
		interests: [{
			text: String
		}],
		pictures: [{
			src: String,
			pic_id: String,
			isProfile: {
				type: Boolean,
				default: false
			}
		}],
		lastseen: {
			type: Date
		},
		isFilled: {
			type: Boolean,
			default: false
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		password: String,
		token: {
			type: String,
			default: null
		},
		likes: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "likes"
		}],
		visits: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "visits"
		}],
		blockedUsers: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "block"
		}]
	});

UserSchema.index({ location: "2dsphere"}, {sparse: true});
UserSchema.plugin(findOrCreate);

UserSchema.plugin(passportLocalMongoose, {
	usernameUnique: false,
	findByUsername: function (model, params) {
		params.isVerified = true;
		return model.findOne(params);
	}
});

mongoose.model("user", UserSchema);
