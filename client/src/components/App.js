import '../css/App.css';
import CreateGame from './CreateGame';
import {
	BrowserRouter as Router,
	Switch,
	Route,
} from 'react-router-dom';
import Game from './Game';

function App() {
	return (
		<Router>
			<Switch>
				<Route path='/:id'>
					<Game />
				</Route>
				<Route path='/'>
					<CreateGame />
				</Route>
			</Switch>
		</Router>
	);
}

export default App;
