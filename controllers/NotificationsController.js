const   mongoose = require('mongoose');

const   Notification = mongoose.model('notification');


module.exports = {
    all: (req, res) => {
        const { id } = req.user;

        Notification
            .find({to: id})
            .populate('from', 'username likes -_id')
            .exec()
            .then(result => {
                const notifications = [];
                result.map(o => {
                    notifications.push({
                        id: o._id,
                        type: o.notType,
                        from: o.from.username,
                    });
                })
                res.json({success: true, notifications});
            })
            .catch(err => {
                res.json({succes: false});
            })
    },

    delete: (req, res) => {
       const id = req.sanitize(req.params.id);

       Notification
        .findByIdAndDelete(id)
        .then(result => {
            res.json({succes: true});
        })
        .catch(err => {
            res.json({succes: false});
        })
   }
}