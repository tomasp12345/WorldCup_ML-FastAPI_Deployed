# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Importamos TU función de predicción (la de usar_modelo.py).
# Al importar, se cargan el modelo y el elo UNA vez (patrón de oro).
from UsarModelo import predecir_partido, listar_equipos

app = FastAPI(title="Predictor Mundial 2026")

# --- CORS: permitir que el frontend (Vite) hable con este backend ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # el puerto de Vite
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modelo de datos que ESPERA recibir el endpoint ---
# Pydantic valida automáticamente que llegue lo correcto.
class PeticionPartido(BaseModel):
    equipo_local: str
    equipo_visitante: str
    es_neutral: bool = True   # por defecto neutral (es un Mundial)

# --- Endpoint de salud: útil para verificar que la API vive ---
@app.get("/")
def raiz():
    return {"estado": "ok", "mensaje": "API del predictor funcionando"}

# --- Lista de equipos válidos (para el autocompletado del buscador) ---
@app.get("/equipos")
def equipos():
    return {"equipos": listar_equipos()}

# --- Endpoint principal: recibe dos equipos, devuelve la predicción ---
@app.post("/predecir")
def predecir(peticion: PeticionPartido):
    resultado = predecir_partido(
        peticion.equipo_local,
        peticion.equipo_visitante,
        peticion.es_neutral,
    )
    return resultado