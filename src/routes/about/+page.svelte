<script>
	import AboutContent from '$lib/components/AboutContent.svelte';
</script>

<svelte:head>
	<title>About – AI Spy</title>
</svelte:head>

<div class="about-page">
	<AboutContent />
</div>

<style lang="scss">
	.about-page {
		@include large-mobile {
			display: flex;

			max-width: 500px;
			margin: auto;

			padding: 4em 0;
		}
	}
</style>
