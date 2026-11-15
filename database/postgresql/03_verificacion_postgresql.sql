-- Ejecutar conectado a nova_sounds despues de importar los datos.
SELECT count(*) AS total_tablas
  FROM information_schema.tables
 WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT (SELECT count(*) FROM roles) AS roles,
       (SELECT count(*) FROM usuarios) AS usuarios,
       (SELECT count(*) FROM unidades) AS unidades,
       (SELECT count(*) FROM pruebas) AS pruebas,
       (SELECT count(*) FROM calidad) AS inspecciones_calidad,
       (SELECT count(*) FROM defectos) AS defectos,
       (SELECT count(*) FROM cajas) AS cajas;

SELECT estado, count(*) AS unidades
  FROM unidades GROUP BY estado ORDER BY estado;

-- Debe devolver 0 registros si todos los id_unidad de pruebas tienen unidad asociada.
SELECT p.id_prueba
  FROM pruebas p LEFT JOIN unidades u ON p.id_unidad = u.id_unidad
 WHERE u.id_unidad IS NULL;

-- Consulta de referencia de secuencia (no consume IDs).
SELECT pg_get_serial_sequence('public.usuarios', 'id_usuario') AS secuencia_usuarios;
