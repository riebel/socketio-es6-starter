"use strict";

import Chat from './Chat';
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

        this.chat = new Chat(this.nick);

        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('chatbox').style.display = 'block';
    }
}

window.onload = () => {
    new Client();
};