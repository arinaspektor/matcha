const   mongoose = require('mongoose'),
        User = mongoose.model('user'),
        Likes = mongoose.model('likes'),
        { decodeLocation } = require('./geocoder');

module.exports = {
    isUnique: async (req, res, next) => {
		try {
			const { username, email } = req.value.body;

			const usernameIsUnique = await User.find({ username });
            if ((! req.user || req.user.username !== username)
                && usernameIsUnique.length > 0) {
				req.flash("error", "This username is already in use!");
				return res.redirect("back");
			}
		
			const emailIsUnique =  await User.find({ email });
			if ((! req.user || req.user.email !== email) &&
                emailIsUnique.length > 0) {
				req.flash("error", "This email is already in use!");
				return res.redirect("back");
			}

			next();
		} catch (err) {
			req.flash("error", 'Something went wrong...Try again later');
			res.redirect("/signup");
		}
    },
    
    isVerified: (req, res, next) => {
        const { username } = req.value.body;

        if (typeof username === 'undefined') {
            req.flash("error", `Username can't be empty`);
            return res.redirect("/signin");
        }

        User.findOne({username}, (err, user) => {
            if (! err && user && user.isVerified)
                return next();

            if (err)
                req.flash("error", 'Something went wrong...Try again later');
            else if (! user)
                req.flash("error", 'Password or username is incorrect');
            else if (! user.isVerified)
                req.flash("error", 'You have to verify account first. Check your email!');
            res.redirect("/signin");
        });
    },

    profileIsFilled: (req, res, next) => {
        if (req.user.isFilled)
            return next();
        req.flash("error", "Please fill out your profile data!")
        res.redirect("/profile/edit");
    },

    checkOauthAndVerified: (req, res, next) => {
        const { email } = req.value.body;

        if (typeof email === 'undefined') {
            req.flash("error", 'Please enter email');
            return res.redirect("/forgot");
        }

        User.findOne({email}, (err, user) => {
            if (! err && user && ! user.intra_id && user.isVerified)
                return next();

            if (err)
                req.flash("error", 'Something went wrong...Try again later');
            else if (! user)
                req.flash("error", 'Email is incorrect');
            else {
                if (user.intra_id)
                    req.flash("error", 'Please, just sign in with Intra 42!');
                else 
                    req.flash("error", 'You have to verify account first. Check your email!');
                res.redirect("/signin");
            }
            res.redirect("/forgot");
        });
    },

    checkOauth: (req, res, next) => {
        if (! req.user.intra_id)
            return next();

        req.flash("error", `It's not for you! Just keep signing in with Intra 42!`);
        res.redirect("back");
    },

    countPhotos: (req, res, next) => {
        const { user } = req;

        if (user.pictures.length == 5) {
            req.flash("error", "Max 5 pictures. Please delete one to upload a new one.");
            return res.redirect("back");
        }

        next();
    },

    fileIsPresent: (req, res, next) => {
        if (typeof req.file === 'undefined') {
            req.flash("error", "You didn't choose any file");
		    return res.redirect('back');
        }
        
        next();
    },

    belongsToUser: (req, res, next) => {
        const pic_id = req.sanitize(req.params.pic_id);
        const { user } = req;

        const picture = user.pictures.find(o => o.pic_id === pic_id);

        if (typeof picture !== 'undefined') {
            req.picture = picture;
            return next();
        }
            
        req.flash("error", "Picture not found");
        res.redirect('back');
    },

    checkLocation: async (req, res, next) => {
        const checkedLocation = await decodeLocation(req.value['body'].location);

        if (! checkedLocation.length) {
            req.flash("error", "Please check your location data. We can't find it on a map!");
            return res.redirect("back");
        }
       
        req.value.body.checkedLocation = checkedLocation[0];

        next();
    },

    isValidLike: async (req, res, next) => {
        try {
            const likedId = req.sanitize(req.params.userId);
            const { user } = req;
           
            if (likedId.toString() === user._id.toString())
                return res.json({status: false, msg: "You can't like yourself!"});
            else if (! user.pictures.length)
                return res.json({status: false, msg: "Please add a picture to your profile first!"})
            else {
                const alreadyLiked = await Likes.find({likedId, likerId: user._id});
                
                if (! alreadyLiked.length)
                    return next();
                res.json({status: false, msg: "You have already liked this user!"})
            }
        } catch (err) {
            res.json({status: false, msg:  "Something went wrong... Try again later!"})
        }
    },

    checkIfBlocked: (req, res, next) => {
        const username = req.sanitize(req.params.username);

        User.findOne({ username })
            .populate('blockedUsers', 'blockedId')
            .exec()
            .then(user => {
                if (user
                    && ! user.blockedUsers.find(o => o.blockedId.toString() === req.user._id.toString()))
                    return next();

                req.flash("error", user ? "Oops... You are blocked!" : "User not found");
                res.redirect('back');
            })
            .catch(err => {
                req.flash("error", "Something went wrong... Try again later!");
                res.redirect('back');
            })
    },

    checkIfBlockedForFetch: (req, res, next) => {
        const _id = req.sanitize(req.params.userId);

        User.findOne({_id})
            .populate('blockedUsers', 'blockedId')
            .exec()
            .then(user => {
                if (user
                    && ! user.blockedUsers.find(o => o.blockedId.toString() === req.user._id.toString())
                    && ! req.user.blockedUsers.find(o => o.blockedId.toString() === user._id.toString())) {
                        req.liked = user;
                        return next();
                    }
                    

                if (req.user.blockedUsers.find(o => o.blockedId.toString() === user._id.toString()))
                    return res.json({success: false, msg: "You blocked this account!"})
                res.json({success: false, msg: user ? "Oops... You are blocked!" : "User not found"})
            })
            .catch(err => { res.json({success: false, msg: "Something went wrong... Try again later!"}) });

    }

}