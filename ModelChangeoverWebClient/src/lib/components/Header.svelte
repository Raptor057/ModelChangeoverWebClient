<script lang="ts">
  // @ts-nocheck
  import { ChangeoverApi, CommonApi } from '$lib/api/HttpRequests.js';

  export let line;
  export let workOrder;
  export let status;

  let disabled = false;

  // Órdenes disponibles para cambio anticipado
  let workOrdersAvailable = [];
  let selectedWorkOrderCode: string | null = null;

  const handleApplyChangeoverClick = () => {
    if (confirm('Se aplicarán los cambios. Presióne OK para continuar...')) {
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

  // Trae las órdenes disponibles para la línea
  const handleGetWorkOrderAvailables = () => {
    ChangeoverApi.GetWorkOrderAvailablesByLineID(line.id)
      .then((data) => {
        // Asumiendo que el API regresa el objeto tal cual lo pegaste
        workOrdersAvailable = data?.pro_Production ?? [];
        console.log('Ordenes disponibles para la línea', line.code, workOrdersAvailable);
      });
  };

  const handleDeletedGamaClick = () => {
    if (confirm('Seguro que vas a realizar un reempaque?')) {
      const confirmationMessage = `Se borraron las gamas de la línea ${line.code}. Modelos [${line.partNo} y ${workOrder.partNo}]`;
      CommonApi.DeleteGama(line.partNo, workOrder.partNo, line.code, line.code)
        .then(() => {
          alert(confirmationMessage);
          window.location.reload(true);
        });
    }
  };

  // Actualizar estado de línea con la orden seleccionada
const handleUpdateProductionLineStatus = (nextWorkOrderCode: string | null, isActive: boolean) => {
  const patch = {
    ModelChangeoverInProcess: isActive,
    NextWorkOrderCode: isActive ? nextWorkOrderCode : null
  };

  ChangeoverApi.UpdateProductionLineStatus(line.code, patch)
    .then(() => {
      console.log(
        'Estado de línea actualizado para',
        line.code,
        'ModelChangeoverInProcess =',
        isActive,
        'NextWorkOrderCode =',
        isActive ? nextWorkOrderCode : null
      );
    });
};

  // Handler al seleccionar un toggle
const handleSelectNextWorkOrder = (nextCode: string, isChecked: boolean) => {
  if (isChecked) {
    // Activando el toggle: dejamos esta WO como siguiente
    selectedWorkOrderCode = nextCode;
    handleUpdateProductionLineStatus(nextCode, true);
  } else {
    // Desactivando el toggle: limpiamos el estado
    if (selectedWorkOrderCode === nextCode) {
      selectedWorkOrderCode = null;
    }
    handleUpdateProductionLineStatus(null, false);
  }
};

</script>

<header class="relative flex items-center gap-3 h-8 bg-[#061933] text-white text-xs px-3">
  <img
    src="gt-logo.png"
    alt="General Transmissions"
    class="h-6 w-auto"
  />

  <b class="font-semibold tracking-wide">
    Cambio de Modelo App
  </b>

  <!-- Línea -->
  <b class="font-semibold tracking-wide">
    Linea
  </b>
  <strong class="rounded px-2 py-0.5 bg-white/20 text-[#ff9500] text-xs min-w-[3rem] text-center">
    {line.type} {line.code}
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
    <!-- {#if status === 'Cambio de módelo requerido.'}
      <button
        id="apply-changeover-button"
        on:click={handleApplyChangeoverClick}
        disabled={disabled}
        class="inline-flex items-center h-7 px-3 rounded border border-emerald-500 text-emerald-400 text-xs font-semibold
               bg-transparent hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Aplicar
      </button>
    {/if} -->

    <!-- Botón que abre el drawer -->
    <button
      command="show-modal"
      commandfor="line-options-drawer"
      class="inline-flex items-center h-7 px-3 rounded-md bg-gray-950/5 text-[0.7rem] font-semibold text-gray-100
             border border-gray-600 hover:bg-gray-950/10"
    >
      Opciones de Línea
    </button>
  </div>
</header>

<!-- Drawer de opciones de línea -->
<el-dialog>
  <dialog
    id="line-options-drawer"
    aria-labelledby="drawer-title"
    class="fixed inset-0 size-auto max-h-none max-w-none overflow-hidden bg-transparent backdrop:bg-transparent"
  >
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div tabindex="0" class="absolute inset-0 pl-10 focus:outline-none sm:pl-16">
      <el-dialog-panel
        class="ml-auto block size-full max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
      >
        <div class="relative flex h-full flex-col overflow-y-auto bg-white shadow-xl">
          <!-- Header del drawer -->
          <div class="bg-[#061933] px-4 py-6 sm:px-6">
            <div class="flex items-center justify-between">
              <h2 id="drawer-title" class="text-base font-semibold text-white">
                Opciones de Línea ({line.code})
              </h2>
              <div class="ml-3 flex h-7 items-center">
                <button
                  type="button"
                  command="close"
                  commandfor="line-options-drawer"
                  class="relative rounded-md text-indigo-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span class="absolute -inset-2.5"></span>
                  <span class="sr-only">Cerrar panel</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    data-slot="icon"
                    aria-hidden="true"
                    class="size-6"
                  >
                    <path
                      d="M6 18 18 6M6 6l12 12"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mt-1">
              <p class="text-sm text-[#ffffff]">
                Acciones avanzadas para la línea y sus gammas. Úsalas con precaución.
              </p>
            </div>
          </div>

          <!-- Contenido del drawer -->
          <div class="relative flex-1 px-4 py-6 sm:px-6 space-y-4">
            <button
              id="gama-update-button"
              on:click={handleUpdateGamaClick}
              disabled={disabled}
              class="w-full inline-flex justify-center items-center h-9 px-3 rounded-md border border-sky-500 text-sky-600 text-sm font-semibold
                     bg-sky-50 hover:bg-sky-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Actualizar Gammas
            </button>

            <button
              id="gama-delete-button"
              on:click={handleDeletedGamaClick}
              disabled={disabled}
              class="w-full inline-flex justify-center items-center h-9 px-3 rounded-md border border-rose-500 text-rose-600 text-sm font-semibold
                     bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Borrar Gammas para Reempaque
            </button>

            {#if line.type === 'MT'}
              <button
                id="apply-changeover-anticipated-button"
                on:click={handleGetWorkOrderAvailables}
                command="show-modal"
                commandfor="anticipated-dialog"
                disabled={disabled}
                class="w-full inline-flex justify-center items-center h-9 px-3 rounded-md border border-orange-500 text-orange-600 text-sm font-semibold
                       bg-orange-50 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Habilitar Cambio de Modelo Anticipado
              </button>
            {/if}

            {#if status === 'Cambio de módelo requerido.'}
              <button
                id="apply-changeover-from-drawer"
                on:click={handleApplyChangeoverClick}
                disabled={disabled}
                class="w-full inline-flex justify-center items-center h-9 px-3 rounded-md border border-emerald-500 text-emerald-600 text-sm font-semibold
                       bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar Cambio de Modelo
              </button>
            {/if}
          </div>
        </div>
      </el-dialog-panel>
    </div>
  </dialog>
</el-dialog>

<!-- Modal para seleccionar la orden del cambio de modelo anticipado -->
<el-dialog>
  <dialog
    id="anticipated-dialog"
    aria-labelledby="anticipated-dialog-title"
    class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
  >
    <el-dialog-backdrop
      class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
    ></el-dialog-backdrop>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div tabindex="0" class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0">
      <el-dialog-panel
        class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all
               data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out
               data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6
               data-closed:sm:translate-y-0 data-closed:sm:scale-95"
      >
        <div>
          <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
              class="size-6 text-orange-600"
            >
              <path
                d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 id="anticipated-dialog-title" class="text-base font-semibold text-gray-900">
              Habilitar Cambio de Modelo Anticipado
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Selecciona la orden que quieres dejar como siguiente para la línea {line.code}.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 space-y-2">
          {#if workOrdersAvailable.length === 0}
            <p class="text-sm text-gray-400 text-center">
              No hay órdenes disponibles para cambio anticipado.
            </p>
          {:else}
            {#each workOrdersAvailable as item}
              <div class="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
                <div class="text-xs text-gray-700">
                  <div class="font-semibold text-gray-900">
                    Orden: {item.workOrderCode} <br>Numero de parte: {item.partNo} <br>Rev: {item.rev}
                  </div>
                  <div class="text-[0.7rem] text-gray-500">
                    Cliente: {item.clientName} · Target: {item.targetQty}
                  </div>
                </div>

                <!-- Toggle -->
                <div
                  class="group relative inline-flex w-11 shrink-0 rounded-full bg-gray-200 p-0.5 inset-ring inset-ring-gray-900/5
                         outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600"
                >
                  <span
                    class="relative size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out
                           group-has-checked:translate-x-5"
                  >
                    <span
                      aria-hidden="true"
                      class="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in
                             group-has-checked:opacity-0 group-has-checked:duration-100 group-has-checked:ease-out"
                    >
                      <svg viewBox="0 0 12 12" fill="none" class="size-3 text-gray-400">
                        <path
                          d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      aria-hidden="true"
                      class="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out
                             group-has-checked:opacity-100 group-has-checked:duration-200 group-has-checked:ease-in"
                    >
                      <svg viewBox="0 0 12 12" fill="currentColor" class="size-3 text-indigo-600">
                        <path
                          d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                        />
                      </svg>
                    </span>
                  </span>
                    <input
                      type="checkbox"
                      name={`anticipated-${item.workOrderCode}`}
                      aria-label={`Seleccionar ${item.workOrderCode} como siguiente orden`}
                      class="absolute inset-0 appearance-none focus:outline-hidden"
                      checked={selectedWorkOrderCode === item.workOrderCode}
                      on:change={(event) => handleSelectNextWorkOrder(item.workOrderCode, event.currentTarget.checked)}
                    />
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <div class="mt-5 sm:mt-6">
          <button
            type="button"
            command="close"
            commandfor="anticipated-dialog"
            class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs
                   hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cerrar
          </button>
        </div>
      </el-dialog-panel>
    </div>
  </dialog>
</el-dialog>
