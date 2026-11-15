import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  boton,
  campo,
  chip,
  indicador,
  aviso,
  mostrarAviso,
  preguntar,
} from '../componentes.js';
import { esc } from '../ui.js';
import { abrirVentana } from './embarques-comun.js';

const pagina = montarPagina('embarques/armar-embarque');

const EMBARQUES_DISPONIBLES = [
  { folio: 'EMB-2026-101', cliente: 'Cadena Centro', destino: 'CEDIS Guadalajara', transporte: 'Unidad T-14 · Placas 48-AB-9C' },
  { folio: 'EMB-2026-102', cliente: 'Audio Norte', destino: 'Monterrey Centro', transporte: 'Unidad T-08 · Placas 72-XY-1M' },
  { folio: 'EMB-2026-103', cliente: 'Sonido del Bajío', destino: 'León Guanajuato', transporte: 'Unidad T-21 · Placas 19-KL-5P' },
];

const CAJAS_ALMACEN = [
  { id: 'CX02-A', cliente: 'Cadena Centro', modelo: 'SPORT', unidades: 8, estado: 'Cerrada' },
  { id: 'CX06-A', cliente: 'Cadena Centro', modelo: 'PRO', unidades: 6, estado: 'Cerrada' },
  { id: 'CX01-A', cliente: 'Cadena Centro', modelo: 'SPORT', unidades: 6, estado: 'Empacando' },
  { id: 'CX02-B', cliente: 'Audio Norte', modelo: 'PRO', unidades: 6, estado: 'Cerrada' },
  { id: 'CX07-B', cliente: 'Audio Norte', modelo: 'MAX', unidades: 4, estado: 'Cerrada' },
  { id: 'CX03-C', cliente: 'Sonido del Bajío', modelo: 'MINI', unidades: 12, estado: 'Cerrada' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let embarqueActual = EMBARQUES_DISPONIBLES[0];
  let asignadas = [];
  let filtro = '';

  contenido.innerHTML = `
    ${encabezado(sesion, 'Armar embarque')}
    ${puedeAccionar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar esta pantalla.')}</div>`}

    <div class="mt-4">
      ${tarjeta(
        'Datos del embarque',
        `<div class="grid gap-4 md:grid-cols-4">
          ${campo({
            id: 'select-embarque',
            etiqueta: 'Folio de embarque',
            opciones: EMBARQUES_DISPONIBLES.map((e) => ({ valor: e.folio, texto: `${e.folio} (${e.cliente})` })),
            valor: embarqueActual.folio,
          })}
          <div id="detalle-embarque" class="md:col-span-3"></div>
        </div>`
      )}
    </div>

    <div id="kpis-embarque" class="mt-4"></div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      ${tarjeta(
        'Cajas disponibles en almacén',
        `${campo({
          id: 'buscar-caja',
          etiqueta: 'Filtrar caja por código o modelo',
          tipo: 'search',
          placeholder: 'Ej. CX02-A, SPORT…',
          extra: 'autocomplete="off"',
        })}
        <div id="tabla-disponibles" class="mt-3"></div>`
      )}
      ${tarjeta('Cajas asignadas al embarque', '<div id="tabla-asignadas"></div>', { relleno: false })}
    </div>

    ${
      puedeAccionar
        ? `<div class="mt-4 flex justify-end gap-2">
            ${boton('Vaciar selección', { tipo: 'secundario', id: 'btn-vaciar' })}
            ${boton('Confirmar embarque', { tipo: 'confirmar', id: 'btn-confirmar-emb' })}
          </div>`
        : ''
    }`;

  function pintar() {
    const totalUnidades = asignadas.reduce((acc, c) => acc + c.unidades, 0);

    document.getElementById('detalle-embarque').innerHTML = `
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div><dt class="text-xs text-suave">Cliente autorizado</dt><dd class="font-semibold">${esc(embarqueActual.cliente)}</dd></div>
        <div><dt class="text-xs text-suave">Destino</dt><dd class="font-semibold">${esc(embarqueActual.destino)}</dd></div>
        <div><dt class="text-xs text-suave">Transporte</dt><dd class="font-semibold">${esc(embarqueActual.transporte)}</dd></div>
      </dl>`;

    document.getElementById('kpis-embarque').innerHTML = `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        ${indicador({ titulo: 'Folio activo', valor: embarqueActual.folio, tono: 'marca' })}
        ${indicador({ titulo: 'Cajas cargadas', valor: String(asignadas.length), nota: 'Del cliente ' + embarqueActual.cliente, tono: 'exito' })}
        ${indicador({ titulo: 'Total de piezas', valor: String(totalUnidades), nota: 'Unidades listas para salida', tono: 'info' })}
      </div>`;

    const disponibles = CAJAS_ALMACEN.filter(
      (c) =>
        !asignadas.some((a) => a.id === c.id) &&
        (c.id.toLowerCase().includes(filtro) || c.modelo.toLowerCase().includes(filtro) || c.cliente.toLowerCase().includes(filtro))
    );

    document.getElementById('tabla-disponibles').innerHTML = tabla({
      filas: disponibles,
      vacio: 'No hay cajas disponibles en almacén',
      columnas: [
        { titulo: 'Caja', html: (c) => `<strong class="tabular-nums">${esc(c.id)}</strong>` },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        { titulo: 'Estado', html: (c) => chip(c.estado, c.estado === 'Cerrada' ? 'exito' : 'aviso') },
        {
          titulo: 'Acción',
          num: true,
          html: (c) => {
            if (!puedeAccionar) return '<span class="text-xs text-suave">Solo consulta</span>';
            if (c.estado !== 'Cerrada') return '<span class="text-xs text-suave">Caja abierta</span>';
            if (c.cliente !== embarqueActual.cliente) return '<span class="text-xs text-suave">Otro cliente</span>';
            return boton('Agregar', { tipo: 'secundario', extra: `data-agregar="${esc(c.id)}"` });
          },
        },
      ],
    });

    document.getElementById('tabla-asignadas').innerHTML = tabla({
      filas: asignadas,
      vacio: 'Aún no hay cajas asignadas a este embarque',
      detalleVacio: 'Solo puedes agregar cajas en estado Cerrada que correspondan al cliente seleccionado.',
      columnas: [
        { titulo: 'Caja', html: (c) => `<strong class="tabular-nums">${esc(c.id)}</strong>` },
        { titulo: 'Modelo', campo: 'modelo' },
        { titulo: 'Unidades', num: true, texto: (c) => `${c.unidades} pzas` },
        {
          titulo: 'Acción',
          num: true,
          html: (c) =>
            puedeAccionar
              ? boton('Quitar', { tipo: 'enlace', extra: `data-quitar="${esc(c.id)}"` })
              : '<span class="text-xs text-suave">—</span>',
        },
      ],
    });
  }

  contenido.addEventListener('click', (e) => {
    const btnAdd = e.target.closest('[data-agregar]');
    const btnDel = e.target.closest('[data-quitar]');

    if (btnAdd) {
      const caja = CAJAS_ALMACEN.find((c) => c.id === btnAdd.dataset.agregar);
      if (caja) {
        asignadas.push(caja);
        pintar();
      }
    }
    if (btnDel) {
      asignadas = asignadas.filter((c) => c.id !== btnDel.dataset.quitar);
      pintar();
    }
  });

  document.getElementById('buscar-caja').addEventListener('input', (e) => {
    filtro = e.target.value.trim().toLowerCase();
    pintar();
  });

  document.getElementById('select-embarque').addEventListener('change', async (e) => {
    const nuevo = EMBARQUES_DISPONIBLES.find((emb) => emb.folio === e.target.value);
    if (asignadas.length) {
      const ok = await preguntar({
        titulo: '¿Cambiar de embarque?',
        mensaje: 'Se limpiarán las cajas seleccionadas porque cada embarque pertenece a un solo cliente.',
        textoOk: 'Cambiar embarque',
      });
      if (!ok) {
        e.target.value = embarqueActual.folio;
        return;
      }
    }
    embarqueActual = nuevo;
    asignadas = [];
    pintar();
  });

  document.getElementById('btn-vaciar')?.addEventListener('click', async () => {
    if (!asignadas.length) return mostrarAviso('No hay cajas seleccionadas.', 'info');
    const ok = await preguntar({
      titulo: '¿Vaciar selección?',
      mensaje: `Se quitarán ${asignadas.length} cajas del embarque ${embarqueActual.folio}.`,
      textoOk: 'Vaciar',
      tipoOk: 'peligro',
    });
    if (!ok) return;
    asignadas = [];
    pintar();
  });

  document.getElementById('btn-confirmar-emb')?.addEventListener('click', () => {
    if (!asignadas.length) return mostrarAviso('Agrega al menos una caja cerrada antes de confirmar el embarque.', 'aviso');

    const totalPzas = asignadas.reduce((acc, c) => acc + c.unidades, 0);
    const { dialogo, cerrar } = abrirVentana({
      titulo: `Confirmar salida de ${embarqueActual.folio}`,
      html: `
        <dl class="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><dt class="text-xs text-suave">Cliente</dt><dd class="font-semibold">${esc(embarqueActual.cliente)}</dd></div>
          <div><dt class="text-xs text-suave">Destino</dt><dd class="font-semibold">${esc(embarqueActual.destino)}</dd></div>
          <div><dt class="text-xs text-suave">Cajas incluidas</dt><dd class="font-semibold">${asignadas.length} cajas</dd></div>
          <div><dt class="text-xs text-suave">Total de unidades</dt><dd class="font-semibold">${totalPzas} piezas</dd></div>
        </dl>
        <p class="mt-4 text-xs text-suave">Se registrará la asignación bajo el responsable <strong>${esc(sesion.usuario.nombre)}</strong>.</p>
        <div class="mt-5 flex justify-end gap-2">
          ${boton('Cancelar', { tipo: 'secundario', id: 'cancelar-emb' })}
          ${boton('Confirmar asignación', { tipo: 'confirmar', id: 'ok-emb' })}
        </div>`,
    });

    dialogo.querySelector('#cancelar-emb').addEventListener('click', cerrar);
    dialogo.querySelector('#ok-emb').addEventListener('click', () => {
      cerrar();
      mostrarAviso(`Embarque ${embarqueActual.folio} armado con ${asignadas.length} cajas (${totalPzas} unidades).`, 'exito');
      asignadas = [];
      pintar();
    });
  });

  pintar();
}

if (pagina) iniciar(pagina);