// Pantalla: Prueba funcional · Escanear pieza o lote.
import { montarPagina } from '../layout.js';
import { encabezado, tarjeta, tabla, boton, chip, chipUnidad, aviso, marcarError } from '../componentes.js';
import { esc } from '../ui.js';

const pagina = montarPagina('prueba-funcional/escanear-pieza-o-lote');

const CATALOGO_ESCANEABLE = [
  {
    codigo: 'U-2026-04',
    tipo: 'UNIDAD',
    lote: 'L-2026-05-A',
    modelo: 'MINI',
    color: 'Negro',
    linea: 'Línea 1',
    recepcion: '2026-05-12 06:15',
    estado: 'PROBADA',
    unidades: [
      { serie: 'U-2026-04', lote: 'L-2026-05-A', modelo: 'MINI', linea: 'Línea 1', recepcion: '2026-05-12 06:15', estado: 'PROBADA' },
    ],
  },
  {
    codigo: 'NS-0001',
    tipo: 'UNIDAD',
    lote: 'L-2026-05-B',
    modelo: 'PRO',
    color: 'Negro',
    linea: 'Línea 2',
    recepcion: '2026-05-12 06:40',
    estado: 'LIBERADA',
    unidades: [
      { serie: 'NS-0001', lote: 'L-2026-05-B', modelo: 'PRO', linea: 'Línea 2', recepcion: '2026-05-12 06:40', estado: 'LIBERADA' },
    ],
  },
  {
    codigo: 'L-2026-05-A',
    tipo: 'LOTE',
    lote: 'L-2026-05-A',
    modelo: 'MINI',
    color: 'Negro',
    linea: 'Línea 1',
    recepcion: '2026-05-12 06:10',
    estado: 'PROBADA',
    unidades: [
      { serie: 'U-2026-04', lote: 'L-2026-05-A', modelo: 'MINI', linea: 'Línea 1', recepcion: '2026-05-12 06:15', estado: 'PROBADA' },
      { serie: 'U-2026-05', lote: 'L-2026-05-A', modelo: 'MINI', linea: 'Línea 1', recepcion: '2026-05-12 06:18', estado: 'PROBADA' },
    ],
  },
];

function renderPasos(pasoActivo) {
  const pasos = [
    { num: 1, texto: 'Escanear' },
    { num: 2, texto: 'Registrar pruebas' },
    { num: 3, texto: 'Resultado' },
  ];
  return tarjeta('', `
    <div class="flex flex-wrap items-center gap-8">
      ${pasos.map(p => `
        <div class="flex items-center gap-3">
          <span class="w-5 h-5 rounded-full border ${p.num === pasoActivo ? 'bg-exito border-marca-osc' : 'bg-white border-borde'} inline-block"></span>
          <span class="${p.num === pasoActivo ? 'font-bold text-marca-osc' : 'text-suave'}">${esc(p.texto)}</span>
        </div>
      `).join('')}
    </div>
  `);
}

