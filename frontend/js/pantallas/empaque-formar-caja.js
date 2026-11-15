import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  boton,
  campo,
  chipUnidad,
  indicador,
  barra,
  aviso,
  mostrarAviso,
  preguntar,
} from '../componentes.js';
import { esc, pctDe } from '../ui.js';
import { CAPACIDAD_POR_MODELO, abrirResumenDeCierre } from './empaque-comun.js';

const pagina = montarPagina('empaque/formar-caja');

const ORDENES = [
  { id: 'ORD-2026-A1', cliente: 'Cadena Centro', modelo: 'SPORT' },
  { id: 'ORD-2026-B2', cliente: 'Audio Norte', modelo: 'PRO' },
  { id: 'ORD-2026-C3', cliente: 'Sonido del Bajío', modelo: 'MINI' },
];

const UNIDADES = [
  { serie: 'NS-2026-005201', modelo: 'SPORT', color: 'Negro', estado: 'LIBERADA' },
  { serie: 'NS-2026-005202', modelo: 'SPORT', color: 'Negro', estado: 'LIBERADA' },
  { serie: 'NS-2026-005203', modelo: 'SPORT', color: 'Gris', estado: 'LIBERADA' },
  { serie: 'NS-2026-005204', modelo: 'SPORT', color: 'Gris', estado: 'LIBERADA' },
  { serie: 'NS-2026-005205', modelo: 'SPORT', color: 'Negro', estado: 'EN_RETENCION' },
  { serie: 'NS-2026-005301', modelo: 'PRO', color: 'Gris', estado: 'LIBERADA' },
  { serie: 'NS-2026-005302', modelo: 'PRO', color: 'Gris', estado: 'LIBERADA' },
  { serie: 'NS-2026-005401', modelo: 'MINI', color: 'Azul', estado: 'LIBERADA' },
];

