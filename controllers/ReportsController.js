const   mongoose = require('mongoose');

const   User = mongoose.model('user'),
        Fake = mongoose.model('fake'),
        Blocked = mongoose.model('block'),
        Chat = mongoose.model('chat'),
        Likes = mongoose.model('likes');

module.exports = {
    fake: async (req, res) => {
        const id = req.sanitize(req.params.userId);

        if (id.toString() === req.user._id.toString())
            return res.redirect("back");
            
        try {
            const user = await User.findOne({_id: id});

            if (! user)
                req.flash("error", "User not found!");
            else {
                await Fake.create({userId: id})
                req.flash("success", "Thank you for your report! We will ckeck this profile asap")
            }
            res.redirect("back");
        } catch (err) {
            req.flash("error","Something went wrong... Please try again!");
            res.redirect("back");
        } 
    },

    block: async (req, res) => {
        const id = req.sanitize(req.params.userId);
        const blocker = req.user;

        if (id.toString() === blocker._id.toString())
            return res.redirect("back");

        try {
            const user = await User.findOne({_id: id});
            if (! user) {
                req.flash("error", "User not found!");
                return res.redirect("/");
            }

            const newBlock = await Blocked.create({blockedId: id, blockerId: blocker._id});
            blocker.blockedUsers.push(newBlock);

            const like = await Likes.findOneAndDelete({likerId: blocker._id, likedId: user._id});
            user.likes.pull(like);
            await user.save();

            await Chat.findOneAndUpdate({$and: [{members: id}, {members: blocker._id}]}, {isActive: false});
            await blocker.save();
            
            req.flash("success", "User is blocked!");
            res.redirect("back");
        } catch(err) {
            req.flash("error","Something went wrong... Please try again!");
            res.redirect("/");
        }
    },


    unblock: async (req, res) => {
        const id = req.sanitize(req.params.userId);
        const blocker = req.user;

        if (id.toString() === blocker._id.toString())
            return res.redirect("back");

        try {
            const user = await User.findById(id);
            if (! user) {
                req.flash("error", "User not found!");
                return res.redirect("/");
            }

            const newUnblock = await Blocked.deleteOne({blockedId: id, blockerId: blocker._id});
            blocker.blockedUsers.pull(newUnblock);
            await blocker.save();
            
            req.flash("success", "User is unblocked!");
            res.redirect("back");
        } catch(err) {
            req.flash("error","Something went wrong... Please try again!");
            res.redirect("/");
        }
    }

}