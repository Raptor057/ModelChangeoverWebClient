<!-- svelte-ignore export_let_unused -->
<!-- src/routes/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import AppLegacy from '$lib/AppLegacy.svelte';
  export let line;
  export let workOrder;
  export let status;
  // Reemplaza lo que antes hacías en main.js:
  // const params = new URLSearchParams(window.location.search)...
  $: lineCode = $page.url.searchParams.get('line') ?? '';
</script>

<main class="min-h-screen bg-slate-900 text-white">
  <!-- Aquí puedes poner wrappers Tailwind, layout, etc. -->
  <AppLegacy {lineCode} />
</main>
