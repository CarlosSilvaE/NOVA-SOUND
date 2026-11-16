import { montarPagina, rutaA } from '../layout.js';
import { encabezado, tarjeta, tabla, campo, chip, boton } from '../componentes.js';
import { esc } from '../ui.js';
import { CAPACIDAD_POR_MODELO } from './empaque-comun.js';

const pagina = montarPagina('empaque/historial-de-cajas');

const CAJAS = [
  {
    caja: 'CX01-A',
    orden: 'ORD-2026-A1',
    cliente: 'Cadena Centro',
    modelo: 'SPORT',
    unidades: 6,
    estado: 'Empacando',
    fecha: '2026-11-15',
    responsable: 'Julián Ortega',
  },
  {
    caja: 'CX02-A',
    orden: 'ORD-2026-A1',
    cliente: 'Cadena Centro',
    modelo: 'SPORT',
    unidades: 8,
    estado: 'Cerrada',
    fecha: '2026-11-14',
    responsable: 'Julián Ortega',
  },
  {
    caja: 'CX02-B',
    orden: 'ORD-2026-B2',
    cliente: 'Audio Norte',
    modelo: 'PRO',
    unidades: 6,
    estado: 'Cerrada',
    fecha: '2026-11-14',
    responsable: 'Julián Ortega',
  },
  {
    caja: 'CX03-C',
    orden: 'ORD-2026-C3',
    cliente: 'Sonido del Bajío',
    modelo: 'MINI',
    unidades: 5,
    estado: 'En espera',
    fecha: '2026-11-13',
    responsable: 'Julián Ortega',
  },
  {
    caja: 'CX04-D',
    orden: 'ORD-2026-D4',
    cliente: 'Distribuidor Metro',
    modelo: 'MAX',
    unidades: 4,
    estado: 'Cerrada',
    fecha: '2026-11-12',
    responsable: 'Julián Ortega',
  },
];

function iniciar({ sesion, contenido }) {
  const idInicial = (new URLSearchParams(location.search).get('caja') || '').trim().toUpperCase();

  const clientesUnicos = [...new Set(CAJAS.map((c) => c.cliente))];
  const modelosUnicos = [...new Set(CAJAS.map((c) => c.modelo))];

  contenido.innerHTML = `
    ${encabezado(sesion, 'Historial de cajas')}

    <div class="mt-4">
      ${tarjeta(
        'Filtros de búsqueda',
        `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          ${campo({
            id: 'filtro-id',
            etiqueta: 'ID de caja',
            valor: idInicial,
            placeholder: 'Ej. CX02-A',
            extra: 'autocomplete="off"',
          })}
          ${campo({
            id: 'filtro-cliente',
            etiqueta: 'Cliente',
            opciones: [{ valor: '', texto: 'Todos' }, ...clientesUnicos.map((c) => ({ valor: c, texto: c }))],
          })}
          ${campo({
            id: 'filtro-modelo',
            etiqueta: 'Modelo',
            opciones: [{ valor: '', texto: 'Todos' }, ...modelosUnicos.map((m) => ({ valor: m, texto: m }))],
          })}
          ${campo({
            id: 'filtro-estado',
            etiqueta: 'Estado',
            opciones: [
              { valor: '', texto: 'Todos' },
              { valor: 'Cerrada', texto: 'Cerrada' },
              { valor: 'Empacando', texto: 'Empacando' },
              { valor: 'En espera', texto: 'En espera' },
            ],
          })}
          ${campo({ id: 'filtro-desde', etiqueta: 'Fecha desde', tipo: 'date' })}
          ${campo({ id: 'filtro-hasta', etiqueta: 'Fecha hasta', tipo: 'date' })}
        </div>
        <div class="mt-3 flex justify-end">
          ${boton('Limpiar filtros', { tipo: 'secundario', id: 'btn-limpiar' })}
        </div>`
      )}
    </div>

    <div class="mt-4">
      ${tarjeta('Registro histórico de cajas', '<div id="zona-tabla"></div>', { relleno: false })}
    </div>`;

  function aplicarFiltros() {
    const f = {
      id: document.getElementById('filtro-id').value.trim().toUpperCase(),
      cliente: document.getElementById('filtro-cliente').value,
      modelo: document.getElementById('filtro-modelo').value,
      estado: document.getElementById('filtro-estado').value,
      desde: document.getElementById('filtro-desde').value,
      hasta: document.getElementById('filtro-hasta').value,
    };

    const filtradas = CAJAS.filter(
      (c) =>
        (!f.id || c.caja.includes(f.id)) &&
        (!f.cliente || c.cliente === f.cliente) &&
        (!f.modelo || c.modelo === f.modelo) &&
        (!f.estado || c.estado === f.estado) &&
        (!f.desde || c.fecha >= f.desde) &&
        (!f.hasta || c.fecha <= f.hasta)
    );

    const varianteEstado = (estado) => {
      if (estado === 'Cerrada') return 'exito';
      if (estado === 'Empacando') return 'info';
      return 'aviso';
    };

    document.getElementById('zona-tabla').innerHTML = tabla({
      filas: filtradas,
      vacio: 'No se encontraron cajas en el historial',
      detalleVacio: 'Ajusta los filtros de fecha, estado o búsqueda para ver más registros.',
      columnas: [
        {
          titulo: 'Caja',
          html: (c) =>
            `<a class="btn btn-enlace font-bold tabular-nums" href="${rutaA(
              `pages/empaque/consultar-caja.html?caja=${encodeURIComponent(c.caja)}`
            )}">${esc(c.caja)}</a>`,
        },
        { titulo: 'Orden', campo: 'orden' },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        {
          titulo: 'Unidades',
          num: true,
          texto: (c) => {
            const cap = CAPACIDAD_POR_MODELO[c.modelo] || 6;
            return `${c.unidades} / ${cap}`;
          },
        },
        {
          titulo: 'Estado',
          html: (c) => chip(c.estado, varianteEstado(c.estado)),
        },
        { titulo: 'Fecha', campo: 'fecha' },
        { titulo: 'Responsable', campo: 'responsable' },
      ],
    });
  }

  ['filtro-id', 'filtro-cliente', 'filtro-modelo', 'filtro-estado', 'filtro-desde', 'filtro-hasta'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener(id === 'filtro-id' ? 'input' : 'change', aplicarFiltros);
  });

  document.getElementById('btn-limpiar').addEventListener('click', () => {
    document.getElementById('filtro-id').value = '';
    document.getElementById('filtro-cliente').value = '';
    document.getElementById('filtro-modelo').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-desde').value = '';
    document.getElementById('filtro-hasta').value = '';
    aplicarFiltros();
  });

  aplicarFiltros();
}

if (pagina) iniciar(pagina);