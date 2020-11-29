function Box(props) {
	const { boxId, taken } = props.data;
	let className = 'box';
	
	if (taken === 'X') {
		className += ' x-taken';
	} else if (taken === '0') {
		className += ' o-taken';
	}

	return (
		<div className={className}>
			{!taken && props.children}
			{taken ? taken : null}
		</div>
	);
}

export default Box;