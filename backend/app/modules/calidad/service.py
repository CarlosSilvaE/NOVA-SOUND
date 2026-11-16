from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import repository, schemas, auth

def obtener_resumen_calidad(db: Session) -> schemas.ResumenCalidad:
    resultados = repository.obtener_conteo_estados(db)
    
    datos = {
        "liberadas": 0,
        "retenidas": 0,
        "retrabajo": 0,
        "scrap": 0
    }
    
    # Mapeamos los resultados de la base de datos (usando mayúsculas)
    for fila in resultados:
        estado = str(fila.estado).upper()
        total = fila.total
        
        # En la DB las liberadas también pueden estar como 'EMPACADA'
        if estado == 'LIBERADA' or estado == 'EMPACADA':
            datos["liberadas"] += total
        elif estado == 'EN_RETENCION':
            datos["retenidas"] += total
        elif estado == 'EN_RETRABAJO':
            datos["retrabajo"] += total
        elif estado == 'SCRAP':
            datos["scrap"] += total
            
    return schemas.ResumenCalidad(**datos)

def obtener_unidad(db: Session, numero_serie: str) -> schemas.UnidadDetalle:
    unidad = repository.obtener_unidad_por_serie(db, numero_serie)
    
    if not unidad:
        raise HTTPException(status_code=404, detail=f"La unidad {numero_serie} no existe o no fue encontrada.")
        
    return schemas.UnidadDetalle(
        numero_serie=unidad.numero_serie,
        modelo=unidad.modelo,
        orden=unidad.orden,
        estado=unidad.estado
    )

from typing import List

def obtener_categorias(db: Session) -> List[schemas.CategoriaDefecto]:
    resultados = repository.obtener_categorias_defectos(db)
    
    # Transformamos las filas de SQL en una lista de objetos Pydantic
    return [
        schemas.CategoriaDefecto(
            id_categoria=fila.id_categoria, 
            nombre=fila.nombre
        ) 
        for fila in resultados
    ]

def procesar_inspeccion(db: Session, inspeccion: schemas.InspeccionCrear):
    # 1. BARRERA DE SEGURIDAD: Validar que el usuario tenga el rol correcto
    auth.verificar_permisos_inspector(db, inspeccion.id_usuario)

    # 2. Regla de negocio: Si falla, requiere defecto
    if inspeccion.estado != 'LIBERADA' and not inspeccion.id_categoria_defecto:
        raise HTTPException(
            status_code=400, 
            detail="Si la unidad no es LIBERADA, debes seleccionar una categoría de defecto."
        )

    try:
        # Convertimos el esquema a diccionario y lo pasamos al repositorio
        exito = repository.registrar_inspeccion(db, inspeccion.model_dump())
        
        if not exito:
            raise HTTPException(status_code=404, detail="El número de serie no existe.")

        # Confirmamos la transacción para guardar en PostgreSQL
        db.commit()
        return {"mensaje": "Inspección registrada con éxito", "serie": inspeccion.numero_serie}

    except Exception as e:
        # Si algo explota (ej. error de SQL), deshacemos todo
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")

def obtener_historial_trazabilidad(db: Session, numero_serie: str) -> List[schemas.RegistroTrazabilidad]:
    # 1. Validamos que la serie exista usando la función que ya teníamos
    unidad = repository.obtener_unidad_por_serie(db, numero_serie)
    if not unidad:
        raise HTTPException(status_code=404, detail=f"La unidad {numero_serie} no existe.")

    # 2. Obtenemos la línea de tiempo
    resultados = repository.obtener_trazabilidad(db, numero_serie)
    
    # 3. Transformamos a Pydantic
    return [
        schemas.RegistroTrazabilidad(
            estado=fila.estado,
            fecha=fila.fecha,
            inspector=fila.inspector,
            defecto=fila.defecto,
            causa=fila.causa
        )
        for fila in resultados
    ]