import io from 'socket.io-client';
import ChatClient from './chat/client';
import {validNick} from '../../shared/util'

class Client {
    constructor () {
        let btn = document.getElementById('startButton'),
            userNameInput = document.getElementById('userNameInput');
        
        btn.onclick = () => {
            this.startChat(userNameInput.value);
        };

        userNameInput.addEventListener('keypress', (e) => {
            let key = e.which || e.keyCode;

            if (key === 13) {
                this.startChat(userNameInput.value);
            }
        });
    }

    startChat(nick) {
        let nickErrorText = document.querySelector('#startMenu .input-error');

        if (validNick(nick)) {
            nickErrorText.style.opacity = 0;
            this.nick = nick;
        } else {
            nickErrorText.style.opacity = 1;
            return false;
        }

        this.socket = io({query: "nick=" + this.nick});
        this.setupSocket();

        this.chat = new ChatClient(this.socket, this.nick);
        this.setupChat();

        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('chatbox').style.display = 'block';
    }

    checkLatency() {
        this.startPingTime = Date.now();
        this.socket.emit('ding');
    }

    setupSocket() {
        this.socket.on('dong', () => {
            this.latency = Date.now() - this.startPingTime;
            this.chat.addSystemLine('Ping: ' + this.latency + 'ms');
        });

        this.socket.on('connect_failed', () => {
            this.socket.close();
        });

        this.socket.on('disconnect', () => {
            this.socket.close();
        });

        this.socket.on('userDisconnect', (data) => {
            this.chat.addSystemLine('<b>' + (data.nick.length < 1 ? 'Anon' : data.nick) + '</b> disconnected.');
        });

        this.socket.on('userJoin', (data) => {
            this.chat.addSystemLine('<b>' + (data.nick.length < 1 ? 'Anon' : data.nick) + '</b> joined.');
        });

        this.socket.on('serverSendUserChat', (data) => {
            this.chat.addChatLine(data.nick, data.message, false);
        });
    }

    setupChat() {
        this.chat.registerCommand('ping', 'Check your latency.', () => {
            this.checkLatency();
        });

        this.chat.registerCommand('help', 'Information about the chat commands.', () => {
            this.chat.printHelp();
        });

        this.chat.addSystemLine('Connected to the chat!');
        this.chat.addSystemLine('Type <b>/help</b> for a list of commands.');
    }
}

window.onload = () => {
    new Client();
};