import { montarPagina, rutaA } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  indicador,
  barra,
  chip,
  campo,
  aviso,
  boton,
} from '../componentes.js';
import { esc, num, pctDe } from '../ui.js';
import { CAPACIDAD_POR_MODELO } from './empaque-comun.js';

const pagina = montarPagina('empaque/inicio-de-empaque-panel-de-control');

const CAJAS = [
  { id: 'CX01-A', cliente: 'Cadena Centro', modelo: 'SPORT', unidades: 6, estado: 'Empacando' },
  { id: 'CX02-A', cliente: 'Cadena Centro', modelo: 'SPORT', unidades: 8, estado: 'Cerrada' },
  { id: 'CX02-B', cliente: 'Audio Norte', modelo: 'PRO', unidades: 6, estado: 'Cerrada' },
  { id: 'CX03-C', cliente: 'Sonido del Bajío', modelo: 'MINI', unidades: 5, estado: 'En espera' },
];

const UNIDADES_PENDIENTES = 12;

function iniciar({ sesion, contenido, puedeAccionar }) {
  let filtroEstado = 'todas';
  let textoBusqueda = '';

  const accionesHeader = `
    ${puedeAccionar ? `<a class="btn btn-principal" href="${rutaA('pages/empaque/formar-caja.html')}">+ Formar caja</a>` : ''}
    <a class="btn btn-secundario" href="${rutaA('pages/empaque/consultar-caja.html')}">Consultar caja</a>`;

  contenido.innerHTML = `
    ${encabezado(sesion, 'Inicio de empaque', accionesHeader)}
    ${puedeAccionar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar esta pantalla.')}</div>`}

    <div id="zona-indicadores" class="mt-4"></div>

    <div class="mt-4">
      ${tarjeta(
        'Cajas en proceso',
        `<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
          ${campo({
            id: 'buscar-caja',
            etiqueta: 'Buscar caja, cliente o modelo',
            tipo: 'search',
            placeholder: 'Ej. CX01-A, Cadena Centro…',
            extra: 'autocomplete="off"',
            clase: 'w-72',
          })}
          <div class="flex flex-wrap gap-2">
            ${boton('Todas', { tipo: 'secundario', extra: 'data-filtro="todas"' })}
            ${boton('En proceso', { tipo: 'secundario', extra: 'data-filtro="proceso"' })}
            ${boton('Cerradas', { tipo: 'secundario', extra: 'data-filtro="cerradas"' })}
          </div>
        </div>
        <div id="tabla-cajas"></div>`
      )}
    </div>`;

  function pintar() {
    const cerradas = CAJAS.filter((c) => c.estado === 'Cerrada').length;
    const enProceso = CAJAS.filter((c) => c.estado !== 'Cerrada').length;

    document.getElementById('zona-indicadores').innerHTML = `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="cursor-pointer transition hover:-translate-y-0.5" data-filtro="cerradas">
          ${indicador({
            titulo: 'Cajas cerradas',
            valor: num(cerradas),
            nota: '+12% vs turno anterior',
            tono: 'exito',
          })}
        </div>
        <div class="cursor-pointer transition hover:-translate-y-0.5" data-filtro="proceso">
          ${indicador({
            titulo: 'Cajas en proceso',
            valor: num(enProceso),
            nota: 'En línea de ensamble',
            tono: 'aviso',
          })}
        </div>
        <div class="cursor-pointer transition hover:-translate-y-0.5" data-filtro="todas">
          ${indicador({
            titulo: 'Pendientes de empaque',
            valor: num(UNIDADES_PENDIENTES),
            nota: 'Unidades liberadas sin caja',
            tono: 'marca',
          })}
        </div>
      </div>`;

    const filtradas = CAJAS.filter((c) => {
      const pasaEstado =
        filtroEstado === 'todas' ||
        (filtroEstado === 'cerradas' && c.estado === 'Cerrada') ||
        (filtroEstado === 'proceso' && c.estado !== 'Cerrada');

      const pasaTexto =
        !textoBusqueda ||
        c.id.toLowerCase().includes(textoBusqueda) ||
        c.cliente.toLowerCase().includes(textoBusqueda) ||
        c.modelo.toLowerCase().includes(textoBusqueda);

      return pasaEstado && pasaTexto;
    });

    const varianteEstado = (estado) => {
      if (estado === 'Empacando') return 'exito';
      if (estado === 'Cerrada') return 'info';
      return 'aviso';
    };

    document.getElementById('tabla-cajas').innerHTML = tabla({
      filas: filtradas,
      vacio: 'No hay cajas que coincidan con el filtro.',
      detalleVacio: 'Prueba cambiando el filtro o limpia el cuadro de búsqueda.',
      columnas: [
        {
          titulo: 'Caja',
          html: (c) => `<strong class="tabular-nums text-marca-osc">${esc(c.id)}</strong>`,
        },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        {
          titulo: 'Progreso',
          html: (c) => {
            const cap = CAPACIDAD_POR_MODELO[c.modelo] || 6;
            const pct = pctDe(c.unidades, cap);
            return `
              <div class="min-w-[130px] space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="font-semibold">${c.unidades} de ${cap}</span>
                  <span class="text-suave">${pct}%</span>
                </div>
                ${barra(pct, c.estado === 'Cerrada' ? 'exito' : 'marca')}
              </div>`;
          },
        },
        {
          titulo: 'Estado',
          html: (c) => chip(c.estado, varianteEstado(c.estado)),
        },
        {
          titulo: 'Detalle',
          num: true,
          html: (c) =>
            `<a class="btn btn-enlace" href="${rutaA(`pages/empaque/consultar-caja.html?caja=${encodeURIComponent(c.id)}`)}">Consultar caja</a>`,
        },
      ],
    });
  }

  contenido.addEventListener('click', (e) => {
    const disparador = e.target.closest('[data-filtro]');
    if (!disparador) return;
    filtroEstado = disparador.dataset.filtro;
    pintar();
  });

  document.getElementById('buscar-caja').addEventListener('input', (e) => {
    textoBusqueda = e.target.value.trim().toLowerCase();
    pintar();
  });

  pintar();
}

if (pagina) iniciar(pagina);