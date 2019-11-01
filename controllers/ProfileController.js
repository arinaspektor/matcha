const   random = require('randomstring'),
        mongoose = require('mongoose'),
        { unlink } = require('fs'),
        { ROOT } = require('../config/config');

const   Interest = mongoose.model('Interest'),
        User = mongoose.model('user'),
        Visits = mongoose.model('visits'),
        Notification = mongoose.model('notification'),
        Chat = mongoose.model("chat");

module.exports = {
    view: (req, res) => {
        const username = req.sanitize(req.params.username);
        let user = null;
        let chatId = null;

        User.findOne({ username })
            .populate('blockedUsers')
            .populate('likes', 'likerId')
            .exec()
            .then(foundUser => {
                user = foundUser;
                return Chat.findOne({$and: [ {members: user._id}, {members: req.user._id}, {isActive: true}]})
            })
            .then(chat => {
                chatId = chat ? chat._id : null;
                if (user._id.toString() !== req.user._id.toString())
                    return Visits.create({profileId: user._id, visitorId: req.user._id}); 
                return null;
            })
            .then(newVisit => {
                if (newVisit) {
                    user.visits.push(newVisit);
                    return user.save();
                }
                return null;
            })
            .then(newVisit => {
                return  newVisit
                        ? Notification.create({notType: "visit", to: user._id, from: req.user._id})
                        : null;
            })
            .then(notification => {
                res.render("profile", { user, chatId, settings: false, notId:  notification ? notification._id : null});
            })
            .catch(err => {
                res.redirect("back");
            });
    },

    updateUserData: (req, res) => {
        const { username, email,
                firstname, lastname,
                age, gender,
                checkedLocation, sexPreferences,
                bio} = req.value['body'];

        const { user } = req;

        user.username = username;
        user.email = email;
        user.firstname = firstname;
        user.lastname = lastname;
        user.age = Number(age);
        user.gender = gender;
        user.sexPreferences = sexPreferences;
        user.locationname = checkedLocation.city;
        user.isFilled = true;
        user.location = {
            type: "Point",
            coordinates: [
                checkedLocation.longitude,
                checkedLocation.latitude
            ]
        };
        user.bio = bio;

        user.save((err) => {
            if (err)
                req.flash("error", "Something went wrong... Try again later!");
            else
                req.flash("success", "Profile data is successfully updated!");
            res.redirect("back");
        });
    },

    finalUpload: (req, res) => {
        const { user, file } = req;

        const picture = {
            isProfile: user.pictures.length ? false : true,
            src: '/uploads/' + file.filename,
            pic_id: random.generate(10)
        }

        user.pictures.push(picture);
        user.save((err) => {
            if (err) {
                req.flash("error", "Something went wrong... Try again later!");
				return res.redirect('back');
            }

            req.flash("success", "Picture was uploaded!");
			res.redirect("back");
        });
    },

    deletePhoto: async (req, res) => {
        const { user, picture } = req;
        const pathToDel = ROOT + '/public' + picture.src;

        user.pictures.pull(picture);
        if (picture.isProfile && user.pictures[0]) {
            user.pictures[0].isProfile = true;
        }
      
        user.save((err) => {
            if (err)
                req.flash("error", "Something went wrong... Try again later!");
            else
                req.flash("success", "Picture is successfully deleted!");
            res.redirect("back");
        });

        unlink(pathToDel, (err) => { return ;});
    },

    setAsProfile: (req, res) => {
        const { user, picture } = req;

        const prev = user.pictures.find(o => o.isProfile === true);
        const indexNew = user.pictures.indexOf(picture);
        const indexPrev = user.pictures.indexOf(prev);

        user.pictures[indexNew].isProfile = true;
        user.pictures[indexPrev].isProfile = false;
        user.save((err) => {
            if (err)
                req.flash("error", "Something went wrong... Try again later!");
            else
                req.flash("success", "Profile picture is successfully changed!");
            res.redirect("back");
        });
    },

    addInterest: async (req, res) => {
        try {
            const { user } = req;
            const { interest } = req.value['body'];
    
            if (interest && ! user.interests.find(o => o.text === interest)) {
                user.interests.push({text: interest});
                await user.save();

                const notUnique = await Interest.findOne({text: interest});
                if (! notUnique) {
                    const newInterest = new Interest({text: interest});
                    await newInterest.save();
                }
            } else
                req.flash("error", "This interest is in your list already!");
      
            res.redirect("back");
        } catch(err) {
            req.flash("error", "Something went wrong... Try again later!");
            res.redirect("back");
        }
    },

    deleteInterest: async (req, res) => {
        const { user } = req;
        const id = req.sanitize(req.params.interest_id);

        const interest = user.interests.find(o => o._id.toString() === id);
        user.interests.pull(interest);

        user.save((err) => {
            if (err)
                req.flash("error", "Something went wrong... Try again later!");
            res.redirect("back");
        })
    },

    getInterestsList: (req, res) => {
        let list = [];

        Interest.find({})
            .then(result => {
                list = JSON.stringify(
                                result.map(o => o.text)
                            );

                res.json(list);
            })
            .catch(err => {
                return res.json(list);
            })
    }
}