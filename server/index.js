const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const Game = require('./Game');
const app = express();
const port = 8080;

const games = [];

app.use(express.static(path.join(__dirname, 'build')));
app.use(bodyParser.json());

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.post('/createGame', (req, res) => {
    const game = new Game();
    games.push(game);
    res.json({ gameId: game.id });
});

const server = app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

// Socket setup
const io = socketIo(server);

io.on('connection', (socket) => {
    socket.on('joinGame', (data) => {
        const game = getGameById(data.gameId);
        if (!game) return socket.emit('joinGame', { error: 'Game not found' });

        try {
            game.addPlayer(socket, data.username);
            socket.emit('joinGame', { success: true });

            if (game.players.length === 2) game.startGame();
        } catch (err) {
            socket.emit('joinGame', { error: err.message });
        }
    });
});

function getGameById(id) {
    return games.find(g => g.id === id);
}