const Chat = require("../src/lib/chat")
const auth= require("solid-auth-client")
const PODHelper = require("../src/lib/pod-helper")
const fc = require("solid-file-client")
const Persona = require("../src/model/person")
const chatManager = require("../src/lib/POD-reader/ChatManager")

const user = new Persona("https://podaes1b.solid.community/profile/card#me", "Carmen", "https://podaes1b.solid.community/inbox");
const target = new Persona("https://es1btest.solid.community/profile/card#me", "Paco", "https://es1btest.solid.community/inbox");
const pod = new PODHelper(auth.fetch)
var chat = new Chat(user, target)
var targetChat = new Chat(target, user);
const OK = 200;

describe("Inbox and notification tests", function(){       

    beforeAll(()=>{
        // Mock unrelated chatManager function        
        chatManager.read = jest.fn(()=>{return OK;});
        // Mock solid-file-client
        fc.createFile = jest.fn().mockResolvedValue(OK);
        fc.updateFile = jest.fn().mockResolvedValue(OK);
        fc.popupLogin = jest.fn().mockResolvedValue(OK);
        fc.deleteFile = jest.fn().mockResolvedValue(OK);
        fc.createFolder = jest.fn().mockResolvedValue(OK);
        fc.readFolder = jest.fn().mockResolvedValue(
            {
                "files":[
                    {
                        "url": "dechat.txt"
                    }
                ]
            }
        )        
    }),
    it("Notification should get sent to inbox", async function(){
        var response = await chat.sendMessage("This is a test message :^)");
        expect(response).toBe(OK)
    }),
    it("Testing reading Inbox", async function(){
        inboxR = await pod.getFilesFromFolder(target.inbox);
        expect(inboxR.length).toBe(1)      
    }),
    it("There's a message from the other guy", async function(done){     
        // First we send a message to target   
        await chat.sendMessage("User sends a message to target");    
        // If the message arrrived to target's inbox it should be recognized
        // and the callback should be called    
        fc.readFile = jest.fn().mockResolvedValue(user.id) // We mock the contents of the notification
        var callback = jest.fn().mockImplementation(()=>{ done(); })
        targetChat.checkForNotifications(callback);
    },500),
    it("There's a message but not from the other guy", async function(done){
        // First we send a message to target   
        await chat.sendMessage("User sends a message to target");    
        // If the callback is called it means we have a false positive    
        fc.readFile = jest.fn().mockResolvedValue("Mr. Bug") // We mock the contents of the notification
        var callback = jest.fn().mockImplementation(()=>{ done.fail("Oh no") })
        targetChat.checkForNotifications(callback);
        done()
    })

}),
describe('Send/Get messages tests', () => {
    beforeAll(() => {
        chat = new Chat(user, target)
        //Mock unrelated function
        chat.pod.sendToOwnPOD = jest.fn();
        chat.pod.readPod = jest.fn();
        chat.pod.sendToInbox = jest.fn();
    }),
    it('Message should get sent', async () => {       
        expect(chat.sentMessages.length).toBe(0);
        chat.sendMessage("New message");
        expect(chat.sentMessages.length).toBe(1);
        // Make sure all the PODHelper calls were done
        expect(chat.pod.sendToOwnPOD).toBeCalled();
        expect(await chat.pod.readPod).toBeCalled();
        expect(await chat.pod.sendToInbox).toBeCalled();
    })
});
