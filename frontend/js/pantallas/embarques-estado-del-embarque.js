import { montarPagina, rutaA } from '../layout.js';
import { encabezado, indicador, tarjeta, tabla, campo, chip, barra } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('embarques/estado-del-embarque');

const EMBARQUES = [
  { folio: 'EMB-2026-101', cliente: 'Cadena Centro', destino: 'CEDIS Guadalajara', cajas: 6, avance: 75, estado: 'Cargando', salida: '15/11/2026 16:00' },
  { folio: 'EMB-2026-102', cliente: 'Audio Norte', destino: 'Monterrey Centro', cajas: 4, avance: 100, estado: 'En tránsito', salida: '15/11/2026 11:30' },
  { folio: 'EMB-2026-103', cliente: 'Sonido del Bajío', destino: 'León Guanajuato', cajas: 5, avance: 40, estado: 'En preparación', salida: '15/11/2026 18:00' },
  { folio: 'EMB-2026-099', cliente: 'Distribuidor Metro', destino: 'CDMX Vallejo', cajas: 8, avance: 100, estado: 'Entregado', salida: '14/11/2026 09:00' },
];

function iniciar({ sesion, contenido }) {
  let filtroEstado = '';
  let busqueda = '';

  contenido.innerHTML = `
    ${encabezado(sesion, 'Estado del embarque')}

    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
      ${indicador({ titulo: 'En preparación', valor: String(EMBARQUES.filter((e) => e.estado === 'En preparación').length), tono: 'aviso' })}
      ${indicador({ titulo: 'Cargando en andén', valor: String(EMBARQUES.filter((e) => e.estado === 'Cargando').length), tono: 'marca' })}
      ${indicador({ titulo: 'En tránsito', valor: String(EMBARQUES.filter((e) => e.estado === 'En tránsito').length), tono: 'info' })}
      ${indicador({ titulo: 'Entregados', valor: String(EMBARQUES.filter((e) => e.estado === 'Entregado').length), tono: 'exito' })}
    </div>

    <div class="mt-4">
      ${tarjeta(
        'Tablero de seguimiento de embarques',
        `<div class="mb-4 flex flex-wrap items-end gap-3">
          ${campo({
            id: 'buscar-emb',
            etiqueta: 'Buscar folio, cliente o destino',
            tipo: 'search',
            placeholder: 'Ej. EMB-2026-101, Cadena Centro…',
            extra: 'autocomplete="off"',
            clase: 'w-72',
          })}
          ${campo({
            id: 'filtro-estado',
            etiqueta: 'Estatus',
            opciones: [
              { valor: '', texto: 'Todos' },
              { valor: 'En preparación', texto: 'En preparación' },
              { valor: 'Cargando', texto: 'Cargando' },
              { valor: 'En tránsito', texto: 'En tránsito' },
              { valor: 'Entregado', texto: 'Entregado' },
            ],
            clase: 'w-48',
          })}
        </div>
        <div id="tabla-embarques"></div>`
      )}
    </div>`;

  function pintar() {
    const filtrados = EMBARQUES.filter(
      (e) =>
        (!filtroEstado || e.estado === filtroEstado) &&
        (!busqueda ||
          e.folio.toLowerCase().includes(busqueda) ||
          e.cliente.toLowerCase().includes(busqueda) ||
          e.destino.toLowerCase().includes(busqueda))
    );

    const tonoEstado = (est) => {
      if (est === 'Entregado') return 'exito';
      if (est === 'En tránsito') return 'info';
      if (est === 'Cargando') return 'marca';
      return 'aviso';
    };

    document.getElementById('tabla-embarques').innerHTML = tabla({
      filas: filtrados,
      vacio: 'No hay embarques con esos filtros',
      columnas: [
        { titulo: 'Folio', html: (e) => `<strong class="tabular-nums text-marca-osc">${esc(e.folio)}</strong>` },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Destino', campo: 'destino' },
        { titulo: 'Cajas', num: true, texto: (e) => `${e.cajas} cajas` },
        {
          titulo: 'Avance',
          html: (e) => `<div class="min-w-[120px]">${barra(e.avance, e.avance === 100 ? 'exito' : 'marca')}</div>`,
        },
        { titulo: 'Estatus', html: (e) => chip(e.estado, tonoEstado(e.estado)) },
        { titulo: 'Salida programada', campo: 'salida' },
        {
          titulo: 'Rastreo',
          num: true,
          html: (e) =>
            `<a class="btn btn-enlace" href="${rutaA(`pages/embarques/rastreo-de-contenedor.html?folio=${encodeURIComponent(e.folio)}`)}">Rastrear</a>`,
        },
      ],
    });
  }

  document.getElementById('buscar-emb').addEventListener('input', (e) => {
    busqueda = e.target.value.trim().toLowerCase();
    pintar();
  });

  document.getElementById('filtro-estado').addEventListener('change', (e) => {
    filtroEstado = e.target.value;
    pintar();
  });

  pintar();
}

if (pagina) iniciar(pagina);