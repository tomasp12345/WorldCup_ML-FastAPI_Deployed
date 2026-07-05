// src/main.js
import "./style.css";
import { construirDetalle } from "./predictMatch.js";
import { dibujarBracketReal } from "./bracketviewer.js";

// Esperar a que el HTML cargue completamente antes de dibujar el bracket
window.addEventListener("DOMContentLoaded", () => {
  dibujarBracketReal();
});

const boton = document.getElementById("botonPredecir");
const detalle = document.getElementById("detallePartido");

boton.addEventListener("click", async () => {
  const local = document.getElementById("equipoLocal").value;
  const visitante = document.getElementById("equipoVisitante").value;

  detalle.innerHTML = "<p>Prediciendo...</p>";

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

    if (!respuesta.ok) {
      detalle.innerHTML = "<p>Equipo no encontrado. Revisa los nombres.</p>";
      return;
    }

    const datos = await respuesta.json();
    detalle.innerHTML = construirDetalle(datos, local, visitante);
  } catch (error) {
    detalle.innerHTML = "<p>Error de conexión: " + error + "</p>";
  }
});
