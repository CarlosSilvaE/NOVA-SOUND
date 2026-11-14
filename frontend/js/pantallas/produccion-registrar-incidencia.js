// Pantalla: Producción · Registrar incidencia.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, tabla, boton, chip, aviso, marcarError } from '../componentes.js';

const pagina = montarPagina('produccion/registrar-incidencia');

const INCIDENCIAS_INICIALES = [
  { folio: 'INC-01', linea: 'Línea 2', tipo: 'Falta de material', severidad: 'Media', paro: '15 min', motivo: 'Retraso en entrega de baterías SPORT', estado: 'Abierta' },
  { folio: 'INC-02', linea: 'Línea 1', tipo: 'Ajuste de equipo', severidad: 'Baja', paro: '5 min', motivo: 'Calibración en estación de soldadura', estado: 'Resuelta' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let incidencias = [...INCIDENCIAS_INICIALES];
  let alerta = '';

  function dibujar() {
    contenido.innerHTML = `
      ${encabezado(sesion, 'Registrar incidencia')}
      <div class="mt-4 space-y-4">
        ${alerta ? aviso('aviso', alerta) : ''}

        ${tarjeta('Datos de la incidencia', `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Línea *</label>
              <select id="inc-linea" class="campo w-full" ${!puedeAccionar ? 'disabled' : ''}>
                <option value="Línea 1">Línea 1</option>
                <option value="Línea 2">Línea 2</option>
                <option value="Línea 3">Línea 3</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Tipo *</label>
              <select id="inc-tipo" class="campo w-full" ${!puedeAccionar ? 'disabled' : ''}>
                <option value="Paro de equipo">Paro de equipo</option>
                <option value="Falta de material">Falta de material</option>
                <option value="Defecto recurrente">Defecto recurrente</option>
                <option value="Ajuste de equipo">Ajuste de equipo</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Severidad *</label>
              <select id="inc-sev" class="campo w-full" ${!puedeAccionar ? 'disabled' : ''}>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Tiempo de paro (min)</label>
              <input id="inc-paro" type="number" min="0" value="10" class="campo w-full" ${!puedeAccionar ? 'readonly' : ''}>
            </div>
          </div>
          <div class="mt-3">
            <label class="block text-xs font-semibold text-suave mb-1">Descripción del problema *</label>
            <textarea id="inc-motivo" rows="2" class="campo w-full" placeholder="Describe la falla o incidencia..." ${!puedeAccionar ? 'readonly' : ''}></textarea>
          </div>
        `, {
          acciones: puedeAccionar ? boton('Registrar incidencia', { tipo: 'peligro', id: 'btn-inc' }) : ''
        })}

        ${tarjeta('Incidencias del turno', tabla({
          columnas: [
            { titulo: 'Folio', campo: 'folio' },
            { titulo: 'Línea', campo: 'linea' },
            { titulo: 'Tipo', campo: 'tipo' },
            {
              titulo: 'Severidad',
              html: (i) => chip(i.severidad, i.severidad === 'Alta' ? 'peligro' : i.severidad === 'Media' ? 'aviso' : 'info')
            },
            { titulo: 'Paro', campo: 'paro' },
            { titulo: 'Descripción', campo: 'motivo' },
            {
              titulo: 'Estado',
              html: (i) => chip(i.estado, i.estado === 'Resuelta' ? 'exito' : 'aviso')
            },
          ],
          filas: incidencias,
          vacio: 'No hay incidencias registradas en este turno',
        }))}
      </div>
    `;

    contenido.querySelector('#btn-inc')?.addEventListener('click', () => {
      const txt = contenido.querySelector('#inc-motivo');
      const motivo = (txt?.value || '').trim();
      if (!motivo) {
        try { marcarError(txt, 'Describe el motivo de la incidencia'); } catch (_) {}
        return;
      }
      const folio = `INC-0${incidencias.length + 1}`;
      incidencias.unshift({
        folio,
        linea: contenido.querySelector('#inc-linea').value,
        tipo: contenido.querySelector('#inc-tipo').value,
        severidad: contenido.querySelector('#inc-sev').value,
        paro: `${contenido.querySelector('#inc-paro').value || 0} min`,
        motivo,
        estado: 'Abierta',
      });
      alerta = `Incidencia ${folio} registrada correctamente.`;
      dibujar();
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