function iniciar({ sesion, contenido, puedeAccionar, puede }) {
  const puedeCerrar = puedeAccionar && puede('cerrar-caja');

  let orden = ORDENES[0];
  let enCaja = [];
  let numeroCaja = 5;
  let filtro = '';

  const capacidad = () => CAPACIDAD_POR_MODELO[orden.modelo];
  const idCaja = () => `CX${String(numeroCaja).padStart(2, '0')}-${orden.id.slice(-2)}`;

  contenido.innerHTML = `
    ${encabezado(sesion, 'Formar caja')}
    ${puedeCerrar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar esta pantalla.')}</div>`}

    <div class="mt-4">
      ${tarjeta(
        'Información del pedido',
        `<div class="grid gap-4 md:grid-cols-4">
          ${campo({
            id: 'orden',
            etiqueta: 'Orden',
            opciones: ORDENES.map((o) => ({ valor: o.id, texto: o.id })),
            valor: orden.id,
          })}
          <div id="datos-orden" class="md:col-span-3"></div>
        </div>`
      )}
    </div>

    <div id="resumen" class="mt-4"></div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      ${tarjeta(
        'Unidades disponibles',
        `${campo({
          id: 'buscar',
          etiqueta: 'Buscar serie',
          tipo: 'search',
          placeholder: 'Escanea o escribe la serie',
          extra: 'autocomplete="off"',
        })}
        <div id="disponibles" class="mt-3"></div>`
      )}
      ${tarjeta('Contenido de la caja', '<div id="en-caja"></div>', { relleno: false })}
    </div>

    <div class="mt-4 flex justify-end gap-2">
      ${boton('Cancelar', { tipo: 'secundario', id: 'cancelar' })}
      ${puedeCerrar ? boton('Cerrar caja', { tipo: 'confirmar', id: 'cerrar' }) : ''}
    </div>`;

  function pintar() {
    const cap = capacidad();

    document.getElementById('datos-orden').innerHTML = `
      <dl class="grid grid-cols-3 gap-4">
        <div><dt class="text-xs text-suave">Cliente</dt><dd class="font-semibold">${esc(orden.cliente)}</dd></div>
        <div><dt class="text-xs text-suave">Modelo</dt><dd class="font-semibold">${esc(orden.modelo)}</dd></div>
        <div><dt class="text-xs text-suave">Capacidad</dt><dd class="font-semibold">${cap} unidades por caja</dd></div>
      </dl>`;

    document.getElementById('resumen').innerHTML = `
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
        ${indicador({ titulo: 'Caja activa', valor: idCaja(), tono: 'marca' })}
        ${indicador({
          titulo: 'Progreso',
          valor: `${enCaja.length} de ${cap}`,
          nota: 'unidades en la caja',
          tono: enCaja.length === cap ? 'exito' : 'aviso',
        })}
        <div class="tarjeta p-4">
          <p class="text-xs uppercase tracking-wide text-suave">Llenado</p>
          <div class="mt-3">${barra(pctDe(enCaja.length, cap), 'marca')}</div>
        </div>
      </div>`;

    const disponibles = UNIDADES.filter(
      (u) =>
        u.modelo === orden.modelo &&
        !enCaja.some((c) => c.serie === u.serie) &&
        u.serie.toLowerCase().includes(filtro)
    );

    document.getElementById('disponibles').innerHTML = tabla({
      filas: disponibles,
      vacio: 'No hay unidades disponibles',
      detalleVacio: 'Solo aparecen unidades de este modelo que no estén ya en la caja.',
      columnas: [
        { titulo: 'N.º de serie', html: (u) => `<strong class="tabular-nums">${esc(u.serie)}</strong>` },
        { titulo: 'Color', campo: 'color' },
        { titulo: 'Estado', html: (u) => chipUnidad(u.estado) },
        {
          titulo: 'Acción',
          html: (u) =>
            u.estado === 'LIBERADA'
              ? boton('Agregar', { tipo: 'secundario', extra: `data-agregar="${esc(u.serie)}"` })
              : '<span class="text-xs text-suave">No se puede empacar</span>',
        },
      ],
    });

    document.getElementById('en-caja').innerHTML = tabla({
      filas: enCaja,
      vacio: 'La caja todavía no tiene unidades',
      detalleVacio: 'Agrega unidades de la lista de la izquierda.',
      columnas: [
        { titulo: 'N.º de serie', html: (u) => `<strong class="tabular-nums">${esc(u.serie)}</strong>` },
        { titulo: 'Color', campo: 'color' },
        { titulo: 'Estado', html: (u) => chipUnidad(u.estado) },
        {
          titulo: 'Acción',
          html: (u) => boton('Quitar', { tipo: 'enlace', extra: `data-quitar="${esc(u.serie)}"` }),
        },
      ],
    });
  }

  contenido.addEventListener('click', (e) => {
    const agregar = e.target.closest('[data-agregar]');
    const quitar = e.target.closest('[data-quitar]');

    if (agregar) {
      if (enCaja.length >= capacidad()) {
        return mostrarAviso(`La caja ya está llena (${capacidad()} unidades).`, 'aviso');
      }
      const unidad = UNIDADES.find((u) => u.serie === agregar.dataset.agregar);
      if (unidad) {
        enCaja.push(unidad);
        pintar();
      }
    }

    if (quitar) {
      enCaja = enCaja.filter((u) => u.serie !== quitar.dataset.quitar);
      pintar();
    }
  });

  document.getElementById('buscar').addEventListener('input', (e) => {
    filtro = e.target.value.trim().toLowerCase();
    pintar();
  });

  document.getElementById('orden').addEventListener('change', async (e) => {
    const nueva = ORDENES.find((o) => o.id === e.target.value);
    if (enCaja.length) {
      const ok = await preguntar({
        titulo: '¿Cambiar de orden?',
        mensaje: 'La caja activa tiene unidades y se vaciará, porque una caja no mezcla modelos.',
        textoOk: 'Cambiar de orden',
      });
      if (!ok) {
        e.target.value = orden.id;
        return;
      }
    }
    orden = nueva;
    enCaja = [];
    pintar();
  });

  document.getElementById('cancelar').addEventListener('click', async () => {
    if (!enCaja.length) {
      return mostrarAviso('No hay nada que cancelar: la caja está vacía.', 'info');
    }
    const ok = await preguntar({
      titulo: '¿Cancelar la formación de la caja?',
      mensaje: `Se quitarán las ${enCaja.length} unidades de ${idCaja()}.`,
      textoOk: 'Sí, cancelar',
      tipoOk: 'peligro',
    });
    if (!ok) return;
    enCaja = [];
    pintar();
    mostrarAviso('Se canceló la formación de la caja.', 'info');
  });

  document.getElementById('cerrar')?.addEventListener('click', () => {
    if (!enCaja.length) {
      return mostrarAviso('Agrega al menos una unidad antes de cerrar la caja.', 'aviso');
    }
    abrirResumenDeCierre({
      idCaja: idCaja(),
      orden: orden.id,
      cliente: orden.cliente,
      modelo: orden.modelo,
      cantidad: enCaja.length,
      capacidad: capacidad(),
      onConfirmar: () => {
        const cerrada = idCaja();
        mostrarAviso(`Caja ${cerrada} cerrada con ${enCaja.length} unidades. Quedó registrado ${sesion.usuario.nombre}.`);
        enCaja = [];
        numeroCaja += 1;
        pintar();
      },
    });
  });

  pintar();
}

if (pagina) iniciar(pagina);