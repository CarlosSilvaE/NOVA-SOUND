// Pantalla: Producción · Tablero de línea (líder).
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, indicador, tabla, boton, chip, barra } from '../componentes.js';

const pagina = montarPagina('produccion/tablero-de-linea-lider');

const ESTACIONES = [
  { estacion: 'Estación 1 · Chasis', operador: '1001 · a.torres', modelo: 'MINI', avance: 96, estado: 'Activa' },
  { estacion: 'Estación 2 · Audio', operador: '1004 · l.gomez', modelo: 'MINI', avance: 89, estado: 'Activa' },
  { estacion: 'Estación 3 · Bluetooth', operador: '1008 · r.perez', modelo: 'MINI', avance: 85, estado: 'En ajuste' },
  { estacion: 'Estación 4 · Salida a Prueba', operador: '1001 · a.torres', modelo: 'MINI', avance: 92, estado: 'Activa' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  const acciones = puedeAccionar
    ? `
      <div class="flex items-center gap-2">
        <a href="solicitar-ajuste.html">${boton('Solicitar ajuste', { tipo: 'validar' })}</a>
        <a href="cierre-de-turno.html">${boton('Cierre de turno', { tipo: 'principal' })}</a>
      </div>
    `
    : '';

  contenido.innerHTML = `
    ${encabezado(sesion, 'Tablero de línea (líder)', acciones)}
    <div class="mt-4 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        ${indicador({ titulo: 'EFICIENCIA LÍNEA 1', valor: '91%', nota: 'Modelo actual: MINI', tono: 'exito' })}
        ${indicador({ titulo: 'ESTACIONES ACTIVAS', valor: '4 / 4', nota: 'Turno 1 completo', tono: 'marca' })}
        ${indicador({ titulo: 'TIEMPO DE PARO', valor: '20 min', nota: '2 incidencias en turno', tono: 'aviso' })}
        ${indicador({ titulo: 'RETRABAJOS', valor: '1', nota: 'devuelto de prueba funcional', tono: 'peligro' })}
      </div>

      ${tarjeta('Estado por estación de la línea', tabla({
        columnas: [
          { titulo: 'Estación', campo: 'estacion' },
          { titulo: 'Operador', campo: 'operador' },
          { titulo: 'Modelo', campo: 'modelo' },
          {
            titulo: 'Rendimiento',
            html: (e) => `<div class="w-36">${barra(e.avance, e.avance >= 90 ? 'exito' : 'aviso')}</div>`
          },
          {
            titulo: 'Estado',
            html: (e) => chip(e.estado, e.estado === 'Activa' ? 'exito' : 'aviso')
          },
        ],
        filas: ESTACIONES,
        vacio: 'No hay estaciones configuradas en esta línea',
      }))}
    </div>
  `;
}

if (pagina) iniciar(pagina);
