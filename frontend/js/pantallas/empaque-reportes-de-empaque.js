import { montarPagina } from '../layout.js';
import { encabezado, indicador, tarjeta, tabla, barra, chip } from '../componentes.js';
import { esc, num, pctDe } from '../ui.js';

const pagina = montarPagina('empaque/reportes-de-empaque');

const METRICAS = {
  cerradas: 47,
  enProceso: 6,
  unidadesEmpacadas: 376,
  reaperturas: 2,
};

const RENDIMIENTO_HORA = [
  { hora: '07:00 - 08:00', cajas: 6 },
  { hora: '08:00 - 09:00', cajas: 8 },
  { hora: '09:00 - 10:00', cajas: 9 },
  { hora: '10:00 - 11:00', cajas: 7 },
  { hora: '11:00 - 12:00', cajas: 10 },
  { hora: '12:00 - 13:00', cajas: 7 },
];

const INCIDENCIAS = [
  {
    timestamp: '15/11/2026 09:18',
    caja: 'CX02-A',
    tipo: 'Etiqueta dañada en impresión',
    estado: 'Resuelta',
  },
  {
    timestamp: '15/11/2026 10:45',
    caja: 'CX03-C',
    tipo: 'Unidad en retención detectada al escanear',
    estado: 'Bloqueada',
  },
  {
    timestamp: '15/11/2026 11:30',
    caja: 'CX01-A',
    tipo: 'Reapertura solicitada por ajuste de orden',
    estado: 'Autorizada',
  },
];

function iniciar({ sesion, contenido }) {
  const maxCajas = Math.max(...RENDIMIENTO_HORA.map((r) => r.cajas), 1);

  const listaRendimiento = `
    <div class="space-y-3">
      ${RENDIMIENTO_HORA.map(
        (r) => `
        <div class="grid grid-cols-[110px_1fr_70px] items-center gap-3 text-sm">
          <span class="font-medium text-suave tabular-nums">${esc(r.hora)}</span>
          <div>${barra(pctDe(r.cajas, maxCajas), 'marca')}</div>
          <span class="text-right font-semibold tabular-nums">${num(r.cajas)} cajas</span>
        </div>`
      ).join('')}
    </div>`;

  const varianteIncidencia = (estado) => {
    if (estado === 'Resuelta') return 'exito';
    if (estado === 'Autorizada') return 'info';
    return 'aviso';
  };

  const tablaIncidencias = tabla({
    filas: INCIDENCIAS,
    vacio: 'Sin incidencias registradas en el turno.',
    columnas: [
      { titulo: 'Timestamp', campo: 'timestamp' },
      { titulo: 'Caja', html: (i) => `<strong class="tabular-nums text-marca-osc">${esc(i.caja)}</strong>` },
      { titulo: 'Tipo de incidencia', campo: 'tipo' },
      {
        titulo: 'Estado',
        html: (i) => chip(i.estado, varianteIncidencia(i.estado)),
      },
    ],
  });

  contenido.innerHTML = `
    ${encabezado(sesion, 'Reportes de empaque')}

    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      ${indicador({
        titulo: 'Cajas cerradas',
        valor: num(METRICAS.cerradas),
        nota: 'Turno actual',
        tono: 'exito',
      })}
      ${indicador({
        titulo: 'Cajas en proceso',
        valor: num(METRICAS.enProceso),
        nota: 'Abiertas en estación',
        tono: 'aviso',
      })}
      ${indicador({
        titulo: 'Unidades empacadas',
        valor: num(METRICAS.unidadesEmpacadas),
        nota: 'Total acumulado',
        tono: 'marca',
      })}
      ${indicador({
        titulo: 'Reaperturas',
        valor: num(METRICAS.reaperturas),
        nota: 'Autorizadas por supervisión',
        tono: 'peligro',
      })}
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      ${tarjeta('Rendimiento de empaque por hora', listaRendimiento)}
      ${tarjeta('Incidencias registradas', tablaIncidencias, { relleno: false })}
    </div>`;
}

if (pagina) iniciar(pagina);