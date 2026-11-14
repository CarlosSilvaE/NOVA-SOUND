// Pantalla: Producción · Registrar producción.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, tabla, boton, chipUnidad, aviso, marcarError } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('produccion/registrar-produccion');

const UNIDADES_PRODUCIDAS = [
  { serie: 'U-2026-04', lote: 'L-2026-05-A', linea: 'Línea 1', modelo: 'MINI', hora: '06:15', estado: 'PROBADA' },
  { serie: 'U-2026-05', lote: 'L-2026-05-A', linea: 'Línea 1', modelo: 'MINI', hora: '06:18', estado: 'PROBADA' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let filas = [...UNIDADES_PRODUCIDAS];
  let mensaje = '';

  function dibujar() {
    contenido.innerHTML = `
      ${encabezado(sesion, 'Registrar producción')}
      <div class="mt-4 space-y-4">
        ${mensaje ? aviso('exito', mensaje) : ''}

        ${tarjeta('Nueva unidad ensamblada', `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Línea *</label>
              <select id="rp-linea" class="campo w-full" ${!puedeAccionar ? 'disabled' : ''}>
                <option value="Línea 1">Línea 1</option>
                <option value="Línea 2">Línea 2</option>
                <option value="Línea 3">Línea 3</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Modelo *</label>
              <select id="rp-modelo" class="campo w-full" ${!puedeAccionar ? 'disabled' : ''}>
                <option value="MINI">MINI</option>
                <option value="SPORT">SPORT</option>
                <option value="PRO">PRO</option>
                <option value="MAX">MAX</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Lote *</label>
              <input id="rp-lote" type="text" class="campo w-full" value="L-2026-05-A" ${!puedeAccionar ? 'readonly' : ''}>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">N.º de serie *</label>
              <input id="rp-serie" type="text" class="campo w-full" placeholder="Ej. U-2026-06" ${!puedeAccionar ? 'readonly' : ''}>
            </div>
          </div>
        `, {
          acciones: puedeAccionar ? boton('Registrar unidad', { tipo: 'confirmar', id: 'btn-guardar-prod' }) : ''
        })}

        ${tarjeta('Unidades registradas en el turno', tabla({
          columnas: [
            { titulo: 'N.º de serie', campo: 'serie' },
            { titulo: 'Lote', campo: 'lote' },
            { titulo: 'Línea', campo: 'linea' },
            { titulo: 'Modelo', campo: 'modelo' },
            { titulo: 'Hora', campo: 'hora' },
            { titulo: 'Estado', html: (u) => chipUnidad(u.estado) },
          ],
          filas,
          vacio: 'No se han registrado unidades en este turno',
        }))}
      </div>
    `;

    contenido.querySelector('#btn-guardar-prod')?.addEventListener('click', () => {
      const inpSerie = contenido.querySelector('#rp-serie');
      const serie = (inpSerie?.value || '').trim().toUpperCase();
      const lote = (contenido.querySelector('#rp-lote')?.value || 'L-2026-05-A').trim().toUpperCase();

      if (!serie) {
        try { marcarError(inpSerie, 'Ingresa el número de serie de la unidad'); } catch (_) {}
        return;
      }

      filas.unshift({
        serie,
        lote,
        linea: contenido.querySelector('#rp-linea').value,
        modelo: contenido.querySelector('#rp-modelo').value,
        hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        estado: 'PROBADA',
      });
      mensaje = `Unidad ${esc(serie)} registrada y enviada a Prueba Funcional.`;
      dibujar();
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
