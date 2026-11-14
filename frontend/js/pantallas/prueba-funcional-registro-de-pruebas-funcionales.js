// Pantalla: Prueba funcional · Registro de pruebas funcionales.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, boton, chip, aviso, marcarError } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('prueba-funcional/registro-de-pruebas-funcionales');

const PRUEBAS_FUNCIONALES = [
  { id: 'encendido', nombre: 'Encendido', detalle: 'La unidad enciende', estado: null },
  { id: 'audio', nombre: 'Audio', detalle: 'Sin distorsión, volumen adecuado', estado: null },
  { id: 'carga', nombre: 'Carga', detalle: 'La unidad carga correctamente', estado: null },
  { id: 'bluetooth', nombre: 'Bluetooth', detalle: 'Emparejamiento y transmisión', estado: null },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  const params = new URLSearchParams(window.location.search);
  const unidadActiva = (params.get('unidad') || 'U-2026-04').trim().toUpperCase();
  const operadorChip = chip(`Operador: ${sesion?.usuario?.nombre || 'a.torres'}`, 'info');

  let pruebas = PRUEBAS_FUNCIONALES.map(p => ({ ...p }));
  let observaciones = '';
  let alerta = null;

  function resumenPruebas() {
    const total = pruebas.length;
    const contestadas = pruebas.filter(p => p.estado !== null).length;
    const fallas = pruebas.filter(p => p.estado === 'FALLA').length;
    const faltantes = total - contestadas;
    return { total, contestadas, fallas, faltantes };
  }

  function dibujar() {
    const { total, contestadas, fallas, faltantes } = resumenPruebas();
    const pasoActivo = faltantes === 0 ? 3 : 2;

    let tituloResultado = 'Pruebas pendientes';
    let detalleResultado = `Faltan ${faltantes} prueba${faltantes === 1 ? '' : 's'}`;
    let claseResultado = 'text-peligro font-bold';

    if (faltantes === 0) {
      if (fallas === 0) {
        tituloResultado = 'Unidad aprobada';
        detalleResultado = '4/4 pruebas aprobadas · Lista para Calidad';
        claseResultado = 'text-exito font-bold';
      } else {
        tituloResultado = 'Unidad rechazada';
        detalleResultado = `${fallas} falla${fallas === 1 ? '' : 's'} detectada${fallas === 1 ? '' : 's'} · Enviar a retrabajo`;
        claseResultado = 'text-peligro font-bold';
      }
    }

    const filasPruebas = pruebas.map(p => `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-borde bg-fondo">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span class="font-bold text-texto w-28">${esc(p.nombre)}</span>
          <span class="text-sm text-marca">${esc(p.detalle)}</span>
        </div>
        <div class="flex items-center gap-5">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="prueba-${esc(p.id)}"
              data-id="${esc(p.id)}"
              data-estado="APROBADO"
              class="w-4 h-4 accent-exito"
              ${p.estado === 'APROBADO' ? 'checked' : ''}
              ${!puedeAccionar ? 'disabled' : ''}
            >
            ${chip('Aprobado', p.estado === 'APROBADO' ? 'exito' : 'info')}
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="prueba-${esc(p.id)}"
              data-id="${esc(p.id)}"
              data-estado="FALLA"
              class="w-4 h-4 accent-peligro"
              ${p.estado === 'FALLA' ? 'checked' : ''}
              ${!puedeAccionar ? 'disabled' : ''}
            >
            ${chip('Falla', p.estado === 'FALLA' ? 'peligro' : 'aviso')}
          </label>
        </div>
      </div>
    `).join('');

    contenido.innerHTML = `
      ${encabezado(sesion, 'Registro de pruebas funcionales', operadorChip)}
      <div class="mt-4 space-y-4">
        ${tarjeta('', `
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-8">
              <a href="escanear-pieza-o-lote.html?unidad=${encodeURIComponent(unidadActiva)}" class="flex items-center gap-3 text-suave">
                <span class="w-5 h-5 rounded-full border border-borde bg-white inline-block"></span>
                <span>Escanear</span>
              </a>
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 rounded-full border ${pasoActivo === 2 ? 'bg-exito border-marca-osc' : 'bg-white border-borde'} inline-block"></span>
                <span class="${pasoActivo === 2 ? 'font-bold text-marca-osc' : 'text-suave'}">Registrar pruebas</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="w-5 h-5 rounded-full border ${pasoActivo === 3 ? 'bg-exito border-marca-osc' : 'bg-white border-borde'} inline-block"></span>
                <span class="${pasoActivo === 3 ? 'font-bold text-marca-osc' : 'text-suave'}">Resultado</span>
              </div>
            </div>
            ${chip(`Unidad: ${unidadActiva}`, 'info')}
          </div>
        `)}

        ${alerta ? aviso(alerta.tipo, alerta.texto) : ''}

        ${tarjeta('Pruebas Funcionales', `
          <div class="space-y-3">
            ${filasPruebas}
          </div>
        `, { acciones: chip(`${contestadas}/${total}`, contestadas === total ? 'exito' : 'aviso') })}

        ${tarjeta('Observaciones', `
          <textarea
            id="obs-operador"
            rows="2"
            class="campo w-full"
            placeholder="Comentarios del operador"
            ${!puedeAccionar ? 'readonly' : ''}
          >${esc(observaciones)}</textarea>
        `)}

        ${tarjeta('Resultado', `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-borde bg-fondo gap-2">
            <span class="font-semibold text-texto">${esc(tituloResultado)}</span>
            <span class="${claseResultado}">${esc(detalleResultado)}</span>
          </div>
        `, {
          acciones: puedeAccionar ? `
            <div class="flex flex-wrap items-center gap-2">
              ${boton('Guardar resultado', { tipo: 'principal', id: 'btn-guardar' })}
              ${boton('Rechazar', { tipo: 'peligro', id: 'btn-rechazar' })}
              ${boton('Aprobar', { tipo: 'confirmar', id: 'btn-aprobar' })}
              ${boton('Exportar a calidad', { tipo: 'validar', id: 'btn-calidad' })}
            </div>
          ` : ''
        })}
      </div>
    `;

    const obsEl = contenido.querySelector('#obs-operador');
    if (obsEl) {
      obsEl.addEventListener('input', (e) => {
        observaciones = e.target.value;
      });
    }

    contenido.querySelectorAll('input[type="radio"][data-id]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        const estado = e.target.getAttribute('data-estado');
        const item = pruebas.find(x => x.id === id);
        if (item) item.estado = estado;
        alerta = null;
        dibujar();
      });
    });

    contenido.querySelector('#btn-guardar')?.addEventListener('click', () => {
      const { faltantes, fallas } = resumenPruebas();
      if (faltantes > 0) {
        alerta = { tipo: 'aviso', texto: `Debes evaluar las 4 pruebas antes de cerrar. Faltan ${faltantes}.` };
      } else if (fallas > 0) {
        alerta = { tipo: 'peligro', texto: `Resultado guardado: unidad ${unidadActiva} con ${fallas} falla(s).` };
      } else {
        alerta = { tipo: 'exito', texto: `Resultado guardado correctamente para la unidad ${unidadActiva}.` };
      }
      dibujar();
    });

    contenido.querySelector('#btn-rechazar')?.addEventListener('click', () => {
      if (pruebas.every(p => p.estado !== 'FALLA')) {
        pruebas[0].estado = 'FALLA';
      }
      if (!observaciones.trim()) {
        alerta = { tipo: 'peligro', texto: 'Escribe en Observaciones el motivo de la falla para rechazar la unidad.' };
        dibujar();
        try { marcarError(contenido.querySelector('#obs-operador'), 'Motivo obligatorio al rechazar'); } catch (_) {}
        return;
      }
      alerta = { tipo: 'peligro', texto: `Unidad ${unidadActiva} rechazada y enviada a retrabajo.` };
      dibujar();
    });

    contenido.querySelector('#btn-aprobar')?.addEventListener('click', () => {
      pruebas.forEach(p => { p.estado = 'APROBADO'; });
      alerta = { tipo: 'exito', texto: `Unidad ${unidadActiva} aprobada en las 4 pruebas funcionales.` };
      dibujar();
    });

    contenido.querySelector('#btn-calidad')?.addEventListener('click', () => {
      const { faltantes, fallas } = resumenPruebas();
      if (faltantes > 0 || fallas > 0) {
        alerta = { tipo: 'aviso', texto: 'Solo una unidad con las 4 pruebas aprobadas puede enviarse a Calidad.' };
      } else {
        alerta = { tipo: 'exito', texto: `Unidad ${unidadActiva} enviada al área de Calidad exitosamente.` };
      }
      dibujar();
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
