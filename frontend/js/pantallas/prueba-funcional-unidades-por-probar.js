// Pantalla: Prueba funcional · Unidades por probar.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, indicador, tabla, boton, chip } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('prueba-funcional/unidades-por-probar');

const INDICADORES_COLA = {
  pendientes: 8,
  enProceso: 2,
  aprobadasHoy: 1,
  rechazadasHoy: 1,
};

const UNIDADES_EN_COLA = [
  { unidad: 'U-2026-04', lote: 'L-2026-05-A', modelo: 'MINI', recepcion: '2026-05-12 06:15', tiempoCola: '7H 30M', estado: 'Pendiente' },
  { unidad: 'U-2026-05', lote: 'L-2026-05-A', modelo: 'MINI', recepcion: '2026-05-12 06:18', tiempoCola: '7H 27M', estado: 'Pendiente' },
  { unidad: 'U-2026-08', lote: 'L-2026-05-B', modelo: 'SPORT', recepcion: '2026-05-12 07:10', tiempoCola: '6H 35M', estado: 'En proceso' },
  { unidad: 'U-2026-12', lote: 'L-2026-05-C', modelo: 'PRO', recepcion: '2026-05-12 08:00', tiempoCola: '5H 45M', estado: 'Pendiente' },
  { unidad: 'U-2026-15', lote: 'L-2026-05-D', modelo: 'MAX', recepcion: '2026-05-12 08:30', tiempoCola: '5H 15M', estado: 'En proceso' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let estado = 'Todos';
  let modelo = 'Todos';
  let lote = 'Todos';
  let serial = '';

  const infoArea = chip('Área: Pruebas funcionales ~ Turno 1', 'info');

  function dibujar() {
    const filas = UNIDADES_EN_COLA.filter(u => {
      const okEstado = estado === 'Todos' || u.estado === estado;
      const okModelo = modelo === 'Todos' || u.modelo === modelo;
      const okLote = lote === 'Todos' || u.lote === lote;
      const okSerial = !serial || u.unidad.toUpperCase().includes(serial.toUpperCase());
      return okEstado && okModelo && okLote && okSerial;
    });

    contenido.innerHTML = `
      ${encabezado(sesion, 'Unidades por probar', infoArea)}
      <div class="mt-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${indicador({ titulo: 'PENDIENTES', valor: INDICADORES_COLA.pendientes, nota: 'por iniciar prueba', tono: 'aviso' })}
          ${indicador({ titulo: 'EN PROCESO', valor: INDICADORES_COLA.enProceso, nota: 'tomando pruebas', tono: 'marca' })}
          ${indicador({ titulo: 'APROBADAS HOY', valor: INDICADORES_COLA.aprobadasHoy, nota: 'listas para calidad', tono: 'exito' })}
          ${indicador({ titulo: 'RECHAZADAS HOY', valor: INDICADORES_COLA.rechazadasHoy, nota: 'enviadas a retrabajo', tono: 'peligro' })}
        </div>

        ${tarjeta('Filtros', `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Estado</label>
              <select id="f-estado" class="campo w-full">
                ${['Todos', 'Pendiente', 'En proceso'].map(op => `<option value="${esc(op)}" ${estado === op ? 'selected' : ''}>${esc(op)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Modelo</label>
              <select id="f-modelo" class="campo w-full">
                ${['Todos', 'MINI', 'SPORT', 'PRO', 'MAX'].map(op => `<option value="${esc(op)}" ${modelo === op ? 'selected' : ''}>${esc(op)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Lote</label>
              <select id="f-lote" class="campo w-full">
                ${['Todos', 'L-2026-05-A', 'L-2026-05-B', 'L-2026-05-C', 'L-2026-05-D'].map(op => `<option value="${esc(op)}" ${lote === op ? 'selected' : ''}>${esc(op)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Buscar unidad</label>
              <input id="f-serial" type="text" class="campo w-full" placeholder="Serial..." value="${esc(serial)}">
            </div>
          </div>
        `)}

        ${tarjeta('Unidades en cola', tabla({
          columnas: [
            { titulo: 'UNIDAD', campo: 'unidad' },
            { titulo: 'LOTE', campo: 'lote' },
            { titulo: 'MODELO', campo: 'modelo' },
            { titulo: 'HORA DE RECEPCIÓN', campo: 'recepcion' },
            { titulo: 'TIEMPO EN COLA', campo: 'tiempoCola' },
            {
              titulo: 'ESTADO',
              html: (u) => chip(u.estado, u.estado === 'Pendiente' ? 'aviso' : 'info')
            },
            {
              titulo: 'ACCIONES',
              html: (u) => `
                <div class="flex flex-wrap items-center gap-2">
                  ${puedeAccionar ? `
                    <a href="registro-de-pruebas-funcionales.html?unidad=${encodeURIComponent(u.unidad)}">
                      ${boton('Iniciar prueba', { tipo: 'confirmar' })}
                    </a>
                  ` : ''}
                  <a href="historial-de-pruebas.html?unidad=${encodeURIComponent(u.unidad)}">
                    ${boton('Historial', { tipo: 'secundario' })}
                  </a>
                </div>
              `
            },
          ],
          filas,
          vacio: 'No hay unidades por probar con los filtros seleccionados',
        }))}
      </div>
    `;

    contenido.querySelector('#f-estado')?.addEventListener('change', (e) => { estado = e.target.value; dibujar(); });
    contenido.querySelector('#f-modelo')?.addEventListener('change', (e) => { modelo = e.target.value; dibujar(); });
    contenido.querySelector('#f-lote')?.addEventListener('change', (e) => { lote = e.target.value; dibujar(); });
    contenido.querySelector('#f-serial')?.addEventListener('input', (e) => {
      serial = e.target.value;
      dibujar();
      const inp = contenido.querySelector('#f-serial');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
