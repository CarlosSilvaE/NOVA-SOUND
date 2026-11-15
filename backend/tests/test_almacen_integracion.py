"""Pruebas de integración contra PostgreSQL REAL, base separada y explícita.

Estas pruebas NO se ejecutan sin ALMACEN_RUN_INTEGRATION=1.
Solo se permite nombre de base con sufijo _test (por defecto nova_sounds_test).
Preparar el esquema + semilla y aplicar migraciones 04 y 05 antes de ejecutar.

Ejecutar desde backend/: ALMACEN_RUN_INTEGRATION=1 python -m pytest -q tests/test_almacen_integracion.py
"""
import os
from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.db.database import DATABASE_URL
from app.main import app
from app.modules.almacen import service
from app.modules.almacen.auth import Actor, obtener_actor

pytestmark = pytest.mark.skipif(
    os.getenv("ALMACEN_RUN_INTEGRATION") != "1",
    reason="Activar ALMACEN_RUN_INTEGRATION=1 con PostgreSQL de pruebas instalado",
)


def sqlval(cx, statement: str, **params):
    return cx.execute(text(statement), params).scalar_one()


@pytest.fixture

def pg_test(monkeypatch):
    nombre = os.getenv("ALMACEN_TEST_DB_NAME", "nova_sounds_test")
    if not nombre.endswith("_test") or nombre == DATABASE_URL.database:
        pytest.fail("SEGURIDAD: solo se permite una base distinta de produccion con sufijo _test")
    url = DATABASE_URL.set(database=nombre)
    if not url.drivername.startswith("postgresql"):
        pytest.fail("Se necesita PostgreSQL real")
    engine_test = create_engine(url, pool_pre_ping=True)
    try:
        with engine_test.connect() as cx:
            db = sqlval(cx, "SELECT current_database()")
            assert db == nombre, f"Base inesperada: {db}"
            columnas = cx.execute(text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_schema='public' AND table_name='cajas'
            """)).scalars().all()
            requeridas = {'id_orden', 'capacidad', 'fecha_creacion', 'fecha_cierre'}
            assert requeridas.issubset(columnas), "Aplicar migración 04_modulo_almacen.sql"
    except Exception:
        engine_test.dispose()
        raise
    monkeypatch.setattr(service, "engine", engine_test)
    try:
        yield engine_test
    finally:
        app.dependency_overrides.clear()
        engine_test.dispose()


@pytest.fixture

def escenario(pg_test):
    """Crea datos variados y efímeros solo dentro de la base _test.

    Incluye dos modelos, una unidad liberada, otra retenida y otra de otro modelo.
    Limpia sus registros al terminar (aunque la prueba falle).
    """
    sufijo = uuid4().hex[:12]
    with pg_test.begin() as cx:
        rol = sqlval(cx, "SELECT id_rol FROM roles WHERE lower(nombre)='administrador' LIMIT 1")
        usuario = sqlval(cx, """
            INSERT INTO usuarios(id_rol,nombre,usuario,contrasena)
            VALUES (:rol,'QA Almacen',:login,'NO_USAR_PARA_LOGIN') RETURNING id_usuario
        """, rol=rol, login=f"qa_almacen_{sufijo}")
        supervisor = sqlval(cx, """
            INSERT INTO usuarios(id_rol,nombre,usuario,contrasena)
            VALUES (:rol,'QA Supervisor',:login,'NO_USAR_PARA_LOGIN') RETURNING id_usuario
        """, rol=rol, login=f"qa_supervisor_{sufijo}")
        cliente = sqlval(cx, """
            INSERT INTO clientes(nombre,mezcla_colores)
            VALUES (:nombre,FALSE) RETURNING id_cliente
        """, nombre=f"QA Tienda {sufijo}")
        mini = sqlval(cx, "SELECT id_modelo FROM modelos WHERE nombre='NS-MINI' LIMIT 1")
        pro = sqlval(cx, "SELECT id_modelo FROM modelos WHERE nombre='NS-PRO' LIMIT 1")
        color = sqlval(cx, "SELECT id_color FROM colores ORDER BY id_color LIMIT 1")
        linea = sqlval(cx, "SELECT id_linea FROM linea ORDER BY id_linea LIMIT 1")
        turno = sqlval(cx, "SELECT id_turno FROM turnos ORDER BY id_turno LIMIT 1")
        orden_mini = sqlval(cx, """
            INSERT INTO ordenes(id_cliente,id_modelo,id_color,id_linea,cantidad)
            VALUES (:cliente,:modelo,:color,:linea,20) RETURNING id_orden
        """, cliente=cliente, modelo=mini, color=color, linea=linea)
        orden_pro = sqlval(cx, """
            INSERT INTO ordenes(id_cliente,id_modelo,id_color,id_linea,cantidad)
            VALUES (:cliente,:modelo,:color,:linea,20) RETURNING id_orden
        """, cliente=cliente, modelo=pro, color=color, linea=linea)
        lote_mini = sqlval(cx, """
            INSERT INTO lote(id_orden,cantidad_acordada,estado)
            VALUES (:orden,20,'EN_PROCESO') RETURNING id_lote
        """, orden=orden_mini)
        lote_pro = sqlval(cx, """
            INSERT INTO lote(id_orden,cantidad_acordada,estado)
            VALUES (:orden,20,'EN_PROCESO') RETURNING id_lote
        """, orden=orden_pro)
        unidades = {}
        for clave, lote, estado in (
            ("liberada", lote_mini, "LIBERADA"),
            ("liberada2", lote_mini, "LIBERADA"),
            ("retenida", lote_mini, "EN_RETENCION"),
            ("pro", lote_pro, "LIBERADA"),
        ):
            serie = f"QA-{sufijo}-{clave.upper()}"
            id_unidad = sqlval(cx, """
                INSERT INTO unidades(id_color,id_linea,id_turno,id_lote,estado,numero_serie)
                VALUES (:color,:linea,:turno,:lote,:estado,:serie) RETURNING id_unidad
            """, color=color, linea=linea, turno=turno, lote=lote,
                              estado=estado, serie=serie)
            cx.execute(text("""
                INSERT INTO calidad(id_unidad,id_usuario,estado)
                VALUES (:id_unidad,:id_usuario,:estado)
            """), {"id_unidad": id_unidad, "id_usuario": usuario, "estado": estado})
            unidades[clave] = {"id": id_unidad, "serie": serie}
    app.dependency_overrides[obtener_actor] = lambda: Actor(usuario, "Administrador")
    try:
        yield dict(usuario=usuario, supervisor=supervisor, cliente=cliente, mini=mini, pro=pro,
                   orden_mini=orden_mini, orden_pro=orden_pro,
                   lote_mini=lote_mini, lote_pro=lote_pro, unidades=unidades)
    finally:
        # Limpiar únicamente el escenario creado, por IDs generados por PostgreSQL.
        # Se hace DESPUÉS de que cada test ha cerrado sus transacciones.
        with pg_test.begin() as cx:
            cx.execute(text("DELETE FROM bitacora_general WHERE id_usuario IN (:u,:s)"), {"u": usuario, "s": supervisor})
            cx.execute(text("DELETE FROM autorizacion WHERE id_usuario_solicita IN (:u,:s) OR id_usuario_autoriza IN (:u,:s)"), {"u": usuario, "s": supervisor})
            for lote in (lote_mini, lote_pro):
                cx.execute(text("""
                    DELETE FROM calidad WHERE id_unidad IN
                    (SELECT id_unidad FROM unidades WHERE id_lote=:lote)
                """), {"lote": lote})
                cx.execute(text("DELETE FROM unidades WHERE id_lote=:lote"), {"lote": lote})
            for orden in (orden_mini, orden_pro):
                cx.execute(text("DELETE FROM cajas WHERE id_orden=:orden"), {"orden": orden})
                cx.execute(text("DELETE FROM embarques WHERE id_orden=:orden"), {"orden": orden})
                cx.execute(text("DELETE FROM lote WHERE id_orden=:orden"), {"orden": orden})
                cx.execute(text("DELETE FROM ordenes WHERE id_orden=:orden"), {"orden": orden})
            cx.execute(text("DELETE FROM usuarios WHERE id_usuario IN (:u,:s)"), {"u": usuario, "s": supervisor})
            cx.execute(text("DELETE FROM clientes WHERE id_cliente=:id"), {"id": cliente})


def test_catalogo_exacto_y_capacidades(pg_test):
    with pg_test.connect() as cx:
        nombres = set(cx.execute(text("SELECT nombre FROM modelos")).scalars().all())
    assert nombres == {"NS-MINI", "NS-SPORT", "NS-PRO", "NS-MAX"}
    assert [service.capacidad_modelo(x) for x in sorted(nombres)] == [4, 12, 6, 8]  # orden alfabetico: MAX, MINI, PRO, SPORT


def test_flujo_empaque_y_embarque_real(pg_test, escenario):
    u = escenario["unidades"]
    with TestClient(app) as api:
        caja = api.post("/api/v1/almacen/cajas", json={"id_orden": escenario["orden_mini"]})
        assert caja.status_code == 201, caja.text
        caja_id = caja.json()["id_caja"]
        assert caja.json()["capacidad"] == 12

        no = api.post(f"/api/v1/almacen/cajas/{caja_id}/unidades", json={"numero_serie": u["retenida"]["serie"]})
        assert no.status_code == 409, no.text
        equivocado = api.post(f"/api/v1/almacen/cajas/{caja_id}/unidades", json={"numero_serie": u["pro"]["serie"]})
        assert equivocado.status_code == 409, equivocado.text

        agregado = api.post(f"/api/v1/almacen/cajas/{caja_id}/unidades", json={"numero_serie": u["liberada"]["serie"]})
        assert agregado.status_code == 200, agregado.text
        assert agregado.json()["cantidad_unidades"] == 1

        traz_pre = api.get(f"/api/v1/almacen/trazabilidad/{u['liberada']['serie']}")
        assert traz_pre.status_code == 200, traz_pre.text
        assert any(e["accion"] == "AGREGAR_UNIDAD" for e in traz_pre.json()["historial_almacen"])

        cerrado = api.post(f"/api/v1/almacen/cajas/{caja_id}/cerrar")
        assert cerrado.status_code == 200, cerrado.text
        assert cerrado.json()["estado"] == "CERRADA"
        bloqueado = api.post(f"/api/v1/almacen/cajas/{caja_id}/unidades", json={"numero_serie": u["liberada2"]["serie"]})
        assert bloqueado.status_code == 409, bloqueado.text

        salida = api.post("/api/v1/almacen/embarques", json={"id_orden": escenario["orden_mini"], "referencia": "QA-GUIA"})
        assert salida.status_code == 201, salida.text
        embarque_id = salida.json()["id_embarque"]
        vinculo = api.post(f"/api/v1/almacen/embarques/{embarque_id}/cajas/{caja_id}")
        assert vinculo.status_code == 200, vinculo.text
        envio = api.post(f"/api/v1/almacen/embarques/{embarque_id}/salida")
        assert envio.status_code == 200, envio.text
        assert envio.json()["estado"] == "ENVIADO"
        assert api.post(f"/api/v1/almacen/embarques/{embarque_id}/salida").status_code == 409

        traza = api.get(f"/api/v1/almacen/trazabilidad/{u['liberada']['serie']}")
        assert traza.status_code == 200, traza.text
        data = traza.json()
        assert data["id_caja"] == caja_id
        assert data["id_embarque"] == embarque_id
        assert data["estado"] == "EMBARCADA"
        acciones = [e["accion"] for e in data["historial_almacen"]]
        assert acciones == ["AGREGAR_UNIDAD", "CERRAR_CAJA", "ASIGNAR_EMBARQUE", "REGISTRAR_SALIDA"]
        assert all(e["id_usuario"] == escenario["usuario"] for e in data["historial_almacen"])

        with pg_test.connect() as cx:
            estado_bd = sqlval(cx, "SELECT estado FROM unidades WHERE id_unidad=:id", id=u["liberada"]["id"])
            assert estado_bd == "EMBARCADA"


def test_retiro_preserva_historial_de_caja(pg_test, escenario):
    serie = escenario["unidades"]["liberada"]["serie"]
    with TestClient(app) as api:
        caja = api.post("/api/v1/almacen/cajas", json={"id_orden": escenario["orden_mini"]})
        assert caja.status_code == 201, caja.text
        id_caja = caja.json()["id_caja"]
        assert api.post(f"/api/v1/almacen/cajas/{id_caja}/unidades", json={"numero_serie": serie}).status_code == 200
        borrado = api.delete(f"/api/v1/almacen/cajas/{id_caja}/unidades/{escenario['unidades']['liberada']['id']}")
        assert borrado.status_code == 200, borrado.text
        assert borrado.json()["cantidad_unidades"] == 0
        traza = api.get(f"/api/v1/almacen/trazabilidad/{serie}")
        assert traza.status_code == 200, traza.text
        assert traza.json()["id_caja"] is None
        eventos = traza.json()["historial_almacen"]
        assert [e["accion"] for e in eventos] == ["AGREGAR_UNIDAD", "RETIRAR_UNIDAD"]
        assert all(e["detalle"]["id_caja"] == id_caja for e in eventos)


def test_concurrencia_doble_asignacion(pg_test, escenario):
    """Dos operaciones concurrentes sobre una serie: solo puede ganar una."""
    actor = Actor(escenario["usuario"], "Administrador")
    caja_1 = service.crear_caja(escenario["orden_mini"], actor)["id_caja"]
    caja_2 = service.crear_caja(escenario["orden_mini"], actor)["id_caja"]
    serie = escenario["unidades"]["liberada"]["serie"]

    def competir(caja):
        try:
            service.agregar_unidad(caja, serie, actor)
            return 200
        except HTTPException as exc:
            return exc.status_code

    with ThreadPoolExecutor(max_workers=2) as pool:
        codigos = list(pool.map(competir, (caja_1, caja_2)))
    assert sorted(codigos) == [200, 409]
    with pg_test.connect() as cx:
        caja_asignada = sqlval(cx, "SELECT id_caja FROM unidades WHERE numero_serie=:serie", serie=serie)
    assert caja_asignada in {caja_1, caja_2}


def test_reapertura_autorizada_y_auditada(pg_test, escenario):
    actor = Actor(escenario["usuario"], "Administrador")
    supervisor = Actor(escenario["supervisor"], "Administrador")
    caja = service.crear_caja(escenario["orden_mini"], actor)
    id_caja = caja["id_caja"]
    serie = escenario["unidades"]["liberada"]["serie"]
    service.agregar_unidad(id_caja, serie, actor)
    service.cerrar_caja(id_caja, actor)
    solicitud = service.solicitar_reapertura(id_caja, "Corregir una unidad escaneada erroneamente", actor)
    with pytest.raises(HTTPException) as exc:
        service.autorizar_reapertura(id_caja, solicitud["id_autorizacion"], actor)
    assert exc.value.status_code == 403
    abierta = service.autorizar_reapertura(id_caja, solicitud["id_autorizacion"], supervisor)
    assert abierta["estado"] == "EN_PROCESO"
    detalle = service.trazabilidad(serie)
    assert any(e["accion"] == "REABRIR_CAJA" for e in detalle["historial_almacen"])
    log = service.historial_caja(id_caja)
    assert any(e["accion"] == "REABRIR_CAJA" and e["id_usuario"] == escenario["supervisor"] for e in log)


def test_embarque_rechaza_orden_diferente(pg_test, escenario):
    actor = Actor(escenario["usuario"], "Administrador")
    caja = service.crear_caja(escenario["orden_mini"], actor)
    id_caja = caja["id_caja"]
    service.agregar_unidad(id_caja, escenario["unidades"]["liberada"]["serie"], actor)
    service.cerrar_caja(id_caja, actor)
    embarque = service.crear_embarque(escenario["orden_pro"], "QA-REFERENCIA-OTRA-ORDEN", actor)
    with pytest.raises(HTTPException) as exc:
        service.agregar_caja_embarque(embarque["id_embarque"], id_caja, actor)
    assert exc.value.status_code == 409
    detalle = service.detalle_caja(id_caja)
    assert detalle["id_embarque"] is None
