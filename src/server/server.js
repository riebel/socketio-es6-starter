'use strict';

import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import compression from 'compression';
import {validNick, findIndex, sanitizeString} from '../shared/util';

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 3000;
let users = [];
let sockets = {};

app.use(compression({}));
app.use(express['static'](__dirname + '/../client'));

io.on('connection', (socket) => {
    let nick = socket.handshake.query.nick;
    let currentUser = {
        id: socket.id,
        nick: nick
    };

    if (findIndex(users, currentUser.id) > -1) {
        console.log('[INFO] User ID is already connected, kicking.');
        socket.disconnect();
    } else if (!validNick(currentUser.nick)) {
        socket.disconnect();
    } else {
        console.log('[INFO] User ' + currentUser.nick + ' connected!');
        sockets[currentUser.id] = socket;
        users.push(currentUser);
        io.emit('userJoin', {nick: currentUser.nick});
        console.log('[INFO] Total users: ' + users.length);
    }

    socket.on('ding', () => {
        socket.emit('dong');
    });

    socket.on('disconnect', () => {
        if (findIndex(users, currentUser.id) > -1) users.splice(findIndex(users, currentUser.id), 1);
        console.log('[INFO] User ' + currentUser.nick + ' disconnected!');
        socket.broadcast.emit('userDisconnect', {nick: currentUser.nick});
    });

    socket.on('userChat', (data) => {
        let _nick = sanitizeString(data.nick);
        let _message = sanitizeString(data.message);
        let date = new Date();
        let time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

        console.log('[CHAT] [' + time + '] ' + _nick + ': ' + _message);
        socket.broadcast.emit('serverSendUserChat', {nick: _nick, message: _message});
    });
});

server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});