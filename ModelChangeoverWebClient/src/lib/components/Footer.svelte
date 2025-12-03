<script lang="ts">
  // @ts-nocheck
  import { onMount, onDestroy } from "svelte";
  import { ChangeoverApi, CommonApi } from "$lib/api/HttpRequests.js";

  export let showToKeep;
  export let showToTake;
  export let showToPut;

  let loaded = false;

  // ===== LocalStorage =====
  $: if (loaded) localStorage["showToKeep"] = showToKeep;
  $: if (loaded) localStorage["showToPut"] = showToPut;
  $: if (loaded) localStorage["showToTake"] = showToTake;

  // ===== API Info =====
  let changeoverInfo = null;
  let commonInfo = null;
  let infoLoading = false;
  let infoError = "";

  // ===== Health Check =====
  let changeoverHealthy = true;
  let commonHealthy = true;
  let previousChangeoverHealthy = true;
  let previousCommonHealthy = true;
  let healthIntervalId;

  // ===== Toast =====
  let showToast = false;
  let toastMessage = "";
  let toastType = "success"; // "success" | "error"
  let toastTimeoutId;

  const openToast = (message, type) => {
    toastMessage = message;
    toastType = type;
    showToast = true;

    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => {
      showToast = false;
    }, 2000); // 2 segundos
  };

  const loadApiInfo = async () => {
    infoLoading = true;
    infoError = "";
    try {
      const [changeover, common] = await Promise.all([
        ChangeoverApi.getApiInfo(),
        CommonApi.getApiInfo()
      ]);

      // Tus endpoints de info devuelven algo como:
      // { project, environment, version, hostname, message }
      changeoverInfo = changeover;
      commonInfo = common;
    } catch (err) {
      console.error("Error cargando info de APIs", err);
      infoError = String(err);
    } finally {
      infoLoading = false;
    }
  };

