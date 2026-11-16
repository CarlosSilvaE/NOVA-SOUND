from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from . import schemas, service  # El punto indica que importe el schemas y service de esta misma carpeta (calidad)

router = APIRouter(prefix="/calidad", tags=["Calidad"])

@router.get(
    "/resumen",
    response_model=schemas.ResumenCalidad,
    summary="Consultar resumen del Dashboard de Calidad",
    description=(
        "Devuelve el conteo total de unidades liberadas, retenidas, "
        "en retrabajo y scrap para alimentar las métricas principales."
    ),
    response_description="Métricas de calidad actuales"
)
def obtener_resumen_calidad(db: Session = Depends(get_db)):
    return service.obtener_resumen_calidad(db)
@router.get(
    "/unidades/{numero_serie}",
    response_model=schemas.UnidadDetalle,
    summary="Buscar detalles de unidad",
    description="Devuelve los datos de una unidad escaneada para iniciar su inspección de calidad."
)
def buscar_unidad(numero_serie: str, db: Session = Depends(get_db)):
    return service.obtener_unidad(db, numero_serie)

from typing import List

@router.get(
    "/defectos",
    response_model=List[schemas.CategoriaDefecto],
    summary="Obtener catálogo de defectos",
    description="Devuelve las categorías de defectos disponibles para el dropdown de inspección."
)
def obtener_defectos(db: Session = Depends(get_db)):
    return service.obtener_categorias(db)

@router.post(
    "/inspeccion",
    summary="Registrar resultado de inspección",
    description="Actualiza el estado de la unidad y registra el historial de calidad."
)
def crear_inspeccion(inspeccion: schemas.InspeccionCrear, db: Session = Depends(get_db)):
    return service.procesar_inspeccion(db, inspeccion)

@router.get(
    "/trazabilidad/{numero_serie}",
    response_model=List[schemas.RegistroTrazabilidad],
    summary="Historial de calidad de una unidad",
    description="Devuelve la línea de tiempo de inspecciones de una unidad específica ordenada de la más reciente a la más antigua."
)
def obtener_trazabilidad(numero_serie: str, db: Session = Depends(get_db)):
    return service.obtener_historial_trazabilidad(db, numero_serie)