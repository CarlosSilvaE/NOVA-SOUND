from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from . import repository

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from . import repository

def verificar_permisos_inspector(db: Session, id_usuario: int):
    id_rol = repository.obtener_rol_usuario(db, id_usuario)
    
    if not id_rol:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="El usuario especificado no existe."
        )
    
    # 1 = Administrador, 3 = Inspector de Calidad (Ajusta los números si es necesario)
    roles_permitidos = [1, 3]
    
    if id_rol not in roles_permitidos:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Acceso denegado. El usuario con id_rol {id_rol} no tiene permisos de inspector."
        )
    
    return True