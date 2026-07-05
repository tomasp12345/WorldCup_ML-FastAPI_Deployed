// src/main.js
// Página de inicio: dibuja el bracket. El clic en un partido abre el modal (ver bracketviewer.js).
import "./style.css";
import { dibujarBracketReal } from "./bracketviewer.js";

// Esperar a que el HTML cargue completamente antes de dibujar el bracket
window.addEventListener("DOMContentLoaded", () => {
  dibujarBracketReal();
});
