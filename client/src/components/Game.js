import '../css/Game.css';
import React from 'react';
import socketIOClient from 'socket.io-client';
import { withRouter } from 'react-router';
import Board from './Board';
import Box from '../models/Box';
import { BrowserRouter } from 'react-router-dom';

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
        gameState: GameState.CONNECT,
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
            this.setState({ gameState: GameState.CHOOSE_USERNAME });
        }
    }

    joinGame = () => {
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
        this.updateAvailableCells();
        this.updateLastMove();
        this.forceUpdate();
    }

    updateAvailableCells() {
        for (const box of this.board) box.setAvailable(null);

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

    otherPlayer(player) {
        if (player === 'X') return '0';
        return 'X';
    }

    render() {
        if (this.state.gameState === GameState.CHOOSE_USERNAME) {
            return (
                <div id="create-game-container">
                    <input className="text-field" type="text" onChange={this.changeUsername} placeholder="Username" />
                    <button className="big-button" id="join-game-button" onClick={this.joinGame}>Join game</button>
                </div>
            );
        }

        if (this.state.gameState === GameState.PLAY) {
            return (
                <div id="game">
                    <div id="header">
                        <div className="playerName x">smokie</div>
                        <div className="versus">vs</div>
                        <div className="playerName o">Meh</div>
                    </div>
                    <Board board={this.board} currentPlayer={this.currentPlayer} takeCell={this.takeCell} />
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

        return null;
    }
}

export default withRouter(Game);
