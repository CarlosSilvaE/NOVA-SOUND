from fastapi.testclient import TestClient
from app.main import app

# Cliente de pruebas que simula al navegador/frontend
client = TestClient(app)

def test_obtener_resumen_calidad():
    respuesta = client.get("/api/v1/calidad/resumen")
    assert respuesta.status_code == 200
    datos = respuesta.json()
    # Verificamos que el JSON devuelva las llaves correctas
    assert "liberadas" in datos
    assert "retenidas" in datos
    assert "retrabajo" in datos
    assert "scrap" in datos

def test_buscar_unidad_existente():
    # Usamos una serie que sabemos que existe por el script de prueba
    respuesta = client.get("/api/v1/calidad/unidades/SN-2026-0010")
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert datos["numero_serie"] == "SN-2026-0010"
    assert "estado" in datos

def test_buscar_unidad_inexistente():
    respuesta = client.get("/api/v1/calidad/unidades/SN-INVENTADA-999")
    assert respuesta.status_code == 404
    assert respuesta.json()["detail"] == "La unidad SN-INVENTADA-999 no existe o no fue encontrada."

def test_obtener_catalogo_defectos():
    respuesta = client.get("/api/v1/calidad/defectos")
    assert respuesta.status_code == 200
    datos = respuesta.json()
    assert isinstance(datos, list) # Debe ser una lista
    if len(datos) > 0:
        assert "id_categoria" in datos[0]
        assert "nombre" in datos[0]

def test_inspeccion_sin_defecto_cuando_falla():
    # Intenta registrar un SCRAP sin indicar el motivo
    datos = {
        "numero_serie": "SN-2026-0010",
        "id_usuario": 3,
        "estado": "SCRAP"
    }
    respuesta = client.post("/api/v1/calidad/inspeccion", json=datos)
    assert respuesta.status_code == 400
    assert "seleccionar una categoría de defecto" in respuesta.json()["detail"]