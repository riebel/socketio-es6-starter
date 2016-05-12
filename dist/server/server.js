'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _util = require('../shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var server = _http2.default.Server(app);
var io = new _socket2.default(server);
var port = process.env.PORT || 3000;
var users = [];
var sockets = {};

app.use((0, _compression2.default)({}));
app.use(_express2.default['static'](__dirname + '/../client'));

io.on('connection', function (socket) {
    var nick = socket.handshake.query.nick;
    var currentUser = {
        id: socket.id,
        nick: nick
    };

    if ((0, _util.findIndex)(users, currentUser.id) > -1) {
        console.log('[INFO] User ID is already connected, kicking.');
        socket.disconnect();
    } else if (!(0, _util.validNick)(currentUser.nick)) {
        socket.disconnect();
    } else {
        console.log('[INFO] User ' + currentUser.nick + ' connected!');
        sockets[currentUser.id] = socket;
        users.push(currentUser);
        io.emit('userJoin', { nick: currentUser.nick });
        console.log('[INFO] Total users: ' + users.length);
    }

    socket.on('ding', function () {
        socket.emit('dong');
    });

    socket.on('disconnect', function () {
        if ((0, _util.findIndex)(users, currentUser.id) > -1) users.splice((0, _util.findIndex)(users, currentUser.id), 1);
        console.log('[INFO] User ' + currentUser.nick + ' disconnected!');
        socket.broadcast.emit('userDisconnect', { nick: currentUser.nick });
    });

    socket.on('userChat', function (data) {
        var _nick = (0, _util.sanitizeString)(data.nick);
        var _message = (0, _util.sanitizeString)(data.message);
        var date = new Date();
        var time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

        console.log('[CHAT] [' + time + '] ' + _nick + ': ' + _message);
        socket.broadcast.emit('serverSendUserChat', { nick: _nick, message: _message });
    });
});

server.listen(port, function () {
    console.log('[INFO] Listening on *:' + port);
});