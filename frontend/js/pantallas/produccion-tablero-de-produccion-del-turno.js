// Pantalla: Producción · Tablero de producción del turno.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, indicador, tabla, boton, chip, barra } from '../componentes.js';

const pagina = montarPagina('produccion/tablero-de-produccion-del-turno');

const ORDENES_TURNO = [
  { orden: 'OP-2026-101', linea: 'Línea 1', modelo: 'MINI', meta: 120, real: 96, defectos: 2, estado: 'En proceso' },
  { orden: 'OP-2026-102', linea: 'Línea 2', modelo: 'SPORT', meta: 80, real: 80, defectos: 1, estado: 'Completada' },
  { orden: 'OP-2026-103', linea: 'Línea 3', modelo: 'PRO', meta: 60, real: 42, defectos: 3, estado: 'En proceso' },
  { orden: 'OP-2026-104', linea: 'Línea 1', modelo: 'MAX', meta: 40, real: 30, defectos: 0, estado: 'En proceso' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  const metaTotal = ORDENES_TURNO.reduce((s, o) => s + o.meta, 0);
  const realTotal = ORDENES_TURNO.reduce((s, o) => s + o.real, 0);
  const defectosTotal = ORDENES_TURNO.reduce((s, o) => s + o.defectos, 0);
  const pctGlobal = Math.round((realTotal / metaTotal) * 100);

  const acciones = puedeAccionar
    ? `<a href="registrar-produccion.html">${boton('Registrar producción', { tipo: 'principal' })}</a>`
    : '';

  contenido.innerHTML = `
    ${encabezado(sesion, 'Tablero de producción del turno', acciones)}
    <div class="mt-4 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${indicador({ titulo: 'META DEL TURNO', valor: metaTotal, nota: '3 líneas activas', tono: 'marca' })}
        ${indicador({ titulo: 'PRODUCCIÓN REAL', valor: realTotal, nota: `${pctGlobal}% de cumplimiento`, tono: 'exito' })}
        ${indicador({ titulo: 'PENDIENTES', valor: metaTotal - realTotal, nota: 'por ensamblar', tono: 'aviso' })}
        ${indicador({ titulo: 'INCIDENCIAS / DEFECTOS', valor: defectosTotal, nota: 'registrados hoy', tono: 'peligro' })}
      </div>

      ${tarjeta('Órdenes de producción del turno', tabla({
        columnas: [
          { titulo: 'Orden', campo: 'orden' },
          { titulo: 'Línea', campo: 'linea' },
          { titulo: 'Modelo', campo: 'modelo' },
          { titulo: 'Meta', campo: 'meta' },
          { titulo: 'Real', campo: 'real' },
          {
            titulo: 'Avance',
            html: (o) => {
              const pct = Math.min(100, Math.round((o.real / o.meta) * 100));
              return `<div class="w-36">${barra(pct, pct >= 100 ? 'exito' : 'marca')}</div>`;
            }
          },
          {
            titulo: 'Estado',
            html: (o) => chip(o.estado, o.estado === 'Completada' ? 'exito' : 'info')
          },
        ],
        filas: ORDENES_TURNO,
        vacio: 'No hay órdenes de producción activas en este turno',
      }))}
    </div>
  `;
}

if (pagina) iniciar(pagina);
