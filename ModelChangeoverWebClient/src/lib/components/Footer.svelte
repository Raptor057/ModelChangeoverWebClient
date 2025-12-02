<script>
  // @ts-nocheck
  import { onMount } from "svelte";

  export let showToKeep;
  export let showToTake;
  export let showToPut;

  let loaded = false;

  $: if (loaded) localStorage["showToKeep"] = showToKeep;
  $: if (loaded) localStorage["showToPut"] = showToPut;
  $: if (loaded) localStorage["showToTake"] = showToTake;

  onMount(() => {
    showToKeep = localStorage["showToKeep"] == "true";
    showToPut = localStorage["showToPut"] == "true";
    showToTake = localStorage["showToTake"] == "true";
    loaded = true;
  });
</script>

<footer
  class="absolute bottom-0 inset-x-0 h-8 bg-[#061933] text-white text-xs
         flex items-center gap-2 px-4 select-none"
>
  <!-- COMÚN -->
  <label
    class="inline-flex items-center gap-1 rounded border border-sky-600
           bg-sky-50 text-sky-700 px-1.5 py-0.5 cursor-pointer"
  >
    <input
      type="checkbox"
      bind:checked={showToKeep}
      class="h-3 w-3 accent-sky-500"
    />
    <b class="text-[0.7rem] font-semibold bg-sky-500 text-white px-1.5 py-0.5 rounded">
      COM&Uacute;N
    </b>
  </label>

  <!-- RETORNAR -->
  <label
    class="inline-flex items-center gap-1 rounded border border-amber-700
           bg-amber-50 text-amber-800 px-1.5 py-0.5 cursor-pointer"
  >
    <input
      type="checkbox"
      bind:checked={showToTake}
      class="h-3 w-3 accent-amber-500"
    />
    <b class="text-[0.7rem] font-semibold bg-amber-300 text-black/70 px-1.5 py-0.5 rounded">
      RETORNAR
    </b>
  </label>

  <!-- CARGAR -->
  <label
    class="inline-flex items-center gap-1 rounded border border-rose-600
           bg-rose-50 text-rose-700 px-1.5 py-0.5 cursor-pointer"
  >
    <input
      type="checkbox"
      bind:checked={showToPut}
      class="h-3 w-3 accent-rose-500"
    />
    <b class="text-[0.7rem] font-semibold bg-rose-500 text-white px-1.5 py-0.5 rounded">
      CARGAR
    </b>
  </label>
</footer>
