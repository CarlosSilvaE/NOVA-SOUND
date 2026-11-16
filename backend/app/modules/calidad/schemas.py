from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
class ResumenCalidad(BaseModel):
    liberadas: int = Field(..., description="Unidades aprobadas y listas para empaque")
    retenidas: int = Field(..., description="Unidades bloqueadas por defectos")
    retrabajo: int = Field(..., description="Unidades en proceso de reparación")
    scrap: int = Field(..., description="Unidades desechadas")

class UnidadDetalle(BaseModel):
    numero_serie: str = Field(..., description="Código de barras o serie de la unidad")
    modelo: str = Field(..., description="Modelo de la bocina")
    orden: str = Field(..., description="Orden de producción a la que pertenece")
    estado: str = Field(..., description="Estado actual (ej. Liberada, En retención)")

    model_config = ConfigDict(from_attributes=True)

class CategoriaDefecto(BaseModel):
    id_categoria: int = Field(..., description="ID interno de la categoría")
    nombre: str = Field(..., description="Nombre del defecto (ej. Apariencia / Estética)")

    model_config = ConfigDict(from_attributes=True)

class InspeccionCrear(BaseModel):
    numero_serie: str = Field(..., description="Serie de la unidad escaneada")
    id_usuario: int = Field(..., description="ID del inspector (ej. 3 para Carlos López)")
    estado: str = Field(..., description="Nuevo estado: LIBERADA, EN_RETENCION, EN_RETRABAJO o SCRAP")
    id_categoria_defecto: Optional[int] = Field(default=None, description="ID del defecto (solo si falla)")
    causa: Optional[str] = Field(default=None, description="Comentarios adicionales del problema")

class RegistroTrazabilidad(BaseModel):
    estado: str = Field(..., description="Estado de la unidad en ese momento")
    fecha: datetime = Field(..., description="Fecha y hora del registro")
    inspector: str = Field(..., description="Nombre del usuario que inspeccionó")
    defecto: Optional[str] = Field(default=None, description="Categoría del defecto (si hubo)")
    causa: Optional[str] = Field(default=None, description="Comentarios del problema (si hubo)")

    model_config = ConfigDict(from_attributes=True)