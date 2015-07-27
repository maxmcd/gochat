
Websocket logic

User connects to server.
User can send and recieve metadata
User can connect and disconnect from channels. 

User can send messages in channels. 

Messages are written to datastore, and all users in channel are alerted.

User connects to client. User identifying information is stored. 
User added to global hash(?)

User connects to channel. Added to active users section of channel, with identifier from global store.

(need some kind of cleanup here for inactive users) (ping functionality)

 Message gets sent from client with datatype and metadata. 
Datatype can be "msg" "cmd"(?)
"msg" has channel hash 
