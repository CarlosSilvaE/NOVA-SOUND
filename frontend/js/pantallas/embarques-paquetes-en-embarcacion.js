import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  campo,
  chip,
  indicador,
  boton,
  aviso,
  mostrarAviso,
} from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('embarques/paquetes-en-embarcacion');

const PAQUETES = [
  { embarque: 'EMB-2026-101', unidadTransporte: 'Unidad T-14', caja: 'CX02-A', cliente: 'Cadena Centro', modelo: 'SPORT', piezas: 8, estiba: 'Verificada' },
  { embarque: 'EMB-2026-101', unidadTransporte: 'Unidad T-14', caja: 'CX06-A', cliente: 'Cadena Centro', modelo: 'PRO', piezas: 6, estiba: 'Pendiente' },
  { embarque: 'EMB-2026-102', unidadTransporte: 'Unidad T-08', caja: 'CX02-B', cliente: 'Audio Norte', modelo: 'PRO', piezas: 6, estiba: 'Verificada' },
  { embarque: 'EMB-2026-102', unidadTransporte: 'Unidad T-08', caja: 'CX07-B', cliente: 'Audio Norte', modelo: 'MAX', piezas: 4, estiba: 'Verificada' },
  { embarque: 'EMB-2026-103', unidadTransporte: 'Unidad T-21', caja: 'CX03-C', cliente: 'Sonido del Bajío', modelo: 'MINI', piezas: 12, estiba: 'Pendiente' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let filtroEmbarque = '';
  let filtroEstiba = '';

  const embarquesUnicos = [...new Set(PAQUETES.map((p) => p.embarque))];

  contenido.innerHTML = `
    ${encabezado(sesion, 'Paquetes en embarcación')}
    ${puedeAccionar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar la carga en embarcación.')}</div>`}

    <div id="resumen-carga" class="mt-4"></div>

    <div class="mt-4">
      ${tarjeta(
        'Manifiesto de carga por unidad',
        `<div class="mb-4 flex flex-wrap items-end gap-3">
          ${campo({
            id: 'filtro-emb',
            etiqueta: 'Embarque',
            opciones: [{ valor: '', texto: 'Todos los embarques' }, ...embarquesUnicos.map((e) => ({ valor: e, texto: e }))],
            clase: 'w-56',
          })}
          ${campo({
            id: 'filtro-estiba',
            etiqueta: 'Estado de estiba',
            opciones: [
              { valor: '', texto: 'Todos' },
              { valor: 'Verificada', texto: 'Verificada' },
              { valor: 'Pendiente', texto: 'Pendiente' },
            ],
            clase: 'w-48',
          })}
        </div>
        <div id="zona-tabla"></div>`
      )}
    </div>`;

  function pintar() {
    const filtrados = PAQUETES.filter(
      (p) => (!filtroEmbarque || p.embarque === filtroEmbarque) && (!filtroEstiba || p.estiba === filtroEstiba)
    );

    const verificados = PAQUETES.filter((p) => p.estiba === 'Verificada').length;
    const pendientes = PAQUETES.filter((p) => p.estiba === 'Pendiente').length;
    const totalPiezas = PAQUETES.reduce((acc, p) => acc + p.piezas, 0);

    document.getElementById('resumen-carga').innerHTML = `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        ${indicador({ titulo: 'Paquetes verificados', valor: String(verificados), nota: 'Estibados y escaneados', tono: 'exito' })}
        ${indicador({ titulo: 'Pendientes de verificación', valor: String(pendientes), nota: 'Por confirmar en anden', tono: 'aviso' })}
        ${indicador({ titulo: 'Piezas totales en unidades', valor: String(totalPiezas), nota: 'Distribuidas en transporte', tono: 'marca' })}
      </div>`;

    document.getElementById('zona-tabla').innerHTML = tabla({
      filas: filtrados,
      vacio: 'No hay paquetes con los filtros seleccionados',
      columnas: [
        { titulo: 'Embarque', html: (p) => `<strong class="text-marca-osc">${esc(p.embarque)}</strong>` },
        { titulo: 'Transporte', campo: 'unidadTransporte' },
        { titulo: 'Caja', html: (p) => `<strong class="tabular-nums">${esc(p.caja)}</strong>` },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        { titulo: 'Piezas', num: true, texto: (p) => `${p.piezas}` },
        {
          titulo: 'Estiba',
          html: (p) => chip(p.estiba, p.estiba === 'Verificada' ? 'exito' : 'aviso'),
        },
        {
          titulo: 'Acción',
          num: true,
          html: (p) => {
            if (p.estiba === 'Verificada') return '<span class="text-xs text-suave">Listo</span>';
            if (!puedeAccionar) return '<span class="text-xs text-suave">—</span>';
            return boton('Verificar estiba', { tipo: 'secundario', extra: `data-verificar="${esc(p.caja)}"` });
          },
        },
      ],
    });
  }

  contenido.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-verificar]');
    if (!btn || !puedeAccionar) return;
    const item = PAQUETES.find((p) => p.caja === btn.dataset.verificar);
    if (item) {
      item.estiba = 'Verificada';
      mostrarAviso(`Estiba de caja ${item.caja} verificada en ${item.unidadTransporte}.`, 'exito');
      pintar();
    }
  });

  document.getElementById('filtro-emb').addEventListener('change', (e) => {
    filtroEmbarque = e.target.value;
    pintar();
  });

  document.getElementById('filtro-estiba').addEventListener('change', (e) => {
    filtroEstiba = e.target.value;
    pintar();
  });

  pintar();
}

if (pagina) iniciar(pagina);