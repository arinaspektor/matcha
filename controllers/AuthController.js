const 	random = require('randomstring'),
  		mongoose = require('mongoose'),
		User = mongoose.model('user'),
		{ VaryfingMail } = require('../services/mailer');

const 	{ HOST } = process.env;

module.exports = {
    signUp: async (req, res) => {
		try {
			const {	username, email,
					firstname, lastname,
					password, location } = req.value.body;

			const { city, longitude, latitude} = location;
			const token = random.generate();

			const newUser = new User({
				username, email,
				firstname, lastname,
				locationname: city,
				location: {
					type: "Point",
					coordinates: [Number(longitude), Number(latitude)]
				},
				token,
				interests: [{
					text: "dating"
				}]
			});

			const url = 'http:\/\/' + HOST + '/verification/' + token;

			await User.register(newUser, password);
			const mail = new VaryfingMail(newUser.email, url);
			await mail.send();

			req.flash("success", `Success! We sent you the verification email to ${email}.`);
			res.redirect("/signin");
		} catch(err) {
			req.flash("error", 'Something went wrong...Try again later');
			res.redirect("/signup");
		}
	},

	verify: (req, res) => {
		const token = req.sanitize(req.params.token);

		User.findOne({token}, (err, user) => {
			if (err || ! user) {
				req.flash("error", err
						? 'Something went wrong...Try again later'
						: 'Link is invalid or already verified');
				return res.redirect("/signin");
			}
			
			user.token = null;
			user.isVerified = true;
			user.save((err) => {
				if (err)
					req.flash('error', 'Something went wrong...Try again later');
				else
					req.flash('success', 'Account is verified. You can signin now');
				res.redirect("/signin");
			});
		});
	}
};
