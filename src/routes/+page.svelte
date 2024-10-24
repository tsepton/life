<script lang="ts">
	import { onMount } from 'svelte';

	type Cell = {
		x: number;
		y: number;
	};

	let speed = 10;

	let interval: number | undefined;

	type State = Cell[];

	let board: HTMLCanvasElement;

	let initializationState: State = [
		{ x: 2, y: 2 },
		{ x: 1, y: 2 },
		{ x: 2, y: 1 },
		{ x: 1, y: 1 },

		{ x: 10, y: 9 },
		{ x: 10, y: 10 },
		{ x: 10, y: 11 },

		{ x: 17, y: 15 },
		{ x: 18, y: 15 },
		{ x: 19, y: 15 }
	];

	let currentState: State | undefined;

	let generationIndex = 0;

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

		const augmentedState = state.map((cell) => {
			const neighborsOnAxis = (n: number) => [n - 1, n, n + 1];
			const livingNeighbors = state
				.filter(
					(c) => neighborsOnAxis(cell.x).includes(c.x) && neighborsOnAxis(cell.y).includes(c.y)
				)
				.filter((c) => c.x !== cell.x || c.y !== cell.y);
			const deadNeighbors = [-1, 0, 1]
				.flatMap((x) => [-1, 0, 1].map((y) => ({ x: cell.x + x, y: cell.y + y })))
				.filter((c) => c.x !== cell.x || c.y !== cell.y)
				.filter((c) => !livingNeighbors.map((n) => [n.x, n.y]).includes([c.x, c.y]));

			return { livingNeighbors, deadNeighbors, cell };
		});

		// Any live cell with fewer than two live neighbours dies, as if by underpopulation.
		// Any live cell with two or three live neighbours lives on to the next generation.
		// Any live cell with more than three live neighbours dies, as if by overpopulation.
		const liveCells: Cell[] = augmentedState
			.filter((info) => info.livingNeighbors.length === 2 || info.livingNeighbors.length === 3)
			.map((info) => info.cell);

		// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
		// console.log(index, augmentedState.deadNeighbors.length);
		const reproducedCells = computeOccurences(augmentedState.flatMap((a) => a.deadNeighbors))
			.entries()
			.filter(([_, count]) => count === 3)
			.map(([key]) => {
				const [x, y] = key.split(',').map(Number);
				return { x, y };
			});

		return [...liveCells, ...reproducedCells];
	}

	function drawBoard(state: State): void {
		const ctx = board?.getContext('2d');
		if (!ctx) return;

		ctx.reset();
		state.forEach((cell) => {
			ctx.fillStyle = 'black';
			ctx.fillRect(cell.x * 25, cell.y * 25, 22.5, 22.5);
		});
	}

	onMount(() => {
		return () => clearInterval(interval);
	});

	$: {
		clearInterval(interval);
		interval = setInterval(() => {
			currentState = computeNextState(currentState ?? initializationState);
			generationIndex += 1;
		}, 10000 / speed);
	}

	$: generationIndex, drawBoard(currentState ?? []);
</script>

<canvas bind:this={board} width="700" height="700" style="border: 1px solid black;"></canvas>
<div>
	<input type="range" min="10" max="1000" bind:value={speed} />
	<div>
		<span> Generation: {generationIndex} </span>
		<span> Population: {currentState?.length ?? 0} </span>
	</div>
</div>
