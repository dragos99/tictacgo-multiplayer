class Cell {
	constructor(boxId, cellId) {
		this.boxId = boxId;
		this.cellId = cellId;
		this.taken = '';
		this.availableTo = null;
		this.lastMove = null;
	}

	take(player) {
		this.taken = player;
	}
}

export default Cell;