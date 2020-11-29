function Cell(props) {
	const { boxId, cellId, taken, availableTo, lastMove } = props.data;
	let className = 'cell';

	if (taken === 'X') {
		className += ' x-taken';
	} else if (taken === '0') {
		className += ' o-taken';
	}

	if (availableTo === 'X' || lastMove === 'X') {
		className += ' x-available'
	} else if (availableTo === '0' || lastMove === '0') {
		className += ' o-available';
	}

	const takeCell = () => {
		if (!taken && availableTo) {
			props.takeCell(boxId, cellId);
		}
	}

	return (
		<div className={className} onClick={takeCell}>
			{taken}
		</div>
	);
}

export default Cell;