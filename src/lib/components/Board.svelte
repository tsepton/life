<script lang="ts">
	import board, { Board } from '$lib/board';
	import { onMount } from 'svelte';

	export let speed = 10;

	let paused = false;

	let zoom = 10;

	let transformation = { x: 0, y: 0 };

	let isClicked = false;

	let generationInterval: number | undefined;

	let mouseClickInterval: number | undefined;

	let canvas: HTMLCanvasElement | undefined;

	let ctx: CanvasRenderingContext2D | undefined;

	function drawBoard(board: Board): void {
		if (!ctx) return;
		ctx.reset();
		board.state.forEach((cell) => {
			if (!ctx) return;
			ctx.fillStyle = 'black';
			ctx.fillRect(
				(cell.x + transformation.x) * zoom,
				(cell.y + transformation.y) * zoom,
				zoom,
				zoom
			);
		});
	}

	function onWindowResize(_: UIEvent): void {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	function onMouseMove(event: MouseEvent): void {
		if (isClicked) {
			const x = Math.floor((event.clientX - transformation.x * zoom) / zoom);
			const y = Math.floor((event.clientY - transformation.y * zoom) / zoom);
			$board.addCell(x, y);
			drawBoard($board);
		}
	}

	function onMouseDown(event: MouseEvent): void {
		clearInterval(mouseClickInterval);
		paused = true;
		isClicked = event.button === 0;
		const x = (event.clientX - transformation.x * zoom) / zoom;
		const y = (event.clientY - transformation.y * zoom) / zoom;
		$board.addCell(x, y);
		drawBoard($board);
	}

	function onMouseUp(_: MouseEvent): void {
		isClicked = false;
		mouseClickInterval = window.setTimeout(() => {
			paused = false;
		}, 1000);
	}

	function onScroll(event: WheelEvent): void {
		const mouseX = event.clientX;
		const mouseY = event.clientY;

		const worldX = (mouseX - transformation.x * zoom) / zoom;
		const worldY = (mouseY - transformation.y * zoom) / zoom;

		const newZoom = zoom + event.deltaY / 100;
		zoom = Math.min(Math.max(newZoom, 1), 75);

		transformation.x = mouseX / zoom - worldX;
		transformation.y = mouseY / zoom - worldY;

		drawBoard($board);
	}

	onMount(() => {
		ctx = canvas?.getContext('2d')!;
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
	on:wheel={onScroll}
></canvas>

<style>
	canvas {
		background-color: white;
		padding: 0;
		margin: 0;
	}
</style>
