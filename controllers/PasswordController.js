const 	random = require('randomstring'),
        mongoose = require('mongoose'),
        User = mongoose.model('user'),
        { ResetPassMail } = require('../services/mailer');

const 	{ HOST } = process.env;

module.exports = {
	sendResetMail: async (req, res) => {
		try {
			const { email } = req.value ? req.value.body : req.user;

			const user = req.user || await User.findOne({email});

			user.token = random.generate();
			const url = 'http:\/\/' + HOST + '/reset/' + user.token;

			await user.save();
			const mail = new ResetPassMail(user.email, url);
			await mail.send();

			req.flash("success", `Success! We sent you email to ${user.email}.`);
			res.redirect(req.user ? "back" : "/signin");
		} catch(err) {
			req.flash("error", 'Something went wrong...Try again later');
			res.redirect("back");
		}
	},

    resetCheck: (req, res) => {
        const token = req.sanitize(req.params.token);
        
        User.findOne({token}, (err, user) => {
			if (err || ! user) {
				req.flash("error", err
						? 'Something went wrong...Try again later'
						: 'Link is invalid or already used');
				return res.redirect("/");
			}
            res.render('reset', {token});
		});
    },
    
    resetPass: (req, res) => {
        const token = req.sanitize(req.params.token);
        const { password } = req.value.body;

        User.findOne({token})
            .then(user => {
                if (! user) {
                    req.flash("error", 'Link is invalid or already used');
                    return res.redirect("/");
                }
                return user.setPassword(password);
            })
            .then(user => {
                user.token = null;
                return user.save();
            })
            .then(() => {
                req.flash("success", 'Password is successfully reset!');
			    res.redirect(req.user ? "back" : "/signin");
            })
            .catch(err => {
                req.flash("error", 'Something went wrong...Try again later');
                return res.redirect("/");
            });
    }
};
