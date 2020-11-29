class Player {
	constructor(socket, username) {
		this.socket = socket;
		this.username = username;
		this.symbol = '';
	}

	send(event, data) {
		this.socket.emit(event, data);
	}
}

module.exports = Player;