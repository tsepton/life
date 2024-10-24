<script lang="ts">
	import { onMount } from 'svelte';

	type Cell = {
		x: number;
		y: number;
	};

	type State = Cell[];

	let board: HTMLCanvasElement;

	let initializationState: State = [
		{ x: 10, y: 9 },
		{ x: 10, y: 10 },
		{ x: 10, y: 11 }
	];

	let currentState: State | undefined;

	let index = 0;

	function addCell(cell: Cell) {}

	function removeCell(x: number, y: number) {}

	function computeNextState(state: State): State {
		const computeOccurences = (cells: Cell[]): Map<string, number> => {
			const occurences = new Map();
			cells.forEach((cell) => {
				const key = `${cell.x},${cell.y}`;
				if (occurences.has(key)) occurences.set(key, occurences.get(key) + 1);
				else occurences.set(key, 1);
			});
			return occurences;
		};

		console.log('state', state);

		const augmentedState = state.map((cell) => {
			const neighborsOnAxis = (n: number) => [n - 1, n, n + 1];
			const neighbors = state
				.filter(
					(c) => neighborsOnAxis(cell.x).includes(c.x) && neighborsOnAxis(cell.y).includes(c.y)
				)
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
		console.log("augmentedState", augmentedState);

		// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
		// Any live cell with two or three live neighbours lives on to the next generation.
		// Any live cell with more than three live neighbours dies, as if by overpopulation.
		const liveCells: Cell[] = augmentedState
			.filter(([hasRightAmountOfNeighbors]) => hasRightAmountOfNeighbors)
			.map(([_, __, cell]) => cell as Cell);

		// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
		const deadCellsDuplicates = augmentedState.flatMap(([_, deadCells]) => deadCells as Cell[]);
		const reproducedCells = deadCellsDuplicates.filter(
			(c) => computeOccurences(deadCellsDuplicates).get(`${c.x},${c.y}`) === 3
		);
		return [...liveCells, ...reproducedCells];
	}

	function drawBoard(state: State): void {
		const ctx = board.getContext('2d');
		if (!ctx) return;

		ctx.reset();
		state.forEach((cell) => {
			ctx.fillStyle = 'black';
			ctx.fillRect(cell.x * 25, cell.y * 25, 22.5, 22.5);
		});
	}

	onMount(() => {
		drawBoard(initializationState);

		const interval = setInterval(() => {
			currentState = computeNextState(currentState ?? initializationState);
			index += 1;

			drawBoard(currentState);
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<canvas bind:this={board} width="700" height="700" style="border: 1px solid black;"></canvas>
{index}
