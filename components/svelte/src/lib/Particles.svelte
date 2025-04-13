<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type { Container, ISourceOptions } from '@tsparticles/engine';
	import { tsParticles } from '@tsparticles/engine';
	import { initialized } from './utils.js';

	interface Props {
		particlesLoaded: CallableFunction;
		class: string;
		options: ISourceOptions;
		url: string;
		id: string;
		style: string;
		canStart: boolean;
		mounted: boolean;
	}

	let {
		particlesLoaded,
		class: cssClass,
		options = {},
		url = '',
		id = 'tsparticles',
		style: cssStyle = '',
		canStart = false,
		mounted = false
	}: Props = $props();

	let oldId = id;

	function destroyOldContainer() {
		if (oldId) {
			const oldContainer = tsParticles.dom().find((c) => c.id.toString() === oldId);

			if (oldContainer) {
				oldContainer.destroy();
			}
		}
	}

	const unsub = initialized.subscribe((value) => {
		canStart = value;

		loadParticles();
	});

	onDestroy(() => {
		unsub();

		destroyOldContainer();
	});

	onMount(() => {
		mounted = true;
		void loadParticles();
	});

	async function loadParticles(): Promise<void> {
		destroyOldContainer();

		if (!canStart || !mounted) {
			return;
		}

		if (id) {
			const cb = (container?: Container) => {
				particlesLoaded({
					particles: container
				});

				oldId = id;
			};

			const container = await tsParticles.load({
				id,
				options,
				url
			});

			cb(container);
		} else {
			particlesLoaded({
				particles: undefined
			});
		}
	}

	$effect(() => {
		async () => {
			await loadParticles();
		};
	});
</script>

<div {id} class={cssClass} style={cssStyle}></div>
