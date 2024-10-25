<script lang="ts">
	import board from '$lib/board';

	export let speed = 10;
    </script>

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

<style>
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
</style>
