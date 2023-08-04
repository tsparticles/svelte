<svelte:options accessors={true} />

<script lang="ts">
    import { afterUpdate, createEventDispatcher, onDestroy } from "svelte";
    import type { ISourceOptions } from "tsparticles-engine";
    import { tsParticles } from "tsparticles-engine";

    let cssClass = "";
    export { cssClass as class };

    let style = "";
    export { style };
    export let options: ISourceOptions = {};
    export let url = "";
    export let id = "tsparticles";
    export let particlesInit;

    const dispatch = createEventDispatcher();

    const particlesLoadedEvent = "particlesLoaded";

    let oldId = id;

    function destroyOldContainer() {
        if (oldId) {
            const oldContainer = tsParticles.dom().find(c => c.id === oldId);

            if (oldContainer) {
                oldContainer.destroy();
            }
        }
    }

    afterUpdate(async () => {
        tsParticles.init();

        if (particlesInit) {
            await particlesInit(tsParticles);
        }

        destroyOldContainer();

        if (id) {
            const cb = container => {
                dispatch(particlesLoadedEvent, {
                    particles: container,
                });

                oldId = id;
            };

            let container;

            if (url) {
                container = await tsParticles.loadJSON(id, url);
            } else if (options) {
                container = await tsParticles.load(id, options);
            } else {
                console.error("You must specify options or url to load tsParticles");

                return;
            }

            cb(container);
        } else {
            dispatch(particlesLoadedEvent, {
                particles: undefined,
            });
        }
    });

    onDestroy(destroyOldContainer);
</script>

<div {id} class={cssClass} {style} />
