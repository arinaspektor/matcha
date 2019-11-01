const   mongoose = require('mongoose');

const   User = mongoose.model("user"),
        Likes = mongoose.model("likes"),
        Chat = mongoose.model("chat"),
        Notification = mongoose.model("notification");

module.exports = { 
    add: (req, res) => {
        const liker = req.user;
        const { liked } = req;
        let isMatch = false;
        let chatId = null;

        Likes.create({likedId: liked._id, likerId: liker._id})
            .then(newLike => {
                liked.likes.push(newLike);
                return liked.save();
            })
            .then(user => {
                isMatch = liker.likes.find(o => o.likerId.toString() === user._id.toString()) ? true : false;
                return isMatch ? Chat.findOne({$and: [ {members: liked._id}, {members: liker._id}]}) : null;
            })
            .then(chat => {
                if (chat && isMatch) {
                    chat.isActive = true;
                    return chat.save();
                }
                else if (! chat && isMatch)
                    return Chat.create({members: [ liked._id, liker._id ]});
                return null;
            })
            .then(chat => {
                chatId = chat ? chat._id : null;
                return Notification.create({notType: "like", to: liked._id, from: liker._id});
            })
            .then(notification => {
                res.json({success: true, isMatch,
                        chat: chatId, id: notification ? notification._id : null});
            })
            .catch(err => {
                res.json({success: false, msg: "Something went wrong... Try again later!"});
            })
    },

    delete: (req, res) => {
        const _id = req.sanitize(req.params.userId);
        const disliker = req.user;
        let disliked = '';
        let wasConnected = false;

        User.findOne({_id})
            .populate('likes', 'likerId')
            .then(found => {
                if (! found)
                    return res.json({success: false});
                disliked = found;
                return Likes.findOneAndDelete({likedId: _id, likerId: disliker._id});
            })
            .then(data => {
                wasConnected = data && disliker.likes.find(o => o.likerId.toString() === disliked._id.toString());
                disliked.likes.pull(data._id);
                return disliked.save();
            })
            .then(() => {
                return  wasConnected
                        ? Chat.findOneAndUpdate({$and: [ {members: disliked._id}, {members: disliker._id}]},
                                            { isActive: false}, {new: true})
                        : null;
            })
            .then(chat => {
                return  wasConnected
                        ? Notification.create({notType: "dislike", to: disliked._id, from: disliker._id})
                        : null;
            })
            .then(notification => {
                res.json({success: true, wasConnected, id: notification ? notification._id : null});
            })
            .catch(err => {
                res.json({success: false});
            })

    }
}