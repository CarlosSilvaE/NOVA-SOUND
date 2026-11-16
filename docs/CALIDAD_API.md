# Módulo de Calidad - NOVA SOUND API

Este módulo gestiona la inspección, liberación, retención, retrabajo y scrap de las unidades, garantizando la trazabilidad completa en el piso de producción.

## Seguridad y Permisos
El endpoint transaccional de inspección cuenta con validación de roles por base de datos. Solo los usuarios con `id_rol` de **Inspector de Calidad** (3) o **Administrador** (1) pueden registrar defectos o cambios de estado.

## Endpoints Principales

### 1. Resumen de Calidad (Dashboard)
- **Ruta:** `GET /api/v1/calidad/resumen`
- **Descripción:** Retorna el conteo en tiempo real de unidades Liberadas, en Retención, en Retrabajo y Scrap para alimentar las gráficas del dashboard.

### 2. Búsqueda de Unidad por Escáner
- **Ruta:** `GET /api/v1/calidad/unidades/{numero_serie}`
- **Descripción:** Busca los detalles de una unidad específica. Lanza un 404 si la unidad no existe.

### 3. Catálogo de Defectos
- **Ruta:** `GET /api/v1/calidad/defectos`
- **Descripción:** Lista todas las categorías de defectos disponibles (Falla Funcional, Estética, etc.) para poblar los selectores del frontend.

### 4. Registrar Inspección
- **Ruta:** `POST /api/v1/calidad/inspeccion`
- **Cuerpo (JSON):** `numero_serie`, `id_usuario`, `estado`, `id_categoria_defecto` (opcional si es LIBERADA), `causa` (opcional).
- **Descripción:** Ejecuta una transacción que actualiza el estado de la unidad e inserta el evento en el historial de calidad. Valida reglas de negocio estables.

### 5. Historial de Trazabilidad
- **Ruta:** `GET /api/v1/calidad/trazabilidad/{numero_serie}`
- **Descripción:** Devuelve la línea de tiempo cronológica completa de una unidad, indicando qué inspector hizo el cambio, en qué fecha y el motivo exacto de la falla (si aplica).