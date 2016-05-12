import {sanitizeString} from '../../../shared/util';

export default class ChatClient {
    constructor( socket, nick ) {
        let input = document.getElementById('chatInput');

        this.chatList = document.getElementById('chatList');
        this.socket = socket;
        this.nick = nick;
        this.commands = {};

        input.addEventListener('keypress', (key) => {
            key = key.which || key.keyCode;
            if (key === 13) {
                this.sendChat(sanitizeString(input.value));
                input.value = '';
            }
        });

        input.addEventListener('keyup', (key) => {
            key = key.which || key.keyCode;
            if (key === 27) {
                input.value = '';
            }
        });
    }

    sendChat(text) {
        if (text) {
            if (text.indexOf('/') === 0) {
                // Chat command.
                let args = text.substring(1).split(' ');

                if (this.commands[args[0]]) {
                    this.commands[args[0]].callback(args.slice(1));
                } else {
                    this.addSystemLine('Unrecognized Command: ' + text + ', type /help for more info.');
                }

            } else {
                // Allows for regular messages to be sent to the server.
                this.socket.emit('userChat', { nick: this.nick, message: text });
                this.addChatLine(this.nick, text, true);
            }
        }
    }

    // Chat box implementation for the users.
    addChatLine(name, message, me) {
        let newline = document.createElement('li');

        // Colours the chat input correctly.
        newline.className = (me) ? 'me' : 'friend';
        newline.innerHTML = '<b>' + ((name.length < 1) ? 'Anon' : name) + '</b>: ' + message;

        this.appendMessage(newline);
    }

    // Chat box implementation for the system.
    addSystemLine(message) {
        let newline = document.createElement('li');

        // Colours the chat input correctly.
        newline.className = 'system';
        newline.innerHTML = message;

        // Append messages to the logs.
        this.appendMessage(newline);
    }

    // Places the message DOM node into the chat box.
    appendMessage(node) {
        if (this.chatList.childNodes.length > 10) {
            this.chatList.removeChild(this.chatList.childNodes[0]);
        }
        this.chatList.appendChild(node);
    };

    // Allows for addition of commands.
    registerCommand(name, description, callback) {
        this.commands[name] = {
            description: description,
            callback: callback
        };
    };

    // Allows help to print the list of all the commands and their descriptions.
    printHelp() {
        let commands = this.commands;
        for (let cmd in commands) {
            if (commands.hasOwnProperty(cmd)) {
                this.addSystemLine('/' + cmd + ': ' + commands[cmd].description);
            }
        }
    };
}





