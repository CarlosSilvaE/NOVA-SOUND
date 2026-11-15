-- Ejecutar conectado a la base administrativa 'postgres' o a otra base existente.
-- CREATE DATABASE no debe ejecutarse dentro de BEGIN/COMMIT.
-- Se usa el nombre sin espacios para simplificar la configuracion de FastAPI.
CREATE DATABASE nova_sounds WITH ENCODING 'UTF8';
