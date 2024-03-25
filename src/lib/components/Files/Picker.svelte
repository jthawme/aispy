<script>
	import { MAX_IMAGES } from '$lib/constants.js';
	import { createEventDispatcher } from 'svelte';
	import ContentBox from '../Compound/ContentBox.svelte';
	import Button from '../UI/Button.svelte';
	import TextLink from '../UI/TextLink.svelte';
	import Loader from '../UI/Loader.svelte';

	export let canUseWebcam = false;
	export let busy = false;
	export let images = 0;

	const dispatch = createEventDispatcher();

	function onSwitch() {
		dispatch('switch');
	}
</script>

<ContentBox headerAlign="end">
	<svelte:fragment slot="header">
		<span class="color-text-light">{images}/{MAX_IMAGES} Photos</span>
	</svelte:fragment>

	<label class="file-picker">
		<input type="file" accept="image/*" multiple on:change />
		<Button dummy expand disabled={images >= MAX_IMAGES || busy}
			>Add images {#if busy}<Loader />{/if}</Button
		>
	</label>

	<svelte:fragment slot="footer">
		{#if canUseWebcam}
			<TextLink icon="cameraOff" theme="light" on:click={onSwitch}>Use Webcam</TextLink>
		{/if}
	</svelte:fragment>

	<!-- <TextLink slot="below" on:click={onWhy}>Why?</TextLink> -->
</ContentBox>

<style lang="scss">
	.file-picker {
		input {
			display: none;
		}
	}
</style>
