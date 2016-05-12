'use strict';

import {validNick, findIndex, sanitizeString} from '../shared/util';
import express from 'express';
import compression from 'compression';

let server = express();
let http = require('http').Server(server);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;
let users = [];
let sockets = {};

server.use(express['static'](__dirname + '/../client'));
server.use( compression( {} ) );

io.on('connection', (socket) => {
    let name = socket.handshake.query.name;

    let currentUser = {
        id: socket.id,
        name: name
    };

    if (findIndex(users, currentUser.id) > -1) {
        console.log('[INFO] User ID is already connected, kicking.');
        socket.disconnect();
    } else if (!validNick(currentUser.name)) {
        socket.disconnect();
    } else {
        console.log('[INFO] User ' + currentUser.name + ' connected!');
        sockets[currentUser.id] = socket;
        users.push(currentUser);

        io.emit('userJoin', {name: currentUser.name});

        console.log('[INFO] Total users: ' + users.length);
    }

    socket.on('ding', () => {
        socket.emit('dong');
    });

    socket.on('disconnect', () => {
        if (findIndex(users, currentUser.id) > -1) users.splice(findIndex(users, currentUser.id), 1);
        console.log('[INFO] User ' + currentUser.name + ' disconnected!');

        socket.broadcast.emit('userDisconnect', {name: currentUser.name});
    });

    socket.on('userChat', (data) => {
        let _sender = sanitizeString(data.sender);
        let _message = sanitizeString(data.message);
        let date = new Date();
        let time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);
        
        console.log('[CHAT] [' + time + '] ' + _sender + ': ' + _message);
        socket.broadcast.emit('serverSendUserChat', {sender: _sender, message: _message});
    });
});

http.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});