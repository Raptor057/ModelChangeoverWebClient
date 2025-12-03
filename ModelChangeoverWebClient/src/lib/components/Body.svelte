<script>
  // @ts-nocheck
  export let showToKeep;
  export let showToPut;
  export let showToTake;
  export let gamma;
  console.log("gamma", gamma);

  const getCardClasses = (item) => {
    if (item.incoming && item.outgoing) {
      // keep
      return "bg-sky-50 border border-sky-600 text-sky-800";
    }
    if (item.incoming) {
      // put
      return "bg-rose-50 border border-rose-600 text-rose-700";
    }
    // take
    return "bg-amber-50 border border-amber-700 text-amber-800";
  };

  const getBadgeClasses = (item) => {
    if (item.incoming && item.outgoing) {
      return "bg-sky-500 text-white";
    }
    if (item.incoming) {
      return "bg-rose-500 text-white";
    }
    return "bg-amber-300 text-black/70";
  };
</script>

<div
  class="absolute inset-x-0 top-8 bottom-8 overflow-x-auto bg-slate-100
         flex flex-col flex-wrap items-stretch justify-start gap-2
         px-4 py-3"
>
  {#each gamma as item, i}
    {#if (item.incoming && item.outgoing && showToKeep)
      || (item.incoming && !item.outgoing && showToPut)
      || (!item.incoming && item.outgoing && showToTake)}
      <div
        class={`relative rounded-md px-3 py-2 pl-12 shadow-sm text-sm ${getCardClasses(
          item
        )}`}
      >
        <!-- Punto de uso -->
        <b
          class={`absolute inset-y-0 left-0 w-10 flex items-center justify-center text-xs font-semibold rounded-l-md ${getBadgeClasses(
            item
          )}`}
        >
          {item.incoming
            ? item.incoming.pointOfUseCode
            : item.outgoing.pointOfUseCode}
        </b>

        <!-- Componente -->
        <strong class="block text-xs font-semibold">
          {item.incoming ? item.incoming.compNo : item.outgoing.compNo}
          {item.incoming ? item.incoming.compRev : item.outgoing.compRev}
        </strong>

        <small class="block text-[0.7rem] leading-snug">
          {item.incoming ? item.incoming.compDesc : item.outgoing.compDesc}
        </small>
      </div>
    {/if}
  {/each}
</div>
