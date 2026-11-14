// Pantalla: Producción · Cierre de turno.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, indicador, tabla, boton, chip, aviso, preguntar } from '../componentes.js';

const pagina = montarPagina('produccion/cierre-de-turno');

const CIERRE_LINEAS = [
  { linea: 'Línea 1', modelos: 'MINI / MAX', meta: 160, real: 126, liberadas: 123, retrabajo: 2, scrap: 1, estado: 'Abierto' },
  { linea: 'Línea 2', modelos: 'SPORT', meta: 80, real: 80, liberadas: 79, retrabajo: 1, scrap: 0, estado: 'Cerrado' },
  { linea: 'Línea 3', modelos: 'PRO', meta: 60, real: 42, liberadas: 39, retrabajo: 2, scrap: 1, estado: 'Abierto' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let cerrado = false;
  let alerta = '';

  const rol = (sesion?.usuario?.rol || '').toLowerCase();
  const esOperador = rol.includes('operador');
  const puedeCerrar = puedeAccionar && !esOperador;

  function dibujar() {
    contenido.innerHTML = `
      ${encabezado(sesion, 'Cierre de turno')}
      <div class="mt-4 space-y-4">
        ${esOperador ? aviso('aviso', 'El cierre de turno no lo modifica un operador: el líder pide la corrección y un supervisor la autoriza.') : ''}
        ${alerta ? aviso('exito', alerta) : ''}

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${indicador({ titulo: 'TOTAL ENSAMBLADO', valor: 248, nota: 'Meta del turno: 300', tono: 'marca' })}
          ${indicador({ titulo: 'ENVIADAS A PRUEBA', valor: 241, nota: '97.1% cumplimiento', tono: 'exito' })}
          ${indicador({ titulo: 'EN RETRABAJO', valor: 5, nota: 'pendientes', tono: 'aviso' })}
          ${indicador({ titulo: 'SCRAP', valor: 2, nota: 'con motivo registrado', tono: 'peligro' })}
        </div>

        ${tarjeta('Resumen de cierre por línea', tabla({
          columnas: [
            { titulo: 'Línea', campo: 'linea' },
            { titulo: 'Modelos', campo: 'modelos' },
            { titulo: 'Meta', campo: 'meta' },
            { titulo: 'Real', campo: 'real' },
            { titulo: 'Liberadas', campo: 'liberadas' },
            { titulo: 'Retrabajo', campo: 'retrabajo' },
            { titulo: 'Scrap', campo: 'scrap' },
            {
              titulo: 'Estado',
              html: (c) => {
                const est = cerrado ? 'Cerrado' : c.estado;
                return chip(est, est === 'Cerrado' ? 'exito' : 'aviso');
              }
            },
          ],
          filas: CIERRE_LINEAS,
          vacio: 'No hay registros de líneas para este turno',
        }), {
          acciones: puedeCerrar ? `
            <div class="flex items-center gap-2">
              <a href="solicitar-ajuste.html">${boton('Solicitar corrección', { tipo: 'validar' })}</a>
              ${!cerrado ? boton('Confirmar cierre de turno', { tipo: 'confirmar', id: 'btn-cerrar-turno' }) : ''}
            </div>
          ` : ''
        })}
      </div>
    `;

    contenido.querySelector('#btn-cerrar-turno')?.addEventListener('click', async () => {
      const ok = await preguntar({
        titulo: 'Confirmar cierre de turno',
        mensaje: 'Se cerrará el conteo del turno actual. Cualquier cambio posterior requerirá autorización del supervisor.',
        motivo: { etiqueta: 'Nota de cierre', requerido: true },
      });
      if (!ok) return;
      cerrado = true;
      alerta = 'Cierre de turno confirmado y registrado en auditoría.';
      dibujar();
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
