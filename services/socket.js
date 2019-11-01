const   moment = require('moment'),
        mongoose = require('mongoose');

const   ChatController = require('../controllers/ChatController'),
        Notification = mongoose.model('notification'),
        Chat = mongoose.model('chat');

let	    onlineUsersList = [],
        usersInChat = {};

const   setAsDisconnected = (socket, user) => {
    onlineUsersList = onlineUsersList.filter( (id) => {
        return id.toString() !== user._id.toString();
    });
        
    user.lastseen = Date.now();
    user.save((err) => {
        if (err)
            return ;

        const lastseen = moment(user.lastseen).fromNow();
        socket.broadcast.emit('status', { onlineUsersList, lastseen });
    });
}

const   deleteFromChat = (id) => {
    const keys = Object.keys(usersInChat);

    for (const key of keys) {
        if (usersInChat[key].includes(id)) {
            const index = usersInChat[key].indexOf(id);
            usersInChat[key].splice(index, 1);
            break ;
        }
    }
}


module.exports = {
    onConnect: (socket) => {
        const { user } = socket.request;

        if (socket.request.user.logged_in)
            onlineUsersList.push(socket.request.user._id);

        socket.emit('status', { onlineUsersList, lastseen: null });
        socket.broadcast.emit('status', { onlineUsersList, lastseen: null });

        socket.on('create', (room) => {
            socket.join(room);
        });


        socket.on('add new notification', (data) => {
            const notification =  {
                                    from: user.username,
                                    type: data.type,
                                    isMatch: data.isMatch,
                                    url: data.url,
                                    id: data.id
                                };

            socket.to(data.to).emit('recieve new notification', notification);
        });


        socket.on('new message notification', (room) => {
           if (usersInChat[room].length < 2) {
               Chat
                .findOne({ _id: room, isActive: true})
                .then(chat => {
                    if (chat) {
                        const to = chat.members.find(o => o.toString() !== user._id.toString());
                        return Notification.create({notType: "message", to, from: user._id});
                    }
                    return null;
                })
                .then(not => {
                    if (! not)
                        return ;
                    socket.to(not.to).emit('recieve new notification', {
                        from: user.username,
                        type: not.notType,
                        id: not._id
                    }); 
                })
                .catch(() => {return ;});
           }

        });

        socket.on('disconnect', (data) => { setAsDisconnected(socket, user) });
    },


    connectedToChat: (socket) => {
        const { user } = socket.request;

        socket.on('join', (room) => {
            socket.join(room);

            if (! usersInChat[room])
                usersInChat[room] = [];
            if (! usersInChat[room].includes(user._id.toString()))
                usersInChat[room].push(user._id.toString());
        });


        socket.on('send message', (data) => {
            const { room, message } = data;
   
            ChatController.push(room, user._id, message, socket);
        });

        socket.on('disconnect', (data) => { 
            deleteFromChat(user._id.toString());
        });
    }
}; 