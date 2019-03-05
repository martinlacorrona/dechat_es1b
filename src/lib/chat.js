/**
 * Interface that isolates SOLID pod handling from the UI regarding the chat itself
 */
const auth = require("solid-auth-client");
const PODHelper = require("./pod-helper.js");
const Message = require("../model/message");
"use strict";
class Chat{
    constructor(user, partner){
        this.pod = new PODHelper(auth.fetch)
        this.user = user
        this.partner = partner
    }

    async sendMessage(text){
        console.log(text)
        // TODO save message in sender's POD

        // TODO give format to the notification     
        return this.pod.sendToInbox(this.partner,
         new Message(this.user.id, this.partner.id, text).generateNotification());
    }

    async getMessages(){
        // TODO read messages in the chat file
    }

    async createChat(){
        // TODO create chat with someone else
    }

    async clearChat(){
        // TODO empty chat
    }
}

module.exports = Chat