import { montarPagina, rutaA } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  boton,
  campo,
  chip,
  chipUnidad,
  aviso,
  estadoVacio,
  marcarError,
  mostrarAviso,
  preguntar,
} from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('empaque/consultar-caja');

const CAJAS = [
  {
    id: 'CX02-A',
    orden: 'ORD-2026-A1',
    cliente: 'Cadena Centro',
    modelo: 'SPORT',
    estado: 'Cerrada',
    contenido: [
      { serie: 'NS-2026-005201', color: 'Negro', estado: 'EMPACADA' },
      { serie: 'NS-2026-005202', color: 'Negro', estado: 'EMPACADA' },
    ],
    auditoria: [{ quien: 'Julián Ortega', cuando: '14/11/2026 10:42', que: 'Cierre de caja' }],
  },
  {
    id: 'CX03-C',
    orden: 'ORD-2026-C3',
    cliente: 'Sonido del Bajío',
    modelo: 'MINI',
    estado: 'Empacando',
    contenido: [{ serie: 'NS-2026-005401', color: 'Azul', estado: 'LIBERADA' }],
    auditoria: [],
  },
];

function iniciar({ sesion, contenido, puedeAccionar, puede }) {
  const puedeReabrir = puedeAccionar && puede('reabrir-caja');
  let encontrada = null;

  contenido.innerHTML = `
    ${encabezado(sesion, 'Consultar caja')}
    ${puedeReabrir ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar cajas: reabrirlas lo hace el supervisor de almacén.')}</div>`}

    <form id="form-buscar" class="tarjeta mt-4 flex flex-wrap items-end gap-3 p-3" role="search" novalidate>
      ${campo({
        id: 'id-caja',
        etiqueta: 'Id de la caja',
        placeholder: 'Ej. CX02-A',
        extra: 'autocomplete="off"',
        clase: 'w-64',
      })}
      ${boton('Buscar', { enviar: true })}
    </form>

    <div id="resultado" class="mt-4"></div>`;

  const zona = document.getElementById('resultado');
  zona.innerHTML = `<div class="tarjeta">${estadoVacio('Busca una caja', 'Escribe su id y presiona Buscar.')}</div>`;

  document.getElementById('id-caja').addEventListener('input', () => marcarError('id-caja', ''));

  document.getElementById('form-buscar').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('id-caja').value.trim().toUpperCase();
    marcarError('id-caja', id ? '' : 'Escribe el id de la caja.');
    if (!id) return;

    encontrada = CAJAS.find((c) => c.id === id) || null;
    if (!encontrada) {
      zona.innerHTML = `<div class="tarjeta">${estadoVacio('No se encontró ninguna caja', `No hay una caja con el id «${id}». Revisa el id e intenta de nuevo.`)}</div>`;
      return;
    }
    pintarCaja();
  });

  function pintarCaja() {
    const c = encontrada;
    const cerrada = c.estado === 'Cerrada';
    const acciones = `
      ${cerrada && puedeReabrir ? boton('Reabrir caja', { tipo: 'validar', id: 'reabrir' }) : ''}
      <a class="btn btn-enlace" href="${rutaA(`pages/empaque/historial-de-cajas.html?caja=${encodeURIComponent(c.id)}`)}">Ver historial</a>`;

    zona.innerHTML = `
      ${tarjeta(
        `Caja ${c.id}`,
        `<dl class="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div><dt class="text-xs text-suave">Estado</dt><dd class="mt-1">${chip(c.estado, cerrada ? 'info' : 'exito')}</dd></div>
          <div><dt class="text-xs text-suave">Orden</dt><dd class="font-semibold">${esc(c.orden)}</dd></div>
          <div><dt class="text-xs text-suave">Cliente</dt><dd class="font-semibold">${esc(c.cliente)}</dd></div>
          <div><dt class="text-xs text-suave">Modelo</dt><dd class="font-semibold">${esc(c.modelo)}</dd></div>
          <div><dt class="text-xs text-suave">Unidades</dt><dd class="font-semibold">${c.contenido.length}</dd></div>
        </dl>`,
        { acciones }
      )}

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        ${tarjeta(
          'Contenido de la caja',
          tabla({
            filas: c.contenido,
            vacio: 'La caja no tiene unidades',
            columnas: [
              { titulo: 'N.º de serie', html: (u) => `<strong class="tabular-nums">${esc(u.serie)}</strong>` },
              { titulo: 'Color', campo: 'color' },
              { titulo: 'Estado', html: (u) => chipUnidad(u.estado) },
            ],
          }),
          { relleno: false }
        )}

        ${tarjeta(
          'Auditoría',
          tabla({
            filas: c.auditoria,
            vacio: 'Sin movimientos registrados',
            columnas: [
              { titulo: 'Quién', campo: 'quien' },
              { titulo: 'Cuándo', campo: 'cuando' },
              { titulo: 'Qué', campo: 'que' },
            ],
          }),
          { relleno: false }
        )}
      </div>`;

    document.getElementById('reabrir')?.addEventListener('click', reabrir);
  }

  async function reabrir() {
    const r = await preguntar({
      titulo: `Reabrir caja ${encontrada.id}`,
      mensaje: 'Una caja cerrada solo se reabre con autorización de un supervisor y queda registrada.',
      motivo: { etiqueta: 'Motivo de la reapertura', requerido: true },
      textoOk: 'Reabrir caja',
    });
    if (!r) return;

    encontrada.estado = 'Empacando';
    encontrada.auditoria.unshift({
      quien: sesion.usuario.nombre,
      cuando: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }),
      que: `Reapertura: ${r.motivo}`,
    });

    mostrarAviso(`Caja ${encontrada.id} reabierta. Quedó registrado el motivo.`);
    pintarCaja();
  }

  // Si llegan desde otra pantalla con ?caja=CX02-A, se busca sola
  const idDeLaUrl = new URLSearchParams(location.search).get('caja');
  if (idDeLaUrl) {
    document.getElementById('id-caja').value = idDeLaUrl;
    document.getElementById('form-buscar').requestSubmit();
  }
}

if (pagina) iniciar(pagina);