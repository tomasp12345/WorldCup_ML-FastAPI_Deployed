# Dockerfile para desplegar el backend en Hugging Face Spaces.
FROM python:3.13-slim

# libgomp1 lo necesita scikit-learn (usa OpenMP).
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias primero (aprovecha la caché de Docker).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del backend (main.py, UsarModelo.py, data/, etc.).
COPY . .

# Hugging Face Spaces expone el puerto 7860.
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
