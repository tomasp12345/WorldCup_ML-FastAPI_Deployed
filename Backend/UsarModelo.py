# usar_modelo.py
# Carga el modelo entrenado y predice partidos por NOMBRE de equipo.
# Esto es lo que la app llamará.

import joblib
import numpy as np
import pandas as pd
from scipy.stats import poisson

# Cargar modelo y datos
modelo = joblib.load("data/modelo_poisson.joblib")
elo_fifa = joblib.load("data/elo_fifa.joblib")

# Listar equipos ordenados (keys del diccionario de Elo FIFA)
def listar_equipos():
    return sorted(elo_fifa.keys())

# Matriz de marcadores 
def matriz_marcadores(lambda_local, lambda_visitante, max_goles=6):
    probs_local = [poisson.pmf(i, lambda_local) for i in range(max_goles + 1)] #Probabilidad de i goles dado un lambda - da una lista de probabilidades
    probs_visitante = [poisson.pmf(j, lambda_visitante) for j in range(max_goles + 1)]
    matriz = np.zeros((max_goles + 1, max_goles + 1)) #Crea la matriz vacia
    for i in range(max_goles + 1):
        for j in range(max_goles + 1):
            matriz[i, j] = probs_local[i] * probs_visitante[j] #Recorre toda la matriz poniendo proba de i goles del local * j goles del visitante
    return matriz

def predecir_partido(equipo_local, equipo_visitante, es_neutral=True, max_goles=6):
    #Prepara todo para predecir
    elo_local = elo_fifa[equipo_local]
    elo_visit = elo_fifa[equipo_visitante]
    es_local_flag = 0 if es_neutral else 1

    X_local = pd.DataFrame([[elo_local, elo_visit, es_local_flag]],
                           columns=["mi_elo", "elo_rival", "es_local"])
    X_visit = pd.DataFrame([[elo_visit, elo_local, 0]],
                           columns=["mi_elo", "elo_rival", "es_local"])

    lambda_local = modelo.predict(X_local)[0]
    lambda_visit = modelo.predict(X_visit)[0] #Pongo el 0 porque predict devuelve un array de 1 elemento, y quiero el valor.

    m = matriz_marcadores(lambda_local, lambda_visit, max_goles) #llama la funcion de matriz.

    # Marcador mas probable y probabilidades gana local/empate/gana visitante 
    idx = np.unravel_index(np.argmax(m), m.shape) #argmax devuelve el indice del maximo valor de la matriz, y unravel_index lo convierte en coordenadas (i,j)
    prob_gana_local = prob_empate = prob_gana_visit = 0.0
    for i in range(m.shape[0]):
        for j in range(m.shape[1]):
            if i > j:   prob_gana_local += m[i, j] #van acumulando probabilidades
            elif i == j: prob_empate += m[i, j]
            else:        prob_gana_visit += m[i, j]

    # Over/under por equipo 
    def over_equipo(probs_goles, umbral): #suma p o/u para un equipo dado un umbral y un vector con las p de cada cantidad de goles
        return sum(p for goles, p in enumerate(probs_goles) if goles > umbral)

    # suma p de goles de cada equipo (sumando filas/columnas de la matriz)
    probs_local = m.sum(axis=1)   # sumar cada fila = P(local mete i)
    probs_visit = m.sum(axis=0) # sumar cada columna = P(visitante mete j)

    umbrales = [0.5, 1.5, 2.5]
    over_local = {f"over_{u}": round(over_equipo(probs_local, u), 3) for u in umbrales} 
    over_visit = {f"over_{u}": round(over_equipo(probs_visit, u), 3) for u in umbrales}
    #Me devuelvo un diccionario tipo {"over_0.5": 0.734, "over_1.5": 0.443, "over_2.5": 0.143}

    # Over/under combinado (total del partido) 
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