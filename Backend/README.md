# World Cup 2026 Predictor — Backend API

API en FastAPI que predice partidos con un modelo de Poisson (scikit-learn) basado en el Elo FIFA.

## Endpoints
- `GET /` — comprobación de salud.
- `GET /equipos` — lista de equipos válidos (para el autocompletado).
- `POST /predecir` — recibe `{equipo_local, equipo_visitante, es_neutral}` y devuelve la predicción.

## Correr en local
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## Despliegue
Incluye un `Dockerfile` listo para Render (u otro host con Docker). El contenedor
arranca uvicorn en el puerto que indique la variable `$PORT`.
