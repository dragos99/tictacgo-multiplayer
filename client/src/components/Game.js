import '../css/Game.css';
import React from 'react';
import socketIOClient from 'socket.io-client';
import { withRouter } from 'react-router';
import Board from './Board';
import Box from '../models/Box';
import confetti from '../confetti.js';

const GameState = {
	CONNECT: 'Connecting',
	CHOOSE_USERNAME: 'Choose a username',
	JOIN: 'Joining game',
	WAIT: 'Waiting for opponent',
	PLAY: 'Playing',
};

class Game extends React.Component {
	state = {
		username: '',
		opponentUsername: '',
		gameState: GameState.CONNECT,
		winner: null
	};

	socket = null;
	board = null;
	me = null; // X or 0
	currentPlayer = 'X';
	lastMove = null;

	componentDidMount() {
		this.socket = socketIOClient();

		this.socket.on('connect', () => {
			this.setUsername();
		});

		this.socket.on('joinGame', (data) => {
			if (data.success) this.setState({ gameState: GameState.WAIT });
		});

		this.socket.on('player', (data) => {
			this.me = data;
		});

		this.socket.on('opponent', (data) => {
			this.setState({ opponentUsername: data });
		});

		this.socket.on('startGame', () => {
			this.setState({ gameState: GameState.PLAY });
		});

		this.socket.on('takeCell', (data) => {
			this.applyMove(data.boxId, data.cellId, data.player);
		})

		this.setupBoard();
	}

	setupBoard() {
		this.board = [];
		for (let i = 0; i < 9; ++i) {
			this.board.push(new Box(i));
		}
		this.updateAvailableCells();
	}

	changeUsername = (e) => {
		this.setState({ username: e.target.value });
	}

	setUsername = () => {
		const location = this.props.location;
		if (location.state && location.state.username) {
			this.setState({ username: location.state.username }, this.joinGame);
		} else {
			const username = localStorage.getItem('username');
			this.setState({ username, gameState: GameState.CHOOSE_USERNAME });
		}
	}

	joinGame = () => {
		localStorage.setItem('username', this.state.username);
		this.setState({ gameState: GameState.JOIN }, () => {
			const gameId = this.props.location.pathname.substr(1);
			const username = this.state.username;
			this.socket.emit('joinGame', { gameId, username });
		});
	}

	takeCell = (boxId, cellId) => {
		if (this.currentPlayer !== this.me) return;
		this.socket.emit('takeCell', { boxId, cellId, player: this.me });
		this.applyMove(boxId, cellId, this.me);
	}

	applyMove = (boxId, cellId, player) => {
		this.board[boxId].takeCell(cellId, player);
		this.currentPlayer = this.otherPlayer(player);
		this.lastMove = { boxId, cellId, player };
		this.checkWin();
		this.updateAvailableCells();
		this.updateLastMove();
		this.forceUpdate();
	}

	updateAvailableCells() {
		for (const box of this.board) box.setAvailable(null);

		if (this.getWinner()) return;

		let targetBox = null;
		if (this.lastMove) {
			targetBox = this.board[this.lastMove.cellId];
		}

		if (!targetBox || targetBox.taken) {
			for (const box of this.board) {
				box.setAvailable(this.currentPlayer);
			}
		} else {
			targetBox.setAvailable(this.currentPlayer);
		}
	}

	updateLastMove() {
		for (const box of this.board) {
			for (const cell of box.cells) {
				cell.lastMove = null;
			}
		}
		this.board[this.lastMove.boxId].cells[this.lastMove.cellId].lastMove = this.lastMove.player;
	}

	checkWin() {
		const winner = this.getWinner();
		if (winner) {
			this.setState({ winner });
			confetti.start();
			setTimeout(confetti.stop, 1500);
		}
	}

	getWinner() {
		// rows
		for (let i = 0; i < 3; ++i) {
			if (sameOwner(this.board[i * 3], this.board[i * 3 + 1], this.board[i * 3 + 2])) return this.board[i * 3].taken;
		}
		// columns
		for (let i = 0; i < 3; ++i) {
			if (sameOwner(this.board[i], this.board[i + 3], this.board[i + 6])) return this.board[i].taken;
		}
		// diagonals
		if (sameOwner(this.board[0], this.board[4], this.board[8])) return this.board[4].taken;
		if (sameOwner(this.board[2], this.board[4], this.board[6])) return this.board[4].taken;
		return null;
	}

	otherPlayer(player) {
		if (player === 'X') return '0';
		return 'X';
	}

	getUsernameOf(symbol) {
		if (this.me === symbol) {
			return this.state.username;
		} else {
			return this.state.opponentUsername;
		}
	}

	headerContent() {
		if (this.state.winner === 'X') return <div className="playerName x">{this.getUsernameOf(this.state.winner)} won !!!</div>;
		if (this.state.winner === '0') return <div className="playerName o">{this.getUsernameOf(this.state.winner)} won !!!</div>;

		return (
			<>
				<div className="playerName x">{this.getUsernameOf('X')}</div>
				<div className="versus">vs</div>
				<div className="playerName o">{this.getUsernameOf('0')}</div>
			</>
		);
	}

	render() {
		if (this.state.gameState === GameState.CHOOSE_USERNAME) {
			return (
				<div id="create-game-container">
					<input className="text-field" type="text" onChange={this.changeUsername} placeholder="Username" value={this.state.username} />
					<button className="big-button" id="join-game-button" onClick={this.joinGame}>Join game</button>
				</div>
			);
		}

		if (this.state.gameState === GameState.WAIT) {
			return (<div className="game-modal">
				<div className="waiting-for-opponent">Waiting for opponent...</div>
				<div className="give-link">Give your friend this link:</div>
				<div className="game-link">{window.location.href}</div>
			</div>);
		}

		if (this.state.gameState === GameState.PLAY) {
			return (
				<div id="game">
					<div id="header">
						{this.headerContent()}
					</div>
					<Board board={this.board} currentPlayer={this.currentPlayer} takeCell={this.takeCell} winner={this.state.winner} />
				</div>
			);
		}

		return null;
	}
}

function sameOwner(...boxes) {
	if (!boxes[0].taken) return false;
	for (let i = 1; i < boxes.length; ++i) {
		if (boxes[i].taken !== boxes[0].taken) return false;
	}
	return true;
}

export default withRouter(Game);
