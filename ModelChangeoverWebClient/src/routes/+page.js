// src/routes/+page.js
// @ts-nocheck  // para quitarte todos los warnings de tipos en este archivo legacy

import { ChangeoverApi } from '$lib/api/HttpRequests.js';

export const ssr = false; // muy importante: solo cliente
export const csr = true;

export async function load({ url }) {
  const lineCode = url.searchParams.get('line');

  if (!lineCode) {
    return {
      line: null,
      workOrder: null,
      status: 'No se proporcionó línea.'
    };
  }

  try {
    // Llamadas a tus APIs
    const line = await ChangeoverApi.getLine(lineCode);
    const workOrder = await ChangeoverApi.getWorkOrderByLineID(line.id);

    // Ajusta este cálculo al que usabas antes
    const status = line?.statusMessage ?? 'Cambio de módelo requerido.';

    return {
      line,
      workOrder,
      status
    };
  } catch (err) {
    console.error('Error cargando datos de la línea', err);
    return {
      line: null,
      workOrder: null,
      status: 'NO ES POSIBLE DETERMINAR SI SE REQUIERE UN CAMBIO DE MODELO.'
    };
  }
}