const checkHealthOnce = async () => {
  try {
    const text = await ChangeoverApi.getHealth(); // "Healthy"
    changeoverHealthy = text === "Healthy";
  } catch (err) {
    console.error("Health Changeover ERROR", err);
    changeoverHealthy = false;
  }

  try {
    const text = await CommonApi.getHealth(); // "Healthy"
    commonHealthy = text === "Healthy";
  } catch (err) {
    console.error("Health Common ERROR", err);
    commonHealthy = false;
  }

    // Detectar cambios de estado para mostrar toast
    if (previousChangeoverHealthy && !changeoverHealthy) {
      openToast("Conexión perdida con Servicio Changeover", "error");
    } else if (!previousChangeoverHealthy && changeoverHealthy) {
      openToast("Conexión restablecida con Servicio Changeover", "success");
    }

    if (previousCommonHealthy && !commonHealthy) {
      openToast("Conexión perdida con Servicio Common", "error");
    } else if (!previousCommonHealthy && commonHealthy) {
      openToast("Conexión restablecida con Servicio Common", "success");
    }

    previousChangeoverHealthy = changeoverHealthy;
    previousCommonHealthy = commonHealthy;
  };

  onMount(() => {
    // Restaurar switches de localStorage
    showToKeep = localStorage["showToKeep"] == "true";
    showToPut = localStorage["showToPut"] == "true";
    showToTake = localStorage["showToTake"] == "true";
    loaded = true;

    // Primer health check
    checkHealthOnce();

    // Poll cada 10 segundos
    healthIntervalId = setInterval(checkHealthOnce, 10000);
  });

  onDestroy(() => {
    if (healthIntervalId) clearInterval(healthIntervalId);
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
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

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Status mini-badges de health -->
  <div class="flex items-center gap-2">
    <span
      class="inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-medium inset-ring inset-ring-gray-500/10"
      class:bg-green-50={changeoverHealthy}
      class:text-green-700={changeoverHealthy}
      class:bg-red-50={!changeoverHealthy}
      class:text-red-700={!changeoverHealthy}
    >
      Changeover:
      <span class="ml-1 font-semibold">
        {changeoverHealthy ? 'OK' : 'OFF'}
      </span>
    </span>

    <span
      class="inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-medium inset-ring inset-ring-gray-500/10"
      class:bg-green-50={commonHealthy}
      class:text-green-700={commonHealthy}
      class:bg-red-50={!commonHealthy}
      class:text-red-700={!commonHealthy}
    >
      Common:
      <span class="ml-1 font-semibold">
        {commonHealthy ? 'OK' : 'OFF'}
      </span>
    </span>
  </div>

  <!-- Botón para abrir modal de info de APIs -->
  <button
    command="show-modal"
    commandfor="api-info-dialog"
    on:click={loadApiInfo}
    class="ml-2 rounded-md bg-gray-950/20 px-2 py-0.5 text-[0.7rem] font-semibold text-gray-100 hover:bg-gray-950/40"
  >
    Info APIs
  </button>
</footer>

<!-- Modal de info de APIs -->
<el-dialog>
  <dialog
    id="api-info-dialog"
    aria-labelledby="api-info-dialog-title"
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
        <div class="flex items-center justify-between">
          <div>
            <h3 id="api-info-dialog-title" class="text-base font-semibold text-gray-900">
              Información de APIs
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Detalles del entorno y versión de los servicios Changeover y Common.
            </p>
          </div>
          <button
            type="button"
            command="close"
            commandfor="api-info-dialog"
            class="inline-flex rounded-md text-gray-400 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span class="sr-only">Cerrar</span>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <div class="mt-4 space-y-4">
          {#if infoLoading}
            <p class="text-sm text-gray-500">Cargando información de APIs...</p>
          {:else if infoError}
            <p class="text-sm text-red-600">Error al cargar información: {infoError}</p>
          {:else}
            <!-- Changeover -->
            <section class="rounded-lg border border-gray-200 p-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Changeover API
                </h4>
                <span
                  class="inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-medium inset-ring inset-ring-green-600/20"
                  class:bg-green-50={changeoverHealthy}
                  class:text-green-700={changeoverHealthy}
                  class:bg-red-50={!changeoverHealthy}
                  class:text-red-700={!changeoverHealthy}
                >
                  {changeoverHealthy ? 'Conectado' : 'Sin conexión'}
                </span>
              </div>
              <div class="mt-2 flex flex-wrap gap-2 text-[0.7rem]">
                <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 inset-ring inset-ring-blue-700/10">
                  Project: {changeoverInfo?.project ?? '—'}
                </span>
                <span
                  class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring inset-ring-yellow-600/20
                        bg-gray-50 text-gray-600"
                  class:bg-green-50={changeoverInfo?.environment === 'Production'}
                  class:text-green-700={changeoverInfo?.environment === 'Production'}
                  class:bg-yellow-50={changeoverInfo?.environment === 'Staging'}
                  class:text-yellow-800={changeoverInfo?.environment === 'Staging'}
                  class:bg-red-50={changeoverInfo?.environment === 'Development'}
                  class:text-red-700={changeoverInfo?.environment === 'Development'}
                >
                  Env: {changeoverInfo?.environment ?? '—'}
                </span>
                <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 inset-ring inset-ring-indigo-700/10">
                  Version: {changeoverInfo?.version ?? '—'}
                </span>
                <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20">
                  Host: {changeoverInfo?.hostname ?? '—'}
                </span>
                <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10">
                  Message: {changeoverInfo?.message ?? '—'}
                </span>
              </div>
            </section>

            <!-- Common -->
            <section class="rounded-lg border border-gray-200 p-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Common API
                </h4>
                <span
                  class="inline-flex items-center rounded-md px-2 py-1 text-[0.65rem] font-medium inset-ring inset-ring-green-600/20"
                  class:bg-green-50={commonHealthy}
                  class:text-green-700={commonHealthy}
                  class:bg-red-50={!commonHealthy}
                  class:text-red-700={!commonHealthy}
                >
                  {commonHealthy ? 'Conectado' : 'Sin conexión'}
                </span>
              </div>
              <div class="mt-2 flex flex-wrap gap-2 text-[0.7rem]">
                <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 inset-ring inset-ring-blue-700/10">
                  Project: {commonInfo?.project ?? '—'}
                </span>
                <span
                class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring inset-ring-yellow-600/20
                bg-gray-50 text-gray-600"
                class:bg-green-50={changeoverInfo?.environment === 'Production'}
                class:text-green-700={changeoverInfo?.environment === 'Production'}
                class:bg-yellow-50={changeoverInfo?.environment === 'Staging'}
                class:text-yellow-800={changeoverInfo?.environment === 'Staging'}
                class:bg-red-50={changeoverInfo?.environment === 'Development'}
                class:text-red-700={changeoverInfo?.environment === 'Development'}
                >
                Env: {commonInfo?.environment ?? '—'}
                </span>
                <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 inset-ring inset-ring-indigo-700/10">
                  Version: {commonInfo?.version ?? '—'}
                </span>
                <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20">
                  Host: {commonInfo?.hostname ?? '—'}
                </span>
                <span class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10">
                  Message: {commonInfo?.message ?? '—'}
                </span>
              </div>
            </section>
          {/if}
        </div>

        <div class="mt-5 sm:mt-6">
          <button
            type="button"
            command="close"
            commandfor="api-info-dialog"
            class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Cerrar
          </button>
        </div>
      </el-dialog-panel>
    </div>
  </dialog>
</el-dialog>

<!-- Toast de health (solo cuando cambia a perdido / restablecido) -->
{#if showToast}
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
  >
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <div
        class="pointer-events-auto w-full max-w-sm translate-y-0 transform rounded-lg bg-white opacity-100 shadow-lg outline-1 outline-black/5 transition duration-300 ease-out sm:translate-x-0 starting:translate-y-2 starting:opacity-0 starting:sm:translate-x-2 starting:sm:translate-y-0"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="shrink-0">
              {#if toastType === 'success'}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                  class="size-6 text-green-400"
                >
                  <path
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {:else}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                  class="size-6 text-red-400"
                >
                  <path
                    d="M12 9v3.75M12 15.75h.007M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              {/if}
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">
                {toastType === 'success'
                  ? 'Conexión restablecida'
                  : 'Conexión perdida'}
              </p>
              <p class="mt-1 text-sm text-gray-500">
                {toastMessage}
              </p>
            </div>
            <div class="ml-4 flex shrink-0">
              <button
                type="button"
                class="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
                on:click={() => (showToast = false)}
              >
                <span class="sr-only">Cerrar</span>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                  <path
                    d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
