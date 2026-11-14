// Pantalla: Producción · Solicitar ajuste.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, tabla, boton, chip, aviso, preguntar, marcarError } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('produccion/solicitar-ajuste');

const HISTORIAL_AJUSTES = [
  {
    folio: 'AJ-101',
    quien: '2001 · Líder de línea',
    cuando: '2026-05-12 11:20',
    cambio: 'OP-2026-101 · Cantidad: 94 → 96',
    motivo: 'Dos unidades escaneadas fuera de lote al inicio del turno',
    estado: 'Pendiente autorización',
  },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  let ajustes = [...HISTORIAL_AJUSTES];
  let alerta = '';

  function dibujar() {
    contenido.innerHTML = `
      ${encabezado(sesion, 'Solicitar ajuste')}
      <div class="mt-4 space-y-4">
        ${aviso('info', 'Regla de auditoría: toda corrección guarda quién, cuándo, qué cambió y por qué.')}
        ${alerta ? aviso('exito', alerta) : ''}

        ${tarjeta('Capturar solicitud de corrección', `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Orden *</label>
              <select id="aj-orden" class="campo w-full" ${!puedeAccionar ? 'disabled' : ''}>
                <option value="OP-2026-101">OP-2026-101 (MINI)</option>
                <option value="OP-2026-102">OP-2026-102 (SPORT)</option>
                <option value="OP-2026-103">OP-2026-103 (PRO)</option>
                <option value="OP-2026-104">OP-2026-104 (MAX)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Valor anterior *</label>
              <input id="aj-ant" type="text" class="campo w-full" placeholder="Ej. 94" ${!puedeAccionar ? 'readonly' : ''}>
            </div>
            <div>
              <label class="block text-xs font-semibold text-suave mb-1">Valor corregido *</label>
              <input id="aj-nvo" type="text" class="campo w-full" placeholder="Ej. 96" ${!puedeAccionar ? 'readonly' : ''}>
            </div>
          </div>
        `, {
          acciones: puedeAccionar ? boton('Solicitar corrección', { tipo: 'validar', id: 'btn-solicitar-aj' }) : ''
        })}

        ${tarjeta('Auditoría de ajustes solicitados', tabla({
          columnas: [
            { titulo: 'Folio', campo: 'folio' },
            { titulo: 'Quién', campo: 'quien' },
            { titulo: 'Cuándo', campo: 'cuando' },
            { titulo: 'Qué cambió', campo: 'cambio' },
            { titulo: 'Por qué (Motivo)', campo: 'motivo' },
            { titulo: 'Estado', html: (a) => chip(a.estado, 'aviso') },
          ],
          filas: ajustes,
          vacio: 'Sin solicitudes de ajuste en el turno',
        }))}
      </div>
    `;

    contenido.querySelector('#btn-solicitar-aj')?.addEventListener('click', async () => {
      const inpAnt = contenido.querySelector('#aj-ant');
      const inpNvo = contenido.querySelector('#aj-nvo');
      const ant = (inpAnt?.value || '').trim();
      const nvo = (inpNvo?.value || '').trim();

      if (!ant || !nvo) {
        try { marcarError(inpNvo, 'Indica el valor anterior y el nuevo valor'); } catch (_) {}
        return;
      }

      const respuesta = await preguntar({
        titulo: 'Confirmar solicitud de ajuste',
        mensaje: 'Indica el motivo obligatorio para el registro de auditoría.',
        motivo: { etiqueta: 'Motivo', requerido: true },
      });

      if (!respuesta) return;
      const motivoTexto = typeof respuesta === 'object' && respuesta.motivo
        ? respuesta.motivo
        : String(respuesta);

      const folio = `AJ-${101 + ajustes.length}`;
      const orden = contenido.querySelector('#aj-orden').value;
      ajustes.unshift({
        folio,
        quien: sesion?.usuario?.nombre || '2001 · Líder de línea',
        cuando: new Date().toLocaleString('es-MX'),
        cambio: `${esc(orden)} · Cantidad: ${esc(ant)} → ${esc(nvo)}`,
        motivo: motivoTexto,
        estado: 'Pendiente autorización',
      });
      alerta = `Solicitud ${folio} enviada a supervisión.`;
      dibujar();
    });
  }

  dibujar();
}

if (pagina) iniciar(pagina);
