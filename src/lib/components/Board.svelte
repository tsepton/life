<script lang="ts">
	import board, { Board } from '$lib/board';
	import { onMount } from 'svelte';

	let isClicked = false;

	export let speed = 10;

	export let paused = false;

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

</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		background-color: white;
		padding: 0;
		margin: 0;
	}
</style>
