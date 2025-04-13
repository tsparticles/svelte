<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  import Counter from './lib/Counter.svelte'
  import configs from "@tsparticles/configs";
  import type { Container, Engine } from "@tsparticles/engine";
  import Particles, { particlesInit } from "@tsparticles/svelte";
  import { loadFull } from "tsparticles";
  import type {EventHandler} from "svelte/elements";

  void particlesInit(async (engine: Engine) => {
    await loadFull(engine);
  });

  let particlesConfig = configs.basic;

  let handleParticlesLoaded = (e: EventHandler<Container | undefined>) => {
    const container = e.detail.particles;

    console.log(container);

    // use container to call its methods
  };
</script>

<main>
  <Particles id="tsparticles" class="my-class" options={particlesConfig} on:particlesLoaded={handleParticlesLoaded}/>

  <div>
    <a href="https://vite.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>

