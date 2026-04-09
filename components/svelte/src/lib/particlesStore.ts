import { writable, derived } from 'svelte/store';
import type { Engine } from '@tsparticles/engine';
import { tsParticles } from '@tsparticles/engine';

interface ParticlesStoreState {
	engine: Engine | undefined;
	isReady: boolean;
	error: Error | undefined;
}

/**
 * Creates a Svelte store that manages centralized tsParticles engine initialization.
 * Ensures the engine is loaded once and shared across all Particles components.
 *
 * Usage:
 * ```ts
 * import { createParticlesStore, loadFull } from '@tsparticles/svelte';
 *
 * const particles = createParticlesStore();
 *
 * onMount(() => {
 *   particles.init(async (engine) => {
 *     await loadFull(engine);
 *   });
 * });
 *
 * // In components:
 * ${particles} // subscribe to reactive state
 * ```
 */
export function createParticlesStore() {
	const state = writable<ParticlesStoreState>({
		engine: undefined,
		isReady: false,
		error: undefined
	});

	let initPromise: Promise<void> | undefined;

	return {
		subscribe: state.subscribe,

		/**
		 * Initialize the particles engine.
		 * Multiple calls will return the same promise (cached).
		 */
		async init(particlesInit: (engine: Engine) => Promise<void> | void): Promise<void> {
			// Already initialized
			const current = await new Promise<ParticlesStoreState>((resolve) => {
				const unsub = state.subscribe((s) => {
					unsub();
					resolve(s);
				});
			});

			if (current.isReady) {
				return; // Already initialized
			}

			// Initialization in progress
			if (initPromise) {
				return initPromise;
			}

			// Start initialization
			initPromise = (async () => {
				try {
					await particlesInit(tsParticles);

					state.set({
						engine: tsParticles,
						isReady: true,
						error: undefined
					});
				} catch (err) {
					const error = err instanceof Error ? err : new Error(String(err));

					state.set({
						engine: undefined,
						isReady: true,
						error
					});

					console.error('Failed to initialize particles engine:', error);
					throw error;
				}
			})();

			return initPromise;
		},

		/**
		 * Get current state synchronously (for reactive binding).
		 */
		getState: () => {
			let current: ParticlesStoreState | undefined;

			const unsub = state.subscribe((s) => {
				current = s;
			});

			unsub();
			return current!;
		},

		/**
		 * Derived stores for granular reactivity.
		 */
		engine: derived(state, ($state) => $state.engine),
		isReady: derived(state, ($state) => $state.isReady),
		error: derived(state, ($state) => $state.error)
	};
}

/**
 * Singleton instance (can be imported across the app).
 */
export const particles = createParticlesStore();
