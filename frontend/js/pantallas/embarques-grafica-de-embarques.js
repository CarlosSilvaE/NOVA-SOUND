import { montarPagina } from '../layout.js';
import { encabezado, indicador, tarjeta, barra, tabla, chip } from '../componentes.js';
import { esc, num, pctDe } from '../ui.js';

const pagina = montarPagina('embarques/grafica-de-embarques');

const EMBARQUES_POR_CLIENTE = [
  { cliente: 'Cadena Centro', embarques: 18, cajas: 112 },
  { cliente: 'Audio Norte', embarques: 14, cajas: 84 },
  { cliente: 'Distribuidor Metro', embarques: 11, cajas: 68 },
  { cliente: 'Sonido del Bajío', embarques: 9, cajas: 54 },
];

const EMBARQUES_SEMANA = [
  { dia: 'Lunes', despachados: 8 },
  { dia: 'Martes', despachados: 10 },
  { dia: 'Miércoles', despachados: 9 },
  { dia: 'Jueves', despachados: 12 },
  { dia: 'Viernes', despachados: 13 },
];

function iniciar({ sesion, contenido }) {
  const maxCliente = Math.max(...EMBARQUES_POR_CLIENTE.map((c) => c.cajas), 1);
  const maxDia = Math.max(...EMBARQUES_SEMANA.map((d) => d.despachados), 1);

  const graficaClientes = `
    <div class="space-y-3">
      ${EMBARQUES_POR_CLIENTE.map(
        (c) => `
        <div class="grid grid-cols-[140px_1fr_80px] items-center gap-3 text-sm">
          <span class="font-medium text-suave truncate">${esc(c.cliente)}</span>
          <div>${barra(pctDe(c.cajas, maxCliente), 'marca')}</div>
          <span class="text-right font-semibold tabular-nums">${num(c.cajas)} cajas</span>
        </div>`
      ).join('')}
    </div>`;

  const graficaSemanal = `
    <div class="space-y-3">
      ${EMBARQUES_SEMANA.map(
        (d) => `
        <div class="grid grid-cols-[90px_1fr_95px] items-center gap-3 text-sm">
          <span class="font-medium text-suave">${esc(d.dia)}</span>
          <div>${barra(pctDe(d.despachados, maxDia), 'exito')}</div>
          <span class="text-right font-semibold tabular-nums">${num(d.despachados)} emb.</span>
        </div>`
      ).join('')}
    </div>`;

  contenido.innerHTML = `
    ${encabezado(sesion, 'Gráfica de embarques')}

    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      ${indicador({ titulo: 'Embarques del mes', valor: '52', nota: '+14% vs mes anterior', tono: 'exito' })}
      ${indicador({ titulo: 'Cajas despachadas', valor: '318', nota: '100% verificadas en salida', tono: 'marca' })}
      ${indicador({ titulo: 'Cumplimiento a tiempo', valor: '98.1%', nota: 'Ventana de entrega', tono: 'info' })}
      ${indicador({ titulo: 'Incidencias en ruta', valor: '0', nota: 'Sin rechazos de cliente', tono: 'exito' })}
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      ${tarjeta('Volumen de cajas despachadas por cliente', graficaClientes)}
      ${tarjeta('Embarques despachados por día (semana actual)', graficaSemanal)}
    </div>

    <div class="mt-4">
      ${tarjeta(
        'Resumen consolidado por cliente',
        tabla({
          filas: EMBARQUES_POR_CLIENTE,
          vacio: 'Sin datos disponibles',
          columnas: [
            { titulo: 'Cliente', campo: 'cliente' },
            { titulo: 'Embarques', num: true, texto: (c) => num(c.embarques) },
            { titulo: 'Cajas enviadas', num: true, texto: (c) => num(c.cajas) },
            { titulo: 'Estatus comercial', html: () => chip('Activo', 'exito') },
          ],
        }),
        { relleno: false }
      )}
    </div>`;
}

if (pagina) iniciar(pagina);