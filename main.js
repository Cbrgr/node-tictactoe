// Types of players
var P1 = 'X', P2 = 'O';
var socket; 
var	player;
var	game;
var connectionsLen;


var message = function(type, content) {
	return {
		'type': type,
		'content': content
	};
};

var sendMsg = function(msg) {
	var s = JSON.stringify(msg);
	socket.send(s);
};
  
var handleServerMessage = function(event){
	var msg = JSON.parse(event.data);

	if (msg.type == 'roomCreated'){
		var data = JSON.parse(msg.content); 
		var message = 'Bonjour, ' + data.name + 
		'. En attente du joueur 2...';
		
		$('.menu').css('display', 'none');
		$('.greeting').css('display', 'block');
		$('#userHello').html(message);
		player.setCurrentTurn(true);
	};
	
	if (msg.type == 'player1'){
		var data = JSON.parse(msg.content);
		var greeting = `Bonjour, ${player.getPlayerName()}`;
		$('#userHello').html(greeting);
		game = new Game();
		game.displayBoard(greeting);
		player.currentTurn = true;
	};
 
	if (msg.type == 'player2'){
		var data = JSON.parse(msg.content);	
		var greeting = `Bonjour, ${data.name}`;
		game = new Game();
		game.displayBoard(greeting);
		player.currentTurn = false;
	};
	
	if (msg.type == 'joinedGame'){
		var data = JSON.parse(msg.content); 
		var message = 'Bonjour, ' + data.name 
	};
	
	if (msg.type == 'turnPlayed'){
		var data = JSON.parse(msg.content); 
		var row = data.tile.split('_')[1][0];
		var col = data.tile.split('_')[1][1];
		var opponentType = data.playerType === P1 ? P2 : P1;
		
		game.updateBoard(data.playerType, row, col, data.tile);
		
		alert("C'EST VOTRE TOUR");
		
		player.currentTurn = true;
		$('#turn').text('Votre tour');
	};
	
	if (msg.type == 'gameEnded') {
		var data = JSON.parse(msg.content); 
		alert(data.message);
		$('.gameBoard').addClass('is-ended')
	}
};
  
$(document).ready(function() {
	$("#status").text("Déconnecté");
	$("#logged").hide();
	socket = new WebSocket("ws://localhost:8080", "tic_tac_toe");
	socket.addEventListener("open", function (evt){
		$("#status").text("Connecté");
	});
	socket.addEventListener("error", function(evt){
		$("#status").text("Erreur");
	});
	socket.addEventListener("close", function(evt) {
		$("#status").text("Déconnecté");
	});
	socket.addEventListener("message", handleServerMessage);

	$('#new').click(function(evt) {
		var name = $('#nameNew').val();
		if (!name) {
			alert('Please enter your name.');
			return;
		}
		var msg = message('newGame', { name });
		sendMsg(msg);
		player = new Player(name, P1);
	});

	$('#join').click(function(evt) {
		var name = $('#nameJoin').val();
		if (!name) {
			alert('Please enter your name');
			return;
		}
		var msg = message('joinGame', { name });
		sendMsg(msg);
		player = new Player(name, P2);
	});
});

/**
 * Player class
 */
var Player = function(name, type){
	this.name = name;
	this.type = type;
	this.currentTurn = true;
	this.movesPlayed = [];
}

Player.prototype.updateMovesPlayed = function(tileValue){
	this.movesPlayed.push(tileValue);
}

Player.prototype.getMovesPlayed = function(){
	return this.movesPlayed;
}

Player.prototype.setCurrentTurn = function(turn){
	this.currentTurn = turn;
	if(turn){
		$('#turn').text("C'est ton tour !");
	} else {
		$('#turn').text("En attente de l'adversaire");
	}
}

Player.prototype.getPlayerName = function(){
	return this.name;
}

Player.prototype.getPlayerType = function(){
	return this.type;
}

Player.prototype.getCurrentTurn = function(){
	return this.currentTurn;
}



/**
 * Game class
 */
var Game = function(){
  this.board = [];
  this.moves = 0;
}

Game.prototype.createGameBoard = function(){
  for(var i=0; i<3; i++) {
    this.board.push(['','','']);
    for(var j=0; j<3; j++) {
      $('#button_' + i + '' + j).on('click', function(){
        
		if(player.currentTurn){
			var row = parseInt(this.id.split('_')[1][0]);
			var col = parseInt(this.id.split('_')[1][1]);
			
			game.playTurn(this);
			game.updateBoard(player.getPlayerType(), row, col, this.id);
			
			
			player.currentTurn = false;
			$('#turn').text("En attente de l'adversaire");
			player.updateMovesPlayed(row+''+col);
			game.checkWinner();
        }else{
			alert("Ce n'est pas ton tour");
		}
	  });
    }
  }
}

Game.prototype.displayBoard = function(message){
	$('.menu').css('display', 'none');
	$('.greeting').css('display', 'block');
	$('.gameBoard').css('display', 'block');
	$('#userHello').html(message);
	this.createGameBoard();
}

Game.prototype.updateBoard = function(type, row, col, tile){
	
	$('#'+tile).text(type);
	type === P1 ? $('#'+tile).css('color', '#ff427f') : $('#'+tile).css('color', '#007892');
	$('#'+tile).prop('disabled', true);
	this.board[row][col] = type;
	this.moves ++;
}

Game.prototype.playTurn = function(tile){
	var clickedTile = $(tile).attr('id');
	var turnObj = {
		tile: clickedTile,
		playerType: player.type,
		playerName: player.name
	};

	var msg = message('playTurn', turnObj);
	sendMsg(msg);
  
}

Array.prototype.contains = function(elem){
	for (var i in this){
		if (this[i] == elem) 
			return true;
	}
	return false;
}


Game.prototype.checkWinner = function(){		
	var currentPlayerPositions = player.getMovesPlayed();
	if (currentPlayerPositions.length >2){
		if(
			(currentPlayerPositions.contains('00') && currentPlayerPositions.contains('01') && currentPlayerPositions.contains('02'))||
			(currentPlayerPositions.contains('10') && currentPlayerPositions.contains('11') && currentPlayerPositions.contains('12'))||
			(currentPlayerPositions.contains('20') && currentPlayerPositions.contains('21') && currentPlayerPositions.contains('22'))||
			(currentPlayerPositions.contains('00') && currentPlayerPositions.contains('10') && currentPlayerPositions.contains('20'))||
			(currentPlayerPositions.contains('01') && currentPlayerPositions.contains('11') && currentPlayerPositions.contains('21'))||
			(currentPlayerPositions.contains('02') && currentPlayerPositions.contains('12') && currentPlayerPositions.contains('22'))||
			(currentPlayerPositions.contains('00') && currentPlayerPositions.contains('11') && currentPlayerPositions.contains('22'))||
			(currentPlayerPositions.contains('20') && currentPlayerPositions.contains('11') && currentPlayerPositions.contains('02'))
		)	
			{

				var msgToSend = player.getPlayerName() + ' a gagné !';
				game.announceWinner(msgToSend);

			}
	}
	
	var tied = this.checkTie();
	if(tied){
		var message = 'Egalité !';
		game.announceWinner(message);	
	}
}


Game.prototype.checkTie = function(){
	return this.moves >= 9;
}

Game.prototype.announceWinner = function(msgToSend){
	var msg = message('endGame', {msgToSend});
	sendMsg(msg);
}




  