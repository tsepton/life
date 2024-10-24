<script lang="ts">
	import Board from '$lib/components/Board.svelte';
	import Overlay from '$lib/components/Overlay.svelte';

	let speed = 10;
</script>

<main>
	<Board bind:speed />
	<Overlay bind:speed />
</main>

<style>
	main {
		overflow: hidden;
		height: 100vh;
	}
</style>
