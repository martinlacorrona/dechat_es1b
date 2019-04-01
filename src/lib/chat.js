/**
 * Interface that isolates SOLID pod handling from the UI regarding the chat itself
 */
const chatManager = require("./ChatManager/ChatManager.js");
const Message = require("../model/message");

class Chat {

    constructor(user, partner) {
        this.user = user;
        this.partner = partner;
        //sentMessages and messages will be load when user sendMessage or open chat.
        this.sentMessages = [];
        this.messages = [];
    }

    /**
    * Method to send a message
    * @param {String} text content of the message 
    * @return {Promise} file
    */
    async sendMessage(text) {
        var message = new Message(this.user.id, this.partner.id, text);
        this.messages = await this.getMessages();
        console.log(this.messages);

        //Save current sentMessages.
        this.sentMessages = [];
        let userID = this.user.id.replace("/profile/card#me", "").replace("https://", "");
        for(var i = 0; i < this.messages.length; i++) {
            if(this.messages[i].user === userID) {
                let newMsg = new Message(this.messages[i].user, this.messages[i].partner, this.messages[i].content);
                newMsg.init(this.messages[i].timestamp);
                this.sentMessages.push(newMsg)
            }
        }
        //Saving to array current message
        this.sentMessages.push(message);
        this.messages.push(message);
        await chatManager.writeOwnPOD(this.user.id, this.partner.id, this.sentMessages);
        return chatManager.writeInbox(this.partner, message.user);
    }

    /**
    * Method to get the messages
    * @return {Array} messages
    */
    async getMessages() {
        var messages = await chatManager.readPod(this.user.id, this.partner.id);
        return messages;
    }

    /**
    * Delete all the messages and clear the chat
    */
    async clearChat() {
        // TODO empty chat
    }

    /**
     * Returns the profile pic of the given user if it has one, else undefined
     * @param {WebID} webID 
     */
    async getProfilePic(webID){
        var pic = await query.getProfilePic(webID);
        return pic;
    }
}

module.exports = Chat