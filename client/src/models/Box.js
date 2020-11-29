import Cell from './Cell';

class Box {
	constructor(boxId) {
		this.boxId = boxId;
		this.cells = [];
		this.taken = null; // null or X or 0

		this.setupCells();
	}

	setupCells() {
		for (let i = 0; i < 9; ++i) {
			this.cells.push(new Cell(this.boxId, i));
		}
	}

	takeCell(cellId, player) {
		this.cells[cellId].take(player);
		this.taken = this.getOwner();
	}

	setAvailable(player) {
		if (this.taken) return;
		for (const cell of this.cells) {
			if (!cell.taken || !player) {
				cell.availableTo = player;
			}
		}
	}

	getOwner() {
		// rows
		for (let i = 0; i < 3; ++i) {
			if (sameOwner(this.cells[i*3], this.cells[i*3+1], this.cells[i*3+2])) return this.cells[i*3].taken;
		}
		// columns
		for (let i = 0; i < 3; ++i) {
			if (sameOwner(this.cells[i], this.cells[i+3], this.cells[i+6])) return this.cells[i].taken;
		}
		// diagonals
		if (sameOwner(this.cells[0], this.cells[4], this.cells[8])) return this.cells[4].taken;
		if (sameOwner(this.cells[2], this.cells[4], this.cells[6])) return this.cells[4].taken;
		return null;
	}
}

function sameOwner(...cells) {
	if (!cells[0].taken) return false;
	for (let i = 1; i < cells.length; ++i) {
		if (cells[i].taken !== cells[0].taken) return false;
	}
	return true;
}

export default Box;