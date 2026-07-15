// src/modal.js
import { construirDetalle } from "./predictMatch.js";  // reutilizamos tu función
import { API_URL } from "./config.js";

const overlay = document.getElementById("modalOverlay");
const contenido = document.getElementById("modalDetalle");
const botonCerrar = document.getElementById("cerrarModal");

// Abrir el modal con el detalle de un partido
export async function abrirModal(local, visitante) {
  overlay.classList.remove("oculto");   // mostrar el modal
  contenido.innerHTML = '<p class="text-slate-400">Loading...</p>';

  try {
    const respuesta = await fetch(`${API_URL}/predecir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipo_local: local, equipo_visitante: visitante, es_neutral: true }),
    });
    const datos = await respuesta.json();
    contenido.innerHTML = construirDetalle(datos, local, visitante);
  } catch (error) {
    contenido.innerHTML = '<p class="text-slate-400">Could not load the details.</p>';
  }
}

// Cerrar el modal
function cerrarModal() {
  overlay.classList.add("oculto");   // ocultar de nuevo
}

// Cerrar al hacer clic en la X o en el fondo oscuro
botonCerrar.addEventListener("click", cerrarModal);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) cerrarModal();  // solo si clic en el fondo, no en la caja
});