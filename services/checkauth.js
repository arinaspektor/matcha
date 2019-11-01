module.exports = {
	checkIfSignedIn: (req, res, next) => {
		req.isAuthenticated()
		? res.redirect("/feed/browse")
		: next();
	},

	requireLogin: (req, res, next) => {
		if (req.isAuthenticated())
			return next();
		req.flash("error", "Please sign in first!");
		res.redirect("/signin");
	}
}