import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  campo,
  boton,
  chip,
  estadoVacio,
  marcarError,
} from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('embarques/rastreo-de-contenedor');

const CONTENEDORES = [
  {
    contenedor: 'CONT-NS-8841',
    folio: 'EMB-2026-102',
    cliente: 'Audio Norte',
    destino: 'Monterrey Centro',
    operador: 'Roberto Méndez · Unidad T-08',
    estado: 'En tránsito',
    cajas: [
      { id: 'CX02-B', modelo: 'PRO', piezas: 6 },
      { id: 'CX07-B', modelo: 'MAX', piezas: 4 },
    ],
    eventos: [
      { fecha: '15/11/2026 11:30', ubicacion: 'Planta Saltillo · Caseta Salida', detalle: 'Salida autorizada con marchamo #M-9041' },
      { fecha: '15/11/2026 12:15', ubicacion: 'Autopista Saltillo-Monterrey Km 42', detalle: 'En ruta sin incidencias' },
    ],
  },
  {
    contenedor: 'CONT-NS-8840',
    folio: 'EMB-2026-101',
    cliente: 'Cadena Centro',
    destino: 'CEDIS Guadalajara',
    operador: 'Carlos Rivas · Unidad T-14',
    estado: 'Cargando',
    cajas: [
      { id: 'CX02-A', modelo: 'SPORT', piezas: 8 },
      { id: 'CX06-A', modelo: 'PRO', piezas: 6 },
    ],
    eventos: [
      { fecha: '15/11/2026 13:10', ubicacion: 'Planta Saltillo · Andén 3', detalle: 'Carga y verificación de bultos en proceso' },
    ],
  },
];

function iniciar({ sesion, contenido }) {
  contenido.innerHTML = `
    ${encabezado(sesion, 'Rastreo de contenedor')}

    <form id="form-rastreo" class="tarjeta mt-4 flex flex-wrap items-end gap-3 p-4" role="search" novalidate>
      ${campo({
        id: 'busqueda-contenedor',
        etiqueta: 'Número de contenedor o folio de embarque',
        placeholder: 'Ej. CONT-NS-8841 o EMB-2026-102',
        extra: 'autocomplete="off"',
        clase: 'w-80',
      })}
      ${boton('Rastrear', { enviar: true })}
    </form>

    <div id="zona-rastreo" class="mt-4"></div>`;

  const zona = document.getElementById('zona-rastreo');
  zona.innerHTML = `<div class="tarjeta">${estadoVacio('Consulta un contenedor o embarque', 'Ingresa el código del contenedor (ej. CONT-NS-8841) o el folio de embarque.')}</div>`;

  document.getElementById('busqueda-contenedor').addEventListener('input', () => marcarError('busqueda-contenedor', ''));

  document.getElementById('form-rastreo').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('busqueda-contenedor').value.trim().toUpperCase();
    marcarError('busqueda-contenedor', q ? '' : 'Escribe un código de contenedor o folio.');
    if (!q) return;

    const hallado = CONTENEDORES.find((c) => c.contenedor === q || c.folio === q);
    if (!hallado) {
      zona.innerHTML = `<div class="tarjeta">${estadoVacio('Sin resultados de rastreo', `No se encontró información para «${q}».`)}</div>`;
      return;
    }

    zona.innerHTML = `
      ${tarjeta(
        `Contenedor ${hallado.contenedor} · ${hallado.folio}`,
        `<dl class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div><dt class="text-xs text-suave">Estado actual</dt><dd class="mt-1">${chip(hallado.estado, hallado.estado === 'En tránsito' ? 'info' : 'marca')}</dd></div>
          <div><dt class="text-xs text-suave">Cliente</dt><dd class="font-semibold">${esc(hallado.cliente)}</dd></div>
          <div><dt class="text-xs text-suave">Destino</dt><dd class="font-semibold">${esc(hallado.destino)}</dd></div>
          <div><dt class="text-xs text-suave">Transporte</dt><dd class="font-semibold">${esc(hallado.operador)}</dd></div>
        </dl>`
      )}

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        ${tarjeta(
          'Bitácora de recorrido',
          tabla({
            filas: hallado.eventos,
            vacio: 'Sin eventos registrados',
            columnas: [
              { titulo: 'Fecha / Hora', campo: 'fecha' },
              { titulo: 'Punto de control', campo: 'ubicacion' },
              { titulo: 'Detalle', campo: 'detalle' },
            ],
          }),
          { relleno: false }
        )}

        ${tarjeta(
          'Cajas dentro del contenedor',
          tabla({
            filas: hallado.cajas,
            vacio: 'Sin cajas asociadas',
            columnas: [
              { titulo: 'Caja', html: (c) => `<strong class="tabular-nums">${esc(c.id)}</strong>` },
              { titulo: 'Modelo', campo: 'modelo' },
              { titulo: 'Piezas', num: true, texto: (c) => String(c.piezas) },
            ],
          }),
          { relleno: false }
        )}
      </div>`;
  });

  const folioUrl = new URLSearchParams(location.search).get('folio');
  if (folioUrl) {
    document.getElementById('busqueda-contenedor').value = folioUrl;
    document.getElementById('form-rastreo').requestSubmit();
  }
}

if (pagina) iniciar(pagina);