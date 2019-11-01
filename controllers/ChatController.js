const   mongoose = require('mongoose');

const   Chat = mongoose.model("chat"),
        Message = mongoose.model("message");

module.exports = {
   all: (req, res) => {
        Chat
            .find({members: req.user._id, isActive: true})
            .populate({
                path: 'members',
                match: {_id: {$ne: req.user._id}},
                select: 'username pictures -_id'
            })
            .populate('lastMessage', 'author body -_id')
            .exec()
            .then(chats => {
                chats.map(chat => {
                    chat.members.map(member => {
                        member.pictures = member.pictures.filter(pic => pic.isProfile);
                    })
                })
                res.render("chat", {chats});
            })
            .catch(err => {
                req.flash("error", "Something went wrong... Try again later!");
                res.redirect("back");
            })
    },

    private: (req, res) => {
        const chatId = req.sanitize(req.params.chatId);

        Chat
            .findOne({_id: chatId, members: req.user._id, isActive: true})
            .populate({
                path: 'members',
                match: {_id: {$ne: req.user._id}},
                select: 'username pictures lastseen'
            })
            .exec()
            .then(chat => {
                if (! chat)
                    return res.redirect("/chat/all");
                
                Message.find({chatId: chat._id}, 'author body -_id', (err, data) => {  
                    res.render("chatroom", { chat, data});
                });
            })
            .catch(err => {
                req.flash("error", "This chat is not active anymore!");
                res.redirect("/chat/all");
            })
    },

    push: (chatId, author, body, socket) => {
        if (body.trim().length > 0) { 
            let chat = '';

            Chat.findOne({_id: chatId, isActive: true})
                .then(found => {
                    chat = found;
                    return chat ? Message.create({author, body, chatId}) : null;
                })
                .then(message => {
                    if (! message) {
                        socket.emit(chatId).emit('not active');
                        return ;
                    }
                    chat.lastMessage = message._id;
                    socket.broadcast.to(chatId).emit('recieve message', body);
                    return chat.save();
                })
                .catch();
        }
        
    }
}