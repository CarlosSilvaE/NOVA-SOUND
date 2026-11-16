import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  boton,
  barra,
  chip,
  aviso,
  mostrarAviso,
} from '../componentes.js';
import { esc, pctDe } from '../ui.js';
import { CAPACIDAD_POR_MODELO, abrirResumenDeCierre } from './empaque-comun.js';

const pagina = montarPagina('empaque/confirmar-cierre-de-caja');

const CAJAS_PENDIENTES_CIERRE = [
  {
    id: 'CX01-A',
    orden: 'ORD-2026-A1',
    cliente: 'Cadena Centro',
    modelo: 'SPORT',
    unidades: 8,
    estado: 'Empacando',
  },
  {
    id: 'CX03-C',
    orden: 'ORD-2026-C3',
    cliente: 'Sonido del Bajío',
    modelo: 'MINI',
    unidades: 5,
    estado: 'Empacando',
  },
  {
    id: 'CX05-B',
    orden: 'ORD-2026-B2',
    cliente: 'Audio Norte',
    modelo: 'PRO',
    unidades: 6,
    estado: 'Empacando',
  },
];

function iniciar({ sesion, contenido, puedeAccionar, puede }) {
  const puedeCerrar = puedeAccionar && puede('cerrar-caja');

  contenido.innerHTML = `
    ${encabezado(sesion, 'Confirmar cierre de caja')}
    ${puedeCerrar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar esta pantalla.')}</div>`}

    <div class="mt-4">
      ${tarjeta('Cajas pendientes de cierre', '<div id="zona-cajas"></div>', { relleno: false })}
    </div>`;

  function pintar() {
    document.getElementById('zona-cajas').innerHTML = tabla({
      filas: CAJAS_PENDIENTES_CIERRE,
      vacio: 'No hay cajas pendientes de cierre',
      detalleVacio: 'Todas las cajas en estación ya fueron cerradas.',
      columnas: [
        { titulo: 'Caja', html: (c) => `<strong class="tabular-nums text-marca-osc">${esc(c.id)}</strong>` },
        { titulo: 'Orden', campo: 'orden' },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        {
          titulo: 'Llenado',
          html: (c) => {
            const cap = CAPACIDAD_POR_MODELO[c.modelo] || 6;
            const pct = pctDe(c.unidades, cap);
            return `
              <div class="min-w-[130px] space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="font-semibold">${c.unidades} de ${cap}</span>
                  <span class="text-suave">${pct}%</span>
                </div>
                ${barra(pct, c.estado === 'Cerrada' ? 'exito' : 'marca')}
              </div>`;
          },
        },
        {
          titulo: 'Estado',
          html: (c) => chip(c.estado, c.estado === 'Cerrada' ? 'exito' : 'aviso'),
        },
        {
          titulo: 'Acción',
          num: true,
          html: (c) => {
            if (c.estado === 'Cerrada') return '<span class="text-xs text-suave">Cerrada</span>';
            if (!puedeCerrar) return '<span class="text-xs text-suave">Sin permiso</span>';
            return boton('Confirmar cierre', { tipo: 'confirmar', extra: `data-cerrar="${esc(c.id)}"` });
          },
        },
      ],
    });
  }

  contenido.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cerrar]');
    if (!btn || !puedeCerrar) return;

    const caja = CAJAS_PENDIENTES_CIERRE.find((c) => c.id === btn.dataset.cerrar);
    if (!caja) return;

    const cap = CAPACIDAD_POR_MODELO[caja.modelo] || 6;

    abrirResumenDeCierre({
      idCaja: caja.id,
      orden: caja.orden,
      cliente: caja.cliente,
      modelo: caja.modelo,
      cantidad: caja.unidades,
      capacidad: cap,
      onConfirmar: () => {
        caja.estado = 'Cerrada';
        mostrarAviso(`Caja ${caja.id} cerrada con ${caja.unidades} unidades. Quedó registrado ${sesion.usuario.nombre}.`);
        pintar();
      },
    });
  });

  pintar();
}

if (pagina) iniciar(pagina);