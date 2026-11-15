import { montarPagina } from '../layout.js';
import {
  encabezado,
  tarjeta,
  tabla,
  campo,
  boton,
  chip,
  aviso,
  marcarError,
  mostrarAviso,
} from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('embarques/cierre-de-caja-escaneo');

const CAJAS_ESCANEO = [
  { id: 'CX01-A', cliente: 'Cadena Centro', modelo: 'SPORT', piezas: 8, sello: 'Por escanear' },
  { id: 'CX02-A', cliente: 'Cadena Centro', modelo: 'SPORT', piezas: 8, sello: 'Escaneada' },
  { id: 'CX03-C', cliente: 'Sonido del Bajío', modelo: 'MINI', piezas: 12, sello: 'Por escanear' },
  { id: 'CX04-D', cliente: 'Distribuidor Metro', modelo: 'MAX', piezas: 4, sello: 'Por escanear' },
];

function iniciar({ sesion, contenido, puedeAccionar }) {
  const bitacora = [];

  contenido.innerHTML = `
    ${encabezado(sesion, 'Cierre de caja (escaneo)')}
    ${puedeAccionar ? '' : `<div class="mt-4">${aviso('info', 'Tu rol solo puede consultar el registro de escaneo.')}</div>`}

    ${
      puedeAccionar
        ? `<form id="form-escanear" class="tarjeta mt-4 flex flex-wrap items-end gap-3 p-4" novalidate>
            ${campo({
              id: 'codigo-escaneo',
              etiqueta: 'Escanear etiqueta de caja',
              placeholder: 'Ej. CX01-A',
              extra: 'autocomplete="off"',
              clase: 'w-72',
            })}
            ${boton('Registrar escaneo', { enviar: true })}
          </form>`
        : ''
    }

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      ${tarjeta('Cajas en cola de escaneo', '<div id="tabla-cola"></div>', { relleno: false })}
      ${tarjeta('Bitácora de lecturas de turno', '<div id="tabla-bitacora"></div>', { relleno: false })}
    </div>`;

  function pintar() {
    document.getElementById('tabla-cola').innerHTML = tabla({
      filas: CAJAS_ESCANEO,
      vacio: 'No hay cajas en cola',
      columnas: [
        { titulo: 'Caja', html: (c) => `<strong class="tabular-nums text-marca-osc">${esc(c.id)}</strong>` },
        { titulo: 'Cliente', campo: 'cliente' },
        { titulo: 'Modelo', campo: 'modelo' },
        { titulo: 'Piezas', num: true, texto: (c) => String(c.piezas) },
        {
          titulo: 'Estado',
          html: (c) => chip(c.sello, c.sello === 'Escaneada' ? 'exito' : 'aviso'),
        },
      ],
    });

    document.getElementById('tabla-bitacora').innerHTML = tabla({
      filas: bitacora,
      vacio: 'Aún no se han escaneado cajas en esta sesión',
      detalleVacio: 'Escanea un código de caja para validar su etiqueta de embarque.',
      columnas: [
        { titulo: 'Hora', campo: 'hora' },
        { titulo: 'Caja', html: (b) => `<strong class="tabular-nums">${esc(b.caja)}</strong>` },
        { titulo: 'Operador', campo: 'operador' },
        { titulo: 'Resultado', html: (b) => chip(b.resultado, 'exito') },
      ],
    });
  }

  document.getElementById('codigo-escaneo')?.addEventListener('input', () => marcarError('codigo-escaneo', ''));

  document.getElementById('form-escanear')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const codigo = document.getElementById('codigo-escaneo').value.trim().toUpperCase();
    marcarError('codigo-escaneo', codigo ? '' : 'Escanea o escribe el código de la caja.');
    if (!codigo) return;

    const caja = CAJAS_ESCANEO.find((c) => c.id === codigo);
    if (!caja) {
      marcarError('codigo-escaneo', `La caja «${codigo}» no está en la cola de embarques.`);
      return;
    }
    if (caja.sello === 'Escaneada') {
      mostrarAviso(`La caja ${codigo} ya había sido escaneada.`, 'aviso');
      document.getElementById('codigo-escaneo').value = '';
      return;
    }

    caja.sello = 'Escaneada';
    bitacora.unshift({
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      caja: caja.id,
      operador: sesion.usuario.nombre,
      resultado: 'Etiqueta válida',
    });

    document.getElementById('codigo-escaneo').value = '';
    mostrarAviso(`Caja ${caja.id} escaneada y lista para confirmación de cierre.`, 'exito');
    pintar();
  });

  pintar();
}

if (pagina) iniciar(pagina);