<script>
  // @ts-nocheck
  import { ChangeoverApi, CommonApi } from '$lib/api/HttpRequests.js';

  export let line;
  export let workOrder;
  export let status;

  let disabled = false;

  const handleApplyChangeoverClick = () => {
    if (confirm("Se aplicarán los cambios. Presióne OK para continuar...")) {
      disabled = true;
      ChangeoverApi.applyChangeover(line.code)
        .then(() => window.location.reload(true))
        .catch((msg) => {
          disabled = false;
          window.alert(msg);
        });
    }
  };

  const handleUpdateGamaClick = () => {
    const confirmationMessage = `Se actualizaran las gamas de la línea ${line.code} Modelos [${line.partNo} y ${workOrder.partNo}]`;
    CommonApi.UpdateGama(line.partNo, workOrder.partNo, line.code, line.code)
      .then(() => window.location.reload(true));
    alert(confirmationMessage);
  };

  const handleDeletedGamaClick = () => {
    if (confirm("Seguro que vas a realizar un reempaque?")) {
      const confirmationMessage = `Se borraron las gamas de la línea ${line.code}. Modelos [${line.partNo} y ${workOrder.partNo}]`;
      CommonApi.DeleteGama(line.partNo, workOrder.partNo, line.code, line.code)
        .then(() => {
          alert(confirmationMessage);
          window.location.reload(true);
        });
    }
  };
</script>

<header class="relative flex items-center gap-3 h-8 bg-[#061933] text-white text-xs px-3">
  <img
    src="/gt-logo.png"
    alt="General Transmissions"
    class="h-6 w-auto"
  />

  <b class="font-semibold tracking-wide">
    Cambio de Modelo
  </b>

  <!-- Línea -->
  <strong class="rounded px-2 py-0.5 bg-white/20 text-[#ff9500] text-xs min-w-[3rem] text-center">
    {line.code}
  </strong>

  <!-- Orden cargada -->
  <span class="ml-2 text-[0.7rem] opacity-80">
    &Oacute;rden Cargada
  </span>
  <strong class="rounded px-2 py-0.5 bg-white/10 text-[#ff9500] text-xs flex items-center gap-1">
    {line.workOrderCode}
    <span>&bull;</span>
    {line.partNo}{line.revision}
  </strong>

  <!-- Orden activa -->
  <span class="ml-2 text-[0.7rem] opacity-80">
    &Oacute;rden Activa
  </span>
  <strong class="rounded px-2 py-0.5 bg-white/10 text-[#ff9500] text-xs flex items-center gap-1">
    {workOrder.code}
    <span>&bull;</span>
    {workOrder.partNo}{workOrder.revision}
  </strong>

  <div class="ml-auto flex items-center gap-2">
    {#if status === "Cambio de módelo requerido."}
      <button
        id="apply-changeover-button"
        on:click={handleApplyChangeoverClick}
        disabled={disabled}
        class="inline-flex items-center h-7 px-3 rounded border border-emerald-500 text-emerald-400 text-xs font-semibold
               bg-transparent hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Aplicar
      </button>
    {/if}

    <button
      id="gama-button"
      on:click={handleUpdateGamaClick}
      disabled={disabled}
      class="inline-flex items-center h-7 px-3 rounded border border-sky-500 text-sky-400 text-xs font-semibold
             bg-transparent hover:bg-sky-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Actualizar Gammas
    </button>

    <button
      id="gama-button"
      on:click={handleDeletedGamaClick}
      disabled={disabled}
      class="inline-flex items-center h-7 px-3 rounded border border-rose-500 text-rose-400 text-xs font-semibold
             bg-transparent hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Borrar Gammas Para Reempaque
    </button>
  </div>
</header>
