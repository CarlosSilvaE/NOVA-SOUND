import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  boton,
  chip,
  aviso,
  preguntar,
  mostrarAviso,
} from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('embarques/confirmacion-de-cierre-de-caja');

const CAJAS_SELLADO = [
  { id: 'CX02-A', embarque: 'EMB-2026-101', cliente: 'Cadena Centro', modelo: 'SPORT', piezas: 8, estado: 'Escaneada' },
  { id: 'CX06-A', embarque: 'EMB-2026-101', cliente: 'Cadena Centro', modelo: 'PRO', piezas: 6, estado: 'Escaneada' },
  { id: 'CX02-B', embarque: 'EMB-2026-102', cliente: 'Audio Norte', modelo: 'PRO', piezas: 6, estado: 'Confirmada' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  contenido.innerHTML = `
    ${encabezado(sesion, 'Confirmación de cierre de caja')}
    ${puedeAccionar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar esta pantalla.')}</div>`}

    <div class="mt-4">
      ${tarjeta('Cajas escaneadas listas para confirmación de sellado', '<div id="zona-sellado"></div>', { relleno: false })}
    </div>`;

  function pintar() {
    document.getElementById('zona-sellado').innerHTML = tabla({
      filas: CAJAS_SELLADO,
      vacio: 'No hay cajas pendientes de confirmación',
      columnas: [
        { titulo: 'Caja', html: (c) => `<strong class="tabular-nums text-marca-osc">${esc(c.id)}</strong>` },
        { titulo: 'Embarque', campo: 'embarque' },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        { titulo: 'Piezas', num: true, texto: (c) => String(c.piezas) },
        {
          titulo: 'Estado',
          html: (c) => chip(c.estado, c.estado === 'Confirmada' ? 'exito' : 'info'),
        },
        {
          titulo: 'Acción',
          num: true,
          html: (c) => {
            if (c.estado === 'Confirmada') return '<span class="text-xs text-suave">Sellada y confirmada</span>';
            if (!puedeAccionar) return '<span class="text-xs text-suave">—</span>';
            return boton('Confirmar sellado', { tipo: 'confirmar', extra: `data-confirmar="${esc(c.id)}"` });
          },
        },
      ],
    });
  }

  contenido.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-confirmar]');
    if (!btn || !puedeAccionar) return;

    const caja = CAJAS_SELLADO.find((c) => c.id === btn.dataset.confirmar);
    if (!caja) return;

    const ok = await preguntar({
      titulo: `Confirmar sellado de ${caja.id}`,
      mensaje: `Se confirmará el cierre definitivo de la caja ${caja.id} (${caja.piezas} piezas) para el embarque ${caja.embarque}.`,
      textoOk: 'Confirmar sellado',
      tipoOk: 'confirmar',
    });
    if (!ok) return;

    caja.estado = 'Confirmada';
    mostrarAviso(`Caja ${caja.id} confirmada y sellada por ${sesion.usuario.nombre}.`, 'exito');
    pintar();
  });

  pintar();
}

if (pagina) iniciar(pagina);