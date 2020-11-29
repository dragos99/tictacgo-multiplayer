import { useState } from 'react';
import { useHistory } from 'react-router-dom';

function CreateGame() {
	const history = useHistory();
	const [username, setUsername] = useState('');
	const [creatingGame, setCreatingGame] = useState(false);

	const changeUsername = (e) => {
		setUsername(e.target.value);
	}

	const createGame = () => {
		if (creatingGame) return;
		if (!username) return;

		setCreatingGame(true);

		fetch('/createGame', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username })
		}).then(res => res.json()).then((data) => {
			history.push({
				pathname: `/${data.gameId}`,
				state: { username }
			});
		});
	}

	return (
		<div id="create-game-container">
			<input className="text-field" disabled={creatingGame} type="text" onChange={changeUsername} placeholder="Username" />
			<button className="big-button" disabled={creatingGame} id="create-game-button" onClick={createGame}>Create game</button>
		</div>
	);
}

export default CreateGame;
