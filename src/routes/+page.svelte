<script lang="ts">
	import type { Board } from '$lib/board';
	import board from '$lib/board';
	import { onMount } from 'svelte';

	let isClicked = false;

	let speed = 10;

	let paused = false;

	let generationInterval: number | undefined;

	let mouseClickInterval: number | undefined;

	let canvas: HTMLCanvasElement | undefined;

	function drawBoard(board: Board): void {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;

		ctx.reset();
		board.state.forEach((cell) => {
			ctx.fillStyle = 'black';
			ctx.fillRect(cell.x * 25, cell.y * 25, 22.5, 22.5);
		});
	}

	onMount(() => {
		const onWindowResize = () => {
			if (!canvas) return;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		// FIXME - Svelte offers a more idiomatic way of working with canvas
		window.addEventListener('resize', onWindowResize);
		onWindowResize();

		window.addEventListener('mousedown', (event) => {
			clearInterval(mouseClickInterval);
			paused = true;
			isClicked = true;
			const x = Math.floor(event.clientX / 25);
			const y = Math.floor(event.clientY / 25);
			$board.addCell(x, y);
			drawBoard($board);
		});

		window.addEventListener('mouseup', (event) => {
			isClicked = false;
			mouseClickInterval = window.setTimeout(() => {
				paused = false;
			}, 1000);
		});

		window.addEventListener('mousemove', (event) => {
			if (isClicked) {
				const x = Math.floor(event.clientX / 25);
				const y = Math.floor(event.clientY / 25);
				$board.addCell(x, y);
				drawBoard($board);
			}
		});

		return () => {
			clearInterval(generationInterval);
			window.removeEventListener('resize', onWindowResize);
		};
	});

	$: {
		clearInterval(generationInterval);
		if (!paused)
			generationInterval = setInterval(
				() => {
					$board.generation += 1;
					drawBoard($board);
				},
				(21 - speed) ** 2
			);
	}

	$: $board.generation, $board.state, drawBoard($board);
</script>

<main>
	<canvas bind:this={canvas}></canvas>
	<div class="overlay-ui">
		<div class="flex-col overlay-background">
			Speed of simulation: {speed}
			<input type="range" min="1" max="20" bind:value={speed} />
		</div>
		<div class="flex-col overlay-background">
			<span> Generation: {$board.generation} </span>
			<span> Population: {$board.state.length} </span>
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
