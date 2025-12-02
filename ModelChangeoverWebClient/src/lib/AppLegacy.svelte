<script>
// @ts-nocheck  // para quitarte todos los warnings de tipos en este archivo legacy

  import { onMount } from 'svelte';

  import Body from "$lib/components/Body.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";

  import { ChangeoverApi, CommonApi } from "$lib/api/HttpRequests.js";

  // viene de +page.svelte
  export let lineCode = "";

  const changeoverStatues = {
    UNKNOWN: "No es posible determinar si se requiere un cambio de modelo.",
    REQUIRED: "Cambio de módelo requerido.",
    MATCH: "La órden cargada en la línea coincide con la órden activa."
  };
  Object.freeze(changeoverStatues);

  // estado
  let showToKeep = true;
  let showToPut = true;
  let showToTake = true;
  let line = {};
  let workOrder = {};
  let status = changeoverStatues.UNKNOWN;
  let gamma = [];

  const handleError = (err) => {
    console.error(err);
    if (typeof window !== 'undefined') {
      window.alert(err?.message ?? String(err));
    }
  };

  const updateLine = () => {
    if (!lineCode) return;

    ChangeoverApi.getLine(lineCode)
      .then((data) => {
        console.debug("getLine", data);
        line = { ...data };
        return updateWorkOrder();
      })
      .catch(handleError);
  };

  const updateWorkOrder = () => {
    if (!line?.id) return;

    return ChangeoverApi.getWorkOrderByLineID(line.id)
      .then((data) => {
        console.debug("getWorkOrderByLineID", data);
        workOrder = { ...data };

        status =
          line.workOrderCode === data.code && line.partNo === data.partNo
            ? changeoverStatues.MATCH
            : changeoverStatues.REQUIRED;

        // si se requiere cambio, comparamos gamas
        if (status === changeoverStatues.REQUIRED) {
          return compareGammas();
        }
      })
      .catch(handleError);
  };

  const compareGammas = () => {
    if (!lineCode || !workOrder?.partNo) return;

    return ChangeoverApi.getGamma(lineCode, workOrder.partNo)
      .then((incomingGamma) => {
        console.debug("incomingGamma", incomingGamma);

        return ChangeoverApi.getGamma(lineCode, line.partNo)
          .then((outgoingGamma) => {
            console.debug("outgoingGamma", outgoingGamma);

            const pointsOfUse = Array.from(
              new Set([
                ...incomingGamma.map((item) => item.pointOfUseCode),
                ...outgoingGamma.map((item) => item.pointOfUseCode)
              ])
            ).sort();

            const gammaStatus = [];

            for (const pou of pointsOfUse) {
              const inc = incomingGamma
                .filter((item) => item.pointOfUseCode === pou)
                .sort();

              const out = outgoingGamma
                .filter((item) => item.pointOfUseCode === pou)
                .sort();

              const comps = Array.from(
                new Set([
                  ...inc.map((item) => `${item.compNo} ${item.compRev}`),
                  ...out.map((item) => `${item.compNo} ${item.compRev}`)
                ])
              ).sort();

              for (const comp of comps) {
                gammaStatus.push({
                  pointOfUseCode: pou,
                  incoming: inc.find(
                    (item) => `${item.compNo} ${item.compRev}` === comp
                  ),
                  outgoing: out.find(
                    (item) => `${item.compNo} ${item.compRev}` === comp
                  )
                });
              }
            }

            gamma = gammaStatus;
            console.log("gamma", gamma);
          })
          .catch(handleError);
      })
      .catch(handleError);
  };

  // IMPORTANTE:
  // Sólo hacemos las llamadas a la API en el cliente.
  onMount(() => {
    if (lineCode) {
      updateLine();
    }
  });
</script>

<main>
  <Header {line} {workOrder} {status} />
  {#if status === changeoverStatues.REQUIRED}
    <Body {showToKeep} {showToTake} {showToPut} {gamma} />
  {:else}
    <div class="body">
      <h1>{status}</h1>
    </div>
  {/if}
  <Footer bind:showToKeep bind:showToPut bind:showToTake />
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif, sans-serif;
    font-size: 1vw;
    padding: 0;
    overflow: hidden;
  }

  .body {
    bottom: 2em;
    position: absolute;
    left: 0;
    top: 2em;
    width: 100%;
  }
  .body > h1 {
    left: 50%;
    position: absolute;
    text-align: center;
    top: 35%;
    transform: translate(-50%, -50%);
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2em;
    font-weight: 100;
  }
</style>
