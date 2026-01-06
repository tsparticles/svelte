import App from './App.svelte';

const app = new App({
    target: globalThis.document.body,
    props: {
        name: 'world'
    }
});

export default app;
