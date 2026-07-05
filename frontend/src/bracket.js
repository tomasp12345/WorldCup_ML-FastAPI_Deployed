// src/bracket.js
import { bracket } from "./datos.js";
import { abrirModal } from "./modal.js";

// Pide a la API la predicción de un partido y devuelve su marcador probable
async function pedirPrediccion(local, visitante) {
  try {
    const respuesta = await fetch("http://localhost:8000/predecir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipo_local: local,
        equipo_visitante: visitante,
        es_neutral: true,
      }),
    });
    if (!respuesta.ok) return null;
    const datos = await respuesta.json();
    return datos.marcador_probable;   // [golesLocal, golesVisitante]
  } catch (error) {
    return null;   // si falla, devolvemos null
  }
}

export async function dibujarBracket() {
  const contenedor = document.getElementById("bracketContainer");
  contenedor.innerHTML = "<p>Cargando predicciones...</p>";

  let html = "";

  for (const ronda in bracket) {
    const partidos = bracket[ronda];
    if (partidos.length === 0) continue;

    html += `<div class="ronda mb-6"><h3 class="text-lg font-semibold text-green-400 mb-3 capitalize">${ronda}</h3>`;

    // Pedir TODAS las predicciones de esta ronda en paralelo
    const predicciones = await Promise.all(
      partidos.map(p => pedirPrediccion(p.local, p.visitante))
    );

    // Ahora dibujar cada partido con su predicción ya lista
    for (let i = 0; i < partidos.length; i++) {
      html += construirPartido(partidos[i], predicciones[i]);
    }

    html += `</div>`;
  }

    contenedor.innerHTML = html;
    contenedor.querySelectorAll(".partido").forEach(el => {
        el.addEventListener("click", () => {
            console.log("clic en partido detectado");   
            const local = el.dataset.local;
            const visitante = el.dataset.visitante;
            abrirModal(local, visitante);
        });
    });
}

function construirPartido(partido, prediccion) {
  const jugado = partido.golesLocal !== null && partido.golesVisitante !== null;
  const marcadorReal = jugado ? `${partido.golesLocal} - ${partido.golesVisitante}` : `- vs -`;
  const marcadorPredicho = prediccion ? `${prediccion[0]} - ${prediccion[1]}` : `?`;
  const claseEstado = jugado ? "partido jugado" : "partido pendiente";

  return `
    <div class="partido bg-slate-800 rounded-lg p-4 mb-3 border border-slate-700 hover:border-green-400 transition-colors"
         data-local="${partido.local}" data-visitante="${partido.visitante}">
      <div class="font-semibold text-slate-100 mb-2">
        ${partido.local} <span class="text-slate-500">vs</span> ${partido.visitante}
      </div>
      <div class="flex gap-4 text-sm">
        <span class="text-slate-400">Real: <span class="text-slate-200">${marcadorReal}</span></span>
        <span class="text-green-400">Pred: ${marcadorPredicho}</span>
      </div>
    </div>
  `;
}