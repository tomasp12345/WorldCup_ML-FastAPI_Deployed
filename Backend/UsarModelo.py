# usar_modelo.py
# Carga el modelo entrenado y predice partidos por NOMBRE de equipo.
# Esto es lo que la app llamará.

import joblib
import numpy as np
import pandas as pd
from scipy.stats import poisson

# --- Cargar lo guardado (se hace una vez, al importar el módulo) ---
modelo = joblib.load("data/modelo_poisson.joblib")
elo_fifa = joblib.load("data/elo_fifa.joblib")

# --- Lista de equipos que el modelo conoce (para el autocompletado del frontend) ---
def listar_equipos():
    # elo_fifa es un dict {nombre_equipo: elo}. Devolvemos los nombres ordenados.
    return sorted(elo_fifa.keys())

# --- Función auxiliar: la matriz de marcadores (la misma de 2.PepararDatos_ElegirModelo.ipynb)
def matriz_marcadores(lambda_local, lambda_visitante, max_goles=6):
    probs_local = [poisson.pmf(i, lambda_local) for i in range(max_goles + 1)]
    probs_visitante = [poisson.pmf(j, lambda_visitante) for j in range(max_goles + 1)]
    matriz = np.zeros((max_goles + 1, max_goles + 1))
    for i in range(max_goles + 1):
        for j in range(max_goles + 1):
            matriz[i, j] = probs_local[i] * probs_visitante[j]
    return matriz

# --- LA FUNCIÓN ESTRELLA: de nombres a predicción ---
def predecir_partido(equipo_local, equipo_visitante, es_neutral=True, max_goles=6):
    # --- (igual que antes: traducir nombres, predecir lambdas) ---
    elo_local = elo_fifa[equipo_local]
    elo_visit = elo_fifa[equipo_visitante]
    es_local_flag = 0 if es_neutral else 1

    X_local = pd.DataFrame([[elo_local, elo_visit, es_local_flag]],
                           columns=["mi_elo", "elo_rival", "es_local"])
    X_visit = pd.DataFrame([[elo_visit, elo_local, 0]],
                           columns=["mi_elo", "elo_rival", "es_local"])

    lambda_local = modelo.predict(X_local)[0]
    lambda_visit = modelo.predict(X_visit)[0]

    m = matriz_marcadores(lambda_local, lambda_visit, max_goles)

    # --- Marcador probable y resultado (igual que antes) ---
    idx = np.unravel_index(np.argmax(m), m.shape)
    prob_gana_local = prob_empate = prob_gana_visit = 0.0
    for i in range(m.shape[0]):
        for j in range(m.shape[1]):
            if i > j:   prob_gana_local += m[i, j]
            elif i == j: prob_empate += m[i, j]
            else:        prob_gana_visit += m[i, j]

    # --- NUEVO 1: over/under por equipo ---
    # Probabilidad de que el LOCAL meta MÁS de cierto umbral.
    # "más de 0.5" = 1 o más; "más de 1.5" = 2 o más; etc.
    def over_equipo(probs_goles, umbral):
        # probs_goles: lista con P(mete 0), P(mete 1), ...
        # "más de umbral" = sumar las probabilidades de meter MÁS goles que el umbral.
        return sum(p for goles, p in enumerate(probs_goles) if goles > umbral)

    # Probabilidades de goles de cada equipo (sumando filas/columnas de la matriz)
    probs_local = m.sum(axis=1)   # sumar cada fila = P(local mete i)
    probs_visit = m.sum(axis=0) # sumar cada columna = P(visitante mete j)

    umbrales = [0.5, 1.5, 2.5]
    over_local = {f"over_{u}": round(over_equipo(probs_local, u), 3) for u in umbrales}
    over_visit = {f"over_{u}": round(over_equipo(probs_visit, u), 3) for u in umbrales}

    # --- NUEVO 2: over/under combinado (total del partido) ---
    umbrales_total = [0.5, 1.5, 2.5, 3.5]
    over_total = {}
    for u in umbrales_total:
        prob = 0.0
        for i in range(m.shape[0]):
            for j in range(m.shape[1]):
                if (i + j) > u:           # total de goles del partido
                    prob += m[i, j]
        over_total[f"over_{u}"] = round(prob, 3)

    # --- Devolver TODO ---
    return {
        "equipos": f"{equipo_local} vs {equipo_visitante}",
        "lambda_local": round(lambda_local, 2),
        "lambda_visitante": round(lambda_visit, 2),
        "marcador_probable": (int(idx[0]), int(idx[1])),
        "prob_marcador": round(float(m[idx]), 3),
        "gana_local": round(prob_gana_local, 3),
        "empate": round(prob_empate, 3),
        "gana_visitante": round(prob_gana_visit, 3),
        "over_local": over_local,
        "over_visitante": over_visit,
        "over_total": over_total,
        "matriz": m.round(4).tolist(),   # la matriz completa como lista de listas
    }