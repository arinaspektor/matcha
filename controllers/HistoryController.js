const   mongoose = require('mongoose');

const   Visits = mongoose.model('visits'),
        Likes = mongoose.model('likes');


module.exports = {
    showVisits: (req, res) => {
        const { _id } = req.user;

        Visits
            .find({profileId: _id})
            .populate('visitorId', 'username age pictures')
            .exec((err, data) => {
                if (err)
                    return res.redirect("back");

                const users = [];
                data.map((o) => {
                    const user = o.visitorId;
                    const picture = user.pictures.find(o => o.isProfile);
                    users.push({  id: user._id, username: user.username, age: user.age,
                                  picture: picture ? picture.src : null });
                });
                res.render('history', { users: users.reverse(), type: 'visits' });
            })
    },

    showLikes: (req, res) => {
        const { _id } = req.user;
        
        Likes
            .find({likedId: _id})
            .populate('likerId', 'username age pictures')
            .exec((err, data) => {
                if (err)
                    return res.redirect("back");

                const users = [];

                data.map((o) => {
                    const user = o.likerId;
                    const picture = user.pictures.find(o => o.isProfile);
                    users.push({  id: user._id, username: user.username, age: user.age,
                                  picture: picture ? picture.src : null });
                });
                res.render('history', { users: users.reverse(), type: 'likes' });
            })
    }
}