const Player = require('./Player');

class Game {
	constructor() {
		this.id = this.generateGameId();
		this.createdAt = Date.now();

		this.players = [];
	}

	startGame() {
		this.players[0].symbol = 'X';
		this.players[1].symbol = '0';

		for (let i = 0; i < this.players.length; ++i) {
			this.players[i].socket.on('takeCell', this.takeCell.bind(this, i));
			this.players[i].send('player', this.players[i].symbol);
		}

		this.broadcast('startGame');
	}

	takeCell(playerId, data) {
		const opponent = this.players[playerId^1];
		opponent.send('takeCell', data);
	}

	addPlayer(socket, username) {
		if (this.players.length == 2) throw `Game ${this.id} is already full`;
		
		const player = new Player(socket, username);
		this.players.push(player);
	}

	broadcast(event, data) {
		for (const player of this.players) {
			player.send(event, data);
		}
	}

	generateGameId() {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 4; ++i) {
			result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
		}
		return result;
	}
}

module.exports = Game;