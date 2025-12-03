<script>
  import { page } from '$app/stores';
  import AppLegacy from '$lib/AppLegacy.svelte';

  // Soporta Line y line
  $: lineCode =
    $page.url.searchParams.get('line') ??
    $page.url.searchParams.get('Line') ??
    '';
</script>

<main class="min-h-screen bg-slate-900 text-white">
  <AppLegacy {lineCode} />
</main>
