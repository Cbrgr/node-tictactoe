var http = require('http');
var WebSocketServer = require('websocket').server;
var room;

var server = http.createServer(function(request, response) {
	
});
server.listen(8080, "127.0.0.1", function() {
	console.log("Server started!");
});

var wsServer = new WebSocketServer({
	httpServer: server
});

var message = function(type, content) {
	return {
		'type': type,
		'content': content
	};
};

var handleClientMessage = function(messageData) {
	var msg = JSON.parse(messageData.utf8Data);

	if (msg.type == 'newGame') {
		var name = msg.content.name;
		sendToOne(this,message('roomCreated','{"name":"'+name+'"}'));	
	}
	
	if (msg.type == 'joinGame') {
		var name = msg.content.name;
		if (connections.length == 2){
			for (var i = 0; i < connections.length; i++){
				if(connections[i] == this){
					sendToOne(this,message('player2','{"name":"'+name+'"}'));
				} else {
					sendToOne(connections[i],message('player1','{}'));
				}
			}				
		}
		else {
			console.log(connections.length);
		}	
	}
	
	if (msg.type == 'playTurn') {
		var data = msg.content;
		//console.log(msg);
		for (var i =0; i < connections.length; i++){	
			if(connections[i] == this){
				console.log('PLAYER '+ data.playerName +' made his turn');
			}
			else{
				sendToOne(connections[i],message('turnPlayed','{"tile":"'+data.tile+'","playerType":"'+data.playerType+'","playerName":"'+data.playerName+'"}'));
			}
		}
	}

	if (msg.type == 'endGame') {
		var data = msg.content;
		//console.log(data);
		sendToAll(message('gameEnded','{"message":"'+data.msgToSend+'"}'));
		
	}
	
};

var sendToAll = function(msg){
	for (var i =0; i < connections.length; i++){
		sendToOne(connections[i],msg);
	}
}

var sendToOne = function(conn,msg) {
	if (conn.connected){
		conn.sendUTF(JSON.stringify(msg));
	}
}

var connections = [];

wsServer.on('request', function(request) {
	var connection = request.accept("tic_tac_toe", request.origin);
	connection.room = [];
	connection.on('message', handleClientMessage);
	connections.push(connection);	
});	


	


	
	

	


	

