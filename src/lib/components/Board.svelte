<script lang="ts">
	import board, { Board } from '$lib/board';
	import { onMount } from 'svelte';

	export let speed = 10;

	export let paused = false;

	let isClicked = false;

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

	function onWindowResize(_: UIEvent): void {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	function onMouseMove(event: MouseEvent): void {
		if (isClicked) {
			const x = Math.floor(event.clientX / 25);
			const y = Math.floor(event.clientY / 25);
			$board.addCell(x, y);
			drawBoard($board);
		}
	}

	function onMouseDown(event: MouseEvent): void {
		clearInterval(mouseClickInterval);
		paused = true;
		isClicked = true;
		const x = Math.floor(event.clientX / 25);
		const y = Math.floor(event.clientY / 25);
		$board.addCell(x, y);
		drawBoard($board);
	}

	function onMouseUp(_: MouseEvent): void {
		isClicked = false;
		mouseClickInterval = window.setTimeout(() => {
			paused = false;
		}, 1000);
	}

	onMount(() => {
		onWindowResize({} as UIEvent);

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

<svelte:window on:resize={onWindowResize} />
<canvas
	bind:this={canvas}
	on:mousedown={onMouseDown}
	on:mouseup={onMouseUp}
	on:mousemove={onMouseMove}
></canvas>

<style>
	canvas {
		background-color: white;
		padding: 0;
		margin: 0;
	}
</style>
