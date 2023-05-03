<script lang="ts">
    import Particles from "svelte-particles";
    import { loadFull } from "tsparticles";
    import { basic } from "tsparticles-demo-configs";

    export let name: string;

    let particlesConfig = {
        ...basic,
        fullScreen: {
            enable: false
        }
    };

    let ref = {};

    let handleParticlesLoaded = (e) => {
        const container = e.detail.particles;

        console.log(container);

        // use container to call its methods
    }

    let particlesInit = async (main) => {
        await loadFull(main);
    }
</script>

<main>
    <h1>Hello {name}!</h1>
    <p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
    <Particles id="tsparticles" class="my-class" options={particlesConfig} on:particlesLoaded={handleParticlesLoaded}
               particlesInit={particlesInit}/>
</main>

<style>
    :global(.my-class) {
        box-sizing: border-box;
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        height: 50vh;
        padding: 10px;
        border: 1rem solid #ff3e00;
    }

    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }

        :global(.my-class) {
            width: 80%;
        }
    }
</style>
