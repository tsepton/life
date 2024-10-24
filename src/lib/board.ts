import { writable } from 'svelte/store';
import { Cell, type State } from './cell';

// TODO write unit test for this class

export class Board {
	private _currentState: State = [];

	private _generation = 0;

	public get generation(): number {
		return this._generation;
	}

	public set generation(generation: number) {
		const diff = generation - this._generation;

		if (diff === 0) return;
		if (diff < 0) throw new Error('Not implemented');

		for (let i = 0; i < diff; i++) {
			this._currentState = this._computeNextState(this._currentState);
		}
		this._generation = generation;
	}

    public get state(): State {
        return this._currentState;
    }

	public addCell(x: number, y: number): void {
        if (!this._currentState) return;
		if (this._currentState.filter((c) => c.x === x && c.y === y).length > 0) return;
        
        console.log('addCell', x, y, "this._currentState", this._currentState);
		this._currentState = [...(this._currentState), new Cell(x, y)];
	}

	private _computeNextState(state: State): State {
		this._generation += 1;

		const computeOccurences = (cells: State): Map<string, number> => {
			const occurences = new Map();
			cells.forEach((cell) => {
				if (occurences.has(cell.id)) occurences.set(cell.id, occurences.get(cell.id) + 1);
				else occurences.set(cell.id, 1);
			});
			return occurences;
		};

		const augmentedState = state.map((cell) => {
			const neighborsOnAxis = (n: number) => [n - 1, n, n + 1];
			const livingNeighbors = state
				.filter(
					(c) => neighborsOnAxis(cell.x).includes(c.x) && neighborsOnAxis(cell.y).includes(c.y)
				)
				.filter((c) => c.x !== cell.x || c.y !== cell.y);
			const deadNeighbors = [-1, 0, 1]
				.flatMap((x) => [-1, 0, 1].map((y) => new Cell(cell.x + x, cell.y + y)))
				.filter((c) => !state.map((n) => n.id).includes(c.id)); // TODO refactor with class equality

			return { livingNeighbors, deadNeighbors, cell };
		});

		// Rule 1: Check for underpopulation and overpopulation.
		const liveCells: Cell[] = augmentedState
			.filter((info) => info.livingNeighbors.length === 2 || info.livingNeighbors.length === 3)
			.map((info) => info.cell);

		// Rule 2: Check for reproduction.
		const reproducedCells = computeOccurences(augmentedState.flatMap((a) => a.deadNeighbors))
			.entries()
			.filter(([_, count]) => count === 3)
			.map(([key]) => {
				const [x, y] = key.split(',').map(Number);
				return new Cell(x, y);
			});

		return [...liveCells, ...reproducedCells];
	}
}

const board = writable(new Board());

export default board;
