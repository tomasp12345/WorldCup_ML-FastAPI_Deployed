---
title: World Cup 2026 Predictor API
emoji: ⚽
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# World Cup 2026 Predictor — Backend API

API en FastAPI que predice partidos con un modelo de Poisson (scikit-learn) basado en el Elo FIFA.

## Endpoints
- `GET /` — comprobación de salud.
- `GET /equipos` — lista de equipos válidos (para el autocompletado).
- `POST /predecir` — recibe `{equipo_local, equipo_visitante, es_neutral}` y devuelve la predicción.

El bloque de arriba (entre `---`) es la configuración que **Hugging Face Spaces** lee para
saber que es un Space de tipo Docker y que la app escucha en el puerto 7860.
