// src/predecir.js
// Página "Predecir un partido": el usuario escribe dos equipos y pedimos la predicción a la API.
import "./style.css";
import { construirDetalle } from "./predictMatch.js";
import { API_URL } from "./config.js";

const boton = document.getElementById("botonPredecir");
const detalle = document.getElementById("detallePartido");

// Cargar la lista de equipos válidos para el autocompletado (datalist).
async function cargarEquipos() {
  try {
    const r = await fetch(`${API_URL}/equipos`);
    if (!r.ok) return;
    const { equipos } = await r.json();
    const lista = document.getElementById("lista-equipos");
    lista.innerHTML = equipos
      .map((nombre) => `<option value="${nombre}"></option>`)
      .join("");
  } catch {
    // Si el backend no está, el usuario todavía puede escribir a mano.
  }
}
cargarEquipos();

async function predecir() {
  const local = document.getElementById("equipoLocal").value.trim();
  const visitante = document.getElementById("equipoVisitante").value.trim();

  if (!local || !visitante) {
    detalle.innerHTML = mensaje("Enter both teams to predict.");
    return;
  }

  detalle.innerHTML = mensaje("Predicting...");

  try {
    const respuesta = await fetch(`${API_URL}/predecir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipo_local: local,
        equipo_visitante: visitante,
        es_neutral: true,
      }),
    });

    if (!respuesta.ok) {
      detalle.innerHTML = mensaje("Team not found. Check the names (in English).");
      return;
    }

    const datos = await respuesta.json();
    detalle.innerHTML = construirDetalle(datos, local, visitante);
  } catch (error) {
    detalle.innerHTML = mensaje("Connection error with the server: " + error);
  }
}

// Pequeña tarjeta para mensajes de estado/errores.
function mensaje(texto) {
  return `<div class="bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300">${texto}</div>`;
}

boton.addEventListener("click", predecir);

// Permitir predecir con la tecla Enter desde cualquiera de los dos campos.
["equipoLocal", "equipoVisitante"].forEach((id) => {
  document.getElementById(id).addEventListener("keydown", (e) => {
    if (e.key === "Enter") predecir();
  });
});
