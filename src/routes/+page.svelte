<script lang="ts">
	import Board from '$lib/components/Board.svelte';
	import Overlay from '$lib/components/Overlay.svelte';

	let speed = 10;

	let zoom = 10;
</script>

<main>
	<Board bind:speed bind:zoom/>
	<Overlay bind:speed bind:zoom/>
</main>

<style>
	main {
		overflow: hidden;
		height: 100vh;
	}
</style>
