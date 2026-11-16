import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Esto obliga a Python a buscar y leer tu archivo .env
load_dotenv()

# 2. Extraemos la URL exacta
URL_BASE_DATOS = os.getenv("DATABASE_URL")

# 3. Ponemos un seguro: si no lo lee, que nos avise claramente
if not URL_BASE_DATOS:
    raise ValueError("¡ALERTA! Python no está logrando leer el archivo .env")

# 4. Creamos la conexión
engine = create_engine(URL_BASE_DATOS)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()