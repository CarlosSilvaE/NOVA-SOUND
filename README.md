# NOVA-SOUND
Sistema web de gestión de producción, calidad, trazabilidad y embarques de NOVA SOUND

## Docker: aplicación en el puerto 8000

Con Docker Desktop iniciado, desde la raíz del proyecto:

```powershell
Copy-Item .env.example .env
```

Completa `DB_PASSWORD` en `.env` y revisa `DB_NAME` / `DB_USER`. Si el archivo ya existe, edítalo sin reemplazarlo. Después ejecuta:

```powershell
docker compose up -d --build --wait
```

Abre **http://localhost:8000** para el frontend y **http://localhost:8000/docs** para la API. PostgreSQL se inicializa con el esquema, datos de ejemplo y migraciones de Almacén en un volumen persistente.

Producción, cierres, Gerencia, Sistemas, Empaque y Embarques operan con PostgreSQL seleccionando **Sistema conectado a PostgreSQL** en el login. **Pruebas funcionales y Calidad continúan en demostración**. Consulta [la conexión de Gestión](docs/CONEXION-GESTION.md), [la conexión de Almacén](docs/CONEXION-ALMACEN.md) y [la guía Docker](docs/DOCKER.md). Las pruebas completas se ejecutan con `python scripts/probar_todo.py` en contenedores y bases temporales.

## Todas las pruebas

```powershell
python scripts/probar_todo.py
```

Requiere Docker Desktop, Python, Node.js 22 o superior y Edge/Chrome. Prepara y elimina su propio entorno de pruebas; conserva la aplicación del puerto 8000. Detalles y resultados esperados: [guía de pruebas](docs/PRUEBAS.md).
