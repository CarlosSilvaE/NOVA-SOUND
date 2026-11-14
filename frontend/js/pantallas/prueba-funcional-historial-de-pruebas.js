// Pantalla: Prueba funcional · Historial de pruebas.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, indicador, tabla, boton, chip, aviso } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('prueba-funcional/historial-de-pruebas');

const RESUMEN_HISTORIAL = {
  total: 8,
  aprobadas: 2,
  rechazadas: 1,
  tasa: 1,
};

const HISTORIAL = [
  {
    unidad: 'U-2026-04',
    fecha: '2026-05-12 06:15',
    fechaCorta: '2026-05-12',
    resultado: 'Aprobada',
    operador: 'a.torres',
    detalle: 'Encendido Audio Carga Bluetooth',
    nota: 'Todas las pruebas aprobadas sin observaciones.',
  },
  {
    unidad: 'U-2026-02',
    fecha: '2026-05-12 06:00',
    fechaCorta: '2026-05-12',
    resultado: 'Aprobada',
    operador: 'a.torres',
    detalle: 'Encendido Audio Carga Bluetooth',
    nota: 'Liberada a inspección de calidad.',
  },
  {
    unidad: 'U-2026-01',
    fecha: '2026-05-11 14:20',
    fechaCorta: '2026-05-11',
    resultado: 'Rechazada',
    operador: 'j.dominguez',
    detalle: 'Falla en Audio y Bluetooth',
    nota: 'Distorsión en bocina derecha; enviada a retrabajo.',
  },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  const params = new URLSearchParams(window.location.search);
  let resultado = 'Todos';
  let operador = 'Todos';
  let desde = '2026-05-01';
  let hasta = '2026-05-15';
  let serial = (params.get('unidad') || '').trim();
  let seleccionado = null;

  const chipSupervisor = chip('Supervisor: m.rodriguez ~ Turno 1', 'info');

  function dibujar() {
    const filas = HISTORIAL.filter(r => {
      const okRes = resultado === 'Todos' || r.resultado === resultado;
      const okOp = operador === 'Todos' || r.operador === operador;
      const okDesde = !desde || r.fechaCorta >= desde;
      const okHasta = !hasta || r.fechaCorta <= hasta;
      const okSerial = !serial || r.unidad.toUpperCase().includes(serial.toUpperCase());
      return okRes && okOp && okDesde && okHasta && okSerial;
    });

    contenido.innerHTML = `
      ${encabezado(sesion, 'Historial de pruebas', chipSupervisor)}
      <div class="mt-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${indicador({ titulo: 'TOTAL DE PRUEBAS', valor: RESUMEN_HISTORIAL.total, nota: 'por iniciar prueba', tono: 'marca' })}
          ${indicador({ titulo: 'APROBADAS', valor: RESUMEN_HISTORIAL.aprobadas, nota: 'tomando pruebas', tono: 'exito' })}
          ${indicador({ titulo: 'RECHAZADAS', valor: RESUMEN_HISTORIAL.rechazadas, nota: 'listas para calidad', tono: 'peligro' })}
          ${indicador({ titulo: 'TASA DE APROBACIÓN', valor: RESUMEN_HISTORIAL.tasa, nota: 'enviadas a retrabajo', tono: 'aviso' })}
        </div>

        ${tarjeta('Filtros de búsqueda', `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Resultado</label>
              <select id="h-res" class="campo w-full">
                ${['Todos', 'Aprobada', 'Rechazada'].map(op => `<option value="${esc(op)}" ${resultado === op ? 'selected' : ''}>${esc(op)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Operador</label>
              <select id="h-op" class="campo w-full">
                ${['Todos', 'a.torres', 'j.dominguez'].map(op => `<option value="${esc(op)}" ${operador === op ? 'selected' : ''}>${esc(op)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Desde</label>
              <input id="h-desde" type="date" class="campo w-full" value="${esc(desde)}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Hasta</label>
              <input id="h-hasta" type="date" class="campo w-full" value="${esc(hasta)}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Buscar unidad</label>
              <input id="h-serial" type="text" class="campo w-full" placeholder="Serial..." value="${esc(serial)}">
            </div>
            <div class="flex items-center gap-2">
              ${boton('Limpiar', { tipo: 'validar', id: 'btn-limpiar' })}
              ${boton('Buscar', { tipo: 'confirmar', id: 'btn-buscar' })}
            </div>
          </div>
        `)}

        ${seleccionado ? aviso(
          seleccionado.resultado === 'Aprobada' ? 'exito' : 'peligro',
          `Detalle de ${seleccionado.unidad} (${seleccionado.fecha}): ${seleccionado.detalle} · Evaluó: ${seleccionado.operador} · ${seleccionado.nota}`
        ) : ''}

        ${tarjeta('Historial de unidades evaluadas', tabla({
          columnas: [
            { titulo: 'UNIDAD', campo: 'unidad' },
            { titulo: 'Fecha', campo: 'fecha' },
            {
              titulo: 'Resultado',
              html: (r) => chip(r.resultado, r.resultado === 'Aprobada' ? 'exito' : 'peligro')
            },
            { titulo: 'Operador', campo: 'operador' },
            {
              titulo: 'Detalle de prueba',
              html: (r) => `<span class="text-sm font-semibold ${r.resultado === 'Aprobada' ? 'text-exito' : 'text-peligro'}">${esc(r.detalle)}</span>`
            },
            {
              titulo: 'ACCIONES',
              html: (r) => `
                <div class="flex flex-wrap items-center gap-2">
                  <span data-detalle-unidad="${esc(r.unidad)}">
                    ${boton('Detalle', { tipo: 'validar' })}
                  </span>
                  ${puedeAccionar ? `
                    <a href="registro-de-pruebas-funcionales.html?unidad=${encodeURIComponent(r.unidad)}">
                      ${boton('Repetir', { tipo: 'confirmar' })}
                    </a>
                  ` : ''}
                  <a href="../calidad/historial-de-la-unidad.html?unidad=${encodeURIComponent(r.unidad)}">
                    ${boton('Calidad', { tipo: 'secundario' })}
                  </a>
                </div>
              `
            },
          ],
          filas,
          vacio: 'No se encontraron pruebas registradas con esos criterios',
        }))}
      </div>
    `;

    contenido.querySelector('#btn-buscar')?.addEventListener('click', () => {
      resultado = contenido.querySelector('#h-res').value;
      operador = contenido.querySelector('#h-op').value;
      desde = contenido.querySelector('#h-desde').value;
      hasta = contenido.querySelector('#h-hasta').value;
      serial = contenido.querySelector('#h-serial').value.trim();
      dibujar();
    });

    contenido.querySelector('#btn-limpiar')?.addEventListener('click', () => {
      resultado = 'Todos';
      operador = 'Todos';
      desde = '2026-05-01';
      hasta = '2026-05-15';
      serial = '';
      seleccionado = null;
      dibujar();
    });

    contenido.querySelectorAll('[data-detalle-unidad]').forEach(contenedorBtn => {
      contenedorBtn.addEventListener('click', () => {
        const u = contenedorBtn.getAttribute('data-detalle-unidad');
        seleccionado = HISTORIAL.find(item => item.unidad === u) || null;
        dibujar();
      });
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