function iniciar({ sesion, contenido, puedeAccionar }) {
  const params = new URLSearchParams(window.location.search);
  const inicial = (params.get('unidad') || '').trim().toUpperCase();

  let cargado = inicial ? (CATALOGO_ESCANEABLE.find(x => x.codigo === inicial) || null) : null;
  let mensaje = '';
  let errorTexto = '';

  const operadorChip = chip(`Operador: ${sesion?.usuario?.nombre || 'a.torres'} ~ Turno 1`, 'info');

  function ejecutarBusqueda(valorCrudo) {
    const codigo = (valorCrudo || '').trim().toUpperCase();
    mensaje = '';
    errorTexto = '';

    if (!codigo) {
      errorTexto = 'Escanea o escribe un número de serie o lote obligatorio (ejemplo: U-2026-04).';
      return false;
    }

    const existe = CATALOGO_ESCANEABLE.find(x => x.codigo === codigo);
    if (existe) {
      cargado = existe;
    } else {
      const esLote = codigo.startsWith('L-');
      cargado = {
        codigo,
        tipo: esLote ? 'LOTE' : 'UNIDAD',
        lote: esLote ? codigo : 'L-2026-05-A',
        modelo: 'MINI',
        color: 'Negro',
        linea: 'Línea 1',
        recepcion: '2026-05-12 06:30',
        estado: 'PROBADA',
        unidades: [
          { serie: esLote ? 'U-2026-04' : codigo, lote: esLote ? codigo : 'L-2026-05-A', modelo: 'MINI', linea: 'Línea 1', recepcion: '2026-05-12 06:30', estado: 'PROBADA' },
        ],
      };
    }
    mensaje = `${cargado.tipo === 'LOTE' ? 'Lote' : 'Pieza'} ${cargado.codigo} cargado correctamente.`;
    return true;
  }

  function dibujar() {
    const bloqueDetalle = cargado
      ? `
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-4 rounded-lg bg-marca-claro border border-marca-borde">
              <p class="text-xs text-suave uppercase">Código (${esc(cargado.tipo)})</p>
              <p class="text-lg font-bold text-marca-osc mt-1">${esc(cargado.codigo)}</p>
            </div>
            <div class="p-4 rounded-lg bg-fondo border border-borde">
              <p class="text-xs text-suave uppercase">Modelo / Lote</p>
              <p class="text-lg font-bold text-texto mt-1">${esc(cargado.modelo)} · ${esc(cargado.lote)}</p>
            </div>
            <div class="p-4 rounded-lg bg-fondo border border-borde flex items-center justify-between">
              <div>
                <p class="text-xs text-suave uppercase">Línea / Recepción</p>
                <p class="text-sm font-semibold text-texto mt-1">${esc(cargado.linea)} · ${esc(cargado.recepcion)}</p>
              </div>
              ${chipUnidad(cargado.estado)}
            </div>
          </div>
          ${tabla({
            columnas: [
              { titulo: 'N.º de serie', campo: 'serie' },
              { titulo: 'Lote', campo: 'lote' },
              { titulo: 'Modelo', campo: 'modelo' },
              { titulo: 'Línea', campo: 'linea' },
              { titulo: 'Hora de recepción', campo: 'recepcion' },
              { titulo: 'Estado', html: (u) => chipUnidad(u.estado) },
              {
                titulo: 'Acciones',
                html: (u) => puedeAccionar
                  ? `<a href="registro-de-pruebas-funcionales.html?unidad=${encodeURIComponent(u.serie)}">${boton('Registrar pruebas', { tipo: 'confirmar' })}</a>`
                  : chip('Solo consulta', 'info')
              },
            ],
            filas: cargado.unidades,
            vacio: 'La pieza o lote no tiene unidades registradas',
          })}
        </div>
      `
      : `
        <div class="py-16 text-center">
          <p class="text-2xl font-bold text-texto uppercase tracking-wide">SIN PIEZA NI LOTE CARGADO</p>
          <p class="text-sm text-suave mt-2">Escanea o escribe el serial o lote arriba y presiona Buscar para cargar sus datos.</p>
        </div>
      `;

    contenido.innerHTML = `
      ${encabezado(sesion, 'Escanear pieza o lote', operadorChip)}
      <div class="mt-4 space-y-4">
        ${renderPasos(1)}
        ${mensaje ? aviso('exito', mensaje) : ''}
        ${errorTexto ? aviso('peligro', errorTexto) : ''}

        ${tarjeta('Escanear pieza o lote', `
          <div class="flex flex-col sm:flex-row sm:items-start gap-3">
            <div class="flex-1">
              <input
                id="input-escanear"
                type="text"
                class="campo w-full"
                placeholder="Escanea o escribe el serial/lote..."
                value="${cargado ? esc(cargado.codigo) : ''}"
              >
              <p class="text-xs text-suave mt-2">Ejemplo: U-2026-04</p>
            </div>
            <div class="flex items-center gap-2">
              ${boton('Buscar', { tipo: 'principal', id: 'btn-buscar' })}
              ${boton('Escanear otra', { tipo: 'secundario', id: 'btn-otra' })}
            </div>
          </div>
        `)}

        ${tarjeta(cargado ? 'Pieza o lote cargado' : '', bloqueDetalle)}
      </div>
    `;

    const inputEl = contenido.querySelector('#input-escanear');
    const btnBuscar = contenido.querySelector('#btn-buscar');
    const btnOtra = contenido.querySelector('#btn-otra');

    function alBuscar() {
      const ok = ejecutarBusqueda(inputEl?.value || '');
      dibujar();
      if (!ok) {
        const inp = contenido.querySelector('#input-escanear');
        try { marcarError(inp, errorTexto); } catch (_) {}
      }
    }

    if (btnBuscar) btnBuscar.addEventListener('click', alBuscar);
    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          alBuscar();
        }
      });
    }
    if (btnOtra) {
      btnOtra.addEventListener('click', () => {
        cargado = null;
        mensaje = '';
        errorTexto = '';
        dibujar();
        contenido.querySelector('#input-escanear')?.focus();
      });
    }
  }

  dibujar();
}

if (pagina) iniciar(pagina);
