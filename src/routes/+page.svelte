<script lang="ts">
	import { Cell, type State } from '$lib/cell';
	import { onMount } from 'svelte';

	// TODO: Refactor to separate game from UI 

	let isClicked = false;

	let speed = 10;

	let paused = false;

	let interval: number | undefined;

	let board: HTMLCanvasElement | undefined;

	let currentState: State | undefined;

	let generationIndex = 0;

	function addCell(x: number, y: number): void {
		if (!currentState) return;
		if (currentState.filter((c) => c.x === x && c.y === y).length > 0) return;

		currentState = [...(currentState ?? []), new Cell(x, y)];
	}

	function computeNextState(state: State): State {
		const computeOccurences = (cells: Cell[]): Map<string, number> => {
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

		// Check for underpopulation and overpopulation.
		const liveCells: Cell[] = augmentedState
			.filter((info) => info.livingNeighbors.length === 2 || info.livingNeighbors.length === 3)
			.map((info) => info.cell);

		// Check for reproduction.
		const reproducedCells = computeOccurences(augmentedState.flatMap((a) => a.deadNeighbors))
			.entries()
			.filter(([_, count]) => count === 3)
			.map(([key]) => {
				const [x, y] = key.split(',').map(Number);
				return new Cell(x, y);
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
		const onWindowResize = () => {
			if (!board) return;
			board.width = window.innerWidth;
			board.height = window.innerHeight;
		};

		window.addEventListener('resize', onWindowResize);
		onWindowResize();

		window.addEventListener('mousedown', (event) => {
			paused = true;
			isClicked = true;
			const x = Math.floor(event.clientX / 25);
			const y = Math.floor(event.clientY / 25);
			addCell(x, y);
		});

		window.addEventListener('mouseup', (event) => {
			isClicked = false;
			window.setTimeout(() => {
				paused = false;
			}, 1000);
		});

		window.addEventListener('mousemove', (event) => {
			if (isClicked) {
				const x = Math.floor(event.clientX / 25);
				const y = Math.floor(event.clientY / 25);
				addCell(x, y);
			}
		});

		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', onWindowResize);
		};
	});

	$: {
		clearInterval(interval);
		if (!paused)
			interval = setInterval(
				() => {
					currentState = computeNextState(currentState ?? []);
					generationIndex += 1;
				},
				(21 - speed) ** 2
			);
	}

	$: generationIndex, drawBoard(currentState ?? []);
</script>

<main>
	<canvas bind:this={board}></canvas>
	<div class="overlay-ui">
		<div class="flex-col overlay-background">
			Speed of simulation: {speed}
			<input type="range" min="1" max="20" bind:value={speed} />
		</div>
		<div class="flex-col overlay-background">
			<span> Generation: {generationIndex} </span>
			<span> Population: {currentState?.length ?? 0} </span>
		</div>
	</div>
</main>

<style>
	main {
		overflow: hidden;
		height: 100vh;
	}

	.overlay-ui {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		padding: 1rem;
	}

	.flex-col {
		display: flex;
		flex-direction: column;
	}

	.overlay-background {
		padding: 1rem;
		border-radius: 5px;
		background-color: rgba(226, 226, 226, 0.5);
	}

	canvas {
		background-color: white;
		padding: 0;
		margin: 0;
	}
</style>
