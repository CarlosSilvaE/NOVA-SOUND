from sqlalchemy.orm import Session
from sqlalchemy import text

# 1. Para GET /calidad/resumen
def obtener_conteo_estados(db: Session):
    consulta = text("""
        SELECT estado, COUNT(*) as total 
        FROM Unidades 
        GROUP BY estado;
    """)
    return db.execute(consulta).fetchall()

# 2. Para GET /calidad/unidades/{numero_serie}
def obtener_unidad_por_serie(db: Session, numero_serie: str):
    consulta = text("""
        SELECT 
            u.numero_serie, 
            m.nombre AS modelo, 
            CAST(o.id_orden AS VARCHAR) AS orden, 
            u.estado 
        FROM Unidades u
        JOIN Lote l ON u.id_lote = l.id_lote
        JOIN Ordenes o ON l.id_orden = o.id_orden
        JOIN Modelos m ON o.id_modelo = m.id_modelo
        WHERE u.numero_serie = :serie;
    """)
    return db.execute(consulta, {"serie": numero_serie}).fetchone()

# 3. Para GET /calidad/defectos
def obtener_categorias_defectos(db: Session):
    consulta = text("SELECT id_categoria, nombre FROM CAT_DEFECTOS;")
    return db.execute(consulta).fetchall()

# 4. Para POST /calidad/inspeccion
def registrar_inspeccion(db: Session, datos: dict):
    query_unidad = text("SELECT id_unidad FROM Unidades WHERE numero_serie = :serie")
    id_unidad = db.execute(query_unidad, {"serie": datos["numero_serie"]}).scalar()

    if not id_unidad:
        return False

    query_update = text("UPDATE Unidades SET estado = :estado WHERE id_unidad = :id_unidad")
    db.execute(query_update, {"estado": datos["estado"], "id_unidad": id_unidad})

    query_calidad = text("""
        INSERT INTO Calidad (id_unidad, id_usuario, estado) 
        VALUES (:id_unidad, :id_usuario, :estado) 
        RETURNING id_calidad;
    """)
    id_calidad = db.execute(query_calidad, {
        "id_unidad": id_unidad, 
        "id_usuario": datos["id_usuario"], 
        "estado": datos["estado"]
    }).scalar()

    if datos.get("id_categoria_defecto"):
        query_defecto = text("""
            INSERT INTO Defectos (id_calidad, id_categoria, causa) 
            VALUES (:id_calidad, :id_categoria, :causa);
        """)
        db.execute(query_defecto, {
            "id_calidad": id_calidad,
            "id_categoria": datos["id_categoria_defecto"],
            "causa": datos.get("causa", "Sin detalles")
        })

    return True

# 5. Para GET /calidad/trazabilidad/{numero_serie}
def obtener_trazabilidad(db: Session, numero_serie: str):
    consulta = text("""
        SELECT 
            c.estado, 
            c.fecha, 
            us.nombre AS inspector, 
            cat.nombre AS defecto, 
            d.causa 
        FROM Calidad c
        JOIN Unidades u ON c.id_unidad = u.id_unidad
        JOIN Usuarios us ON c.id_usuario = us.id_usuario
        LEFT JOIN Defectos d ON c.id_calidad = d.id_calidad
        LEFT JOIN CAT_DEFECTOS cat ON d.id_categoria = cat.id_categoria
        WHERE u.numero_serie = :serie
        ORDER BY c.fecha DESC;
    """)
    return db.execute(consulta, {"serie": numero_serie}).fetchall()

# 6. Para seguridad y permisos
def obtener_rol_usuario(db: Session, id_usuario: int):
    consulta = text("SELECT id_rol FROM Usuarios WHERE id_usuario = :id;")
    resultado = db.execute(consulta, {"id": id_usuario}).fetchone()
    return resultado[0] if resultado else None