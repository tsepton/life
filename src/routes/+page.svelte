<script lang="ts">
	type Cell = {
		x: number;
		y: number;
	};

	type State = Cell[];

	let board: HTMLCanvasElement;

	let states: State[] = [];

	function addCell(cell: Cell) {
		states = [[...states[0], cell], ...states.slice(1)];
	}

	function removeCell(x: number, y: number) {
		states = [states[0].filter((cell) => cell.x !== x && cell.y !== y), ...states.slice(1)];
	}

	function computeNextState(state: State): State {
		const augmentedState = state.map((cell) => {
			const neighborsOnAxis = (n: number) => [n - 1, n, n + 1];
			const neighbors = state
				.filter((c) => c.x in neighborsOnAxis(cell.x) && c.y in neighborsOnAxis(cell.y))
				.filter((c) => c.x !== cell.x || c.y !== cell.y);
			const hasRightAmountOfNeighbors = neighbors.length === 2 || neighbors.length === 3;
			const getAllSurroundingCells = (cell: Cell): Cell[] => {
				return []; // TODO
			};
			const surroundingDeadCells = getAllSurroundingCells(cell).filter(
				(c) => !neighbors.map((n) => [n.x, n.y]).includes([c.x, c.y])
			);

			return [hasRightAmountOfNeighbors, surroundingDeadCells, cell];
		});

		// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
		// Any live cell with two or three live neighbours lives on to the next generation.
		// Any live cell with more than three live neighbours dies, as if by overpopulation.
		const liveCells: Cell[] = augmentedState
			.filter(([hasRightAmountOfNeighbors]) => hasRightAmountOfNeighbors)
			.map(([_, __, cell]) => cell as Cell);

		// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
		const deadCellsDuplicates = augmentedState.flatMap(([_, deadCells]) => deadCells as Cell[]);
		const reproductedCells = deadCellsDuplicates.filter(
			(c) => computeOccurences(deadCellsDuplicates).get(`${c.x},${c.y}`) === 3
		);
		return [...liveCells, ...reproductedCells];
	}

	function drawBoard() {}

	function computeOccurences(cells: Cell[]): Map<string, number> {
		const occurences = new Map();
		cells.forEach((cell) => {
			const key = `${cell.x},${cell.y}`;
			if (occurences.has(key)) occurences.set(key, occurences.get(key) + 1);
			else occurences.set(key, 1);
		});
		return occurences;
	}
</script>

<canvas bind:this={board} width="800" height="800" style="border: 1px solid black;"></canvas>
