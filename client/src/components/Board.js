import '../css/Game.css';
import React from 'react';
import Box from './Box';
import Cell from './Cell';

function Board(props) {
	return (
		<div id="board">
			{props.board.map((box, i) => (
				<Box key={i} data={box}>
					{box.cells.map((cell, j) => (
						<Cell key={j} data={cell} takeCell={props.takeCell} />
					))}
				</Box>
			))}
		</div>
	);
}

export default Board;
