<div class="about-content">
	<slot />

	<p class="large">
		AI Spy is single player <span class="color-red">I Spy</span>. Thank goodness, finally.
	</p>

	<p>
		It uses the latest and greatest technological advancements in the ways they were intended to be
		used - to cure us of the crippling loneliness that the latest and greatest in technological
		advancements have created.
	</p>

	<div class="privacy">
		<h2>Privacy</h2>

		<p>
			None of your images are stored in anyway by this game. It uses this Google Cloud Vision API
			here for the analysing of images, so their <a
				class="std"
				href="https://cloud.google.com/vision/docs/data-usage"
				target="_blank">privacy policy</a
			> applies also.
		</p>
	</div>
</div>

<style lang="scss">
	.about-content {
		display: flex;

		flex-direction: column;

		padding: var(--inner-padding);
	}

	p {
		font-size: var(--font-size-normal);

		&.large {
			font-size: var(--font-size-large);

			margin: 0;
		}

		a {
			color: var(--color-red);
			text-decoration: none;
		}
	}

	.privacy {
		p {
			font-size: var(--font-size-small);
		}
	}

	h2 {
		font-size: var(--font-size-normal);
	}
</style>
