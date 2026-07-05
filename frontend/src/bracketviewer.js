import "brackets-viewer/dist/brackets-viewer.min.css";
import "brackets-viewer/dist/brackets-viewer.min.js";
import { bracket } from "./datos.js";
import { abrirModal } from "./modal.js";
import { urlBandera } from "./banderas.js";

// Reunir todos los equipos una sola vez (compartido por ambas mitades)
function construirEquipos() {
  const equiposSet = new Set();
  for (const ronda in bracket) {
    for (const p of bracket[ronda]) {
      equiposSet.add(p.local);
      equiposSet.add(p.visitante);
    }
  }
  return [...equiposSet];
}

// Genera los datos (formato librería) para UNA mitad de dieciseisavos
function generarDatosMitad(partidosMitad, equipos) {
  const idDe = (nombre) => equipos.indexOf(nombre);
  let matchId = 0;
  const matches = [];
  let indiceRonda = 0;

  // Ronda 1 de esta mitad: los partidos reales que le tocan
  partidosMitad.forEach((p, n) => {
    const jugado = p.golesLocal !== null && p.golesVisitante !== null;
    // En empate NO marcamos win/loss (se define por penales): lo dejamos sin color
    // de perdedor y luego el marcador se pinta de amarillo (ver marcarEmpates()).
    const resultado = (goles, golesRival) => {
      if (goles > golesRival) return "win";
      if (goles < golesRival) return "loss";
      return undefined; // empate
    };
    matches.push({
      id: matchId++, stage_id: 0, group_id: 0, round_id: indiceRonda, number: n + 1,
      child_count: 0, status: jugado ? 4 : 2,
      opponent1: { id: idDe(p.local), score: jugado ? p.golesLocal : undefined,
        result: jugado ? resultado(p.golesLocal, p.golesVisitante) : undefined },
      opponent2: { id: idDe(p.visitante), score: jugado ? p.golesVisitante : undefined,
        result: jugado ? resultado(p.golesVisitante, p.golesLocal) : undefined },
    });
  });
  indiceRonda++;

  // Placeholders para las rondas siguientes de esta mitad (hasta llegar a 1)
  let enEstaRonda = Math.floor(partidosMitad.length / 2);
  while (enEstaRonda >= 1) {
    for (let n = 0; n < enEstaRonda; n++) {
      matches.push({
        id: matchId++, stage_id: 0, group_id: 0, round_id: indiceRonda, number: n + 1,
        child_count: 0, status: 2,
        opponent1: { id: null }, opponent2: { id: null },
      });
    }
    indiceRonda++;
    enEstaRonda = Math.floor(enEstaRonda / 2);
  }

  return {
    stages: [{ id: 0, tournament_id: 0, name: "WC", type: "single_elimination", number: 1, settings: {} }],
    matches,
    matchGames: [],
    participants: equipos.map((nombre, i) => ({ id: i, tournament_id: 0, name: nombre })),
  };
}

export function dibujarBracketReal() {
  const equipos = construirEquipos();
  const dieciseisavos = bracket.dieciseisavos;

  // Partir en dos mitades: primeros 8 y últimos 8
  const mitad = Math.ceil(dieciseisavos.length / 2);
  const izq = dieciseisavos.slice(0, mitad);
  const der = dieciseisavos.slice(mitad);

  window.bracketsViewer.onMatchClicked = (match) => {
    if (match.opponent1.id === null || match.opponent2.id === null) return;
    const local = equipos[match.opponent1.id];
    const visitante = equipos[match.opponent2.id];
    abrirModal(local, visitante);
  };

  const config = {
    customRoundName: (info) => {
      const nombres = ["Round of 16", "Round of 8", "Quarterfinals", "Semifinals"];
      return nombres[info.roundNumber - 1] || "Round";
    },
  };

  // Renderizar cada mitad en su contenedor
  window.bracketsViewer.render(generarDatosMitad(izq, equipos),
    { selector: "#bracket-izq", ...config });
  window.bracketsViewer.render(generarDatosMitad(der, equipos),
    { selector: "#bracket-der", ...config });

  // Poner la bandera de cada país. Lo hacemos por post-proceso (y no con
  // setParticipantImages) porque esa API de la librería deja los <img> con
  // src="undefined" por un problema de timing. Aquí es 100% fiable.
  pintarBanderas(equipos);

  // Pintar de amarillo los empates (marcadores iguales = se deciden por penales).
  marcarEmpates();

  // La final al centro: una tarjeta simple (un partido por definir)
  const contenedorFinal = document.getElementById("bracket-final");
  contenedorFinal.innerHTML = `
    <div class="text-center">
      <div class="text-2xl mb-1">🏆</div>
      <div class="text-emerald-400 font-bold tracking-widest mb-2 text-[11px]">FINAL</div>
      <div class="bg-[#111a2e] border border-[#24314a] rounded-lg w-36 shadow-lg overflow-hidden">
        <div class="text-slate-500 py-2 px-3 border-b border-[#24314a] text-xs">TBD</div>
        <div class="text-slate-500 py-2 px-3 text-xs">TBD</div>
      </div>
    </div>
  `;

  // Escalar el bracket para que SIEMPRE quepa en el ancho de la pantalla.
  ajustarEscala();
  window.addEventListener("resize", ajustarEscala);
  // Reajustar cuando cargue la fuente Inter (cambia un poco el ancho del texto).
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarEscala);
}

// Cada .participant tiene data-participant-id: lo usamos para colocarle su bandera.
function pintarBanderas(equipos) {
  document.querySelectorAll(".brackets-viewer .participant[data-participant-id]").forEach((p) => {
    const id = parseInt(p.getAttribute("data-participant-id"), 10);
    const url = urlBandera(equipos[id]);
    const nombreEl = p.querySelector(".name");
    if (!url || !nombreEl) return;
    let img = nombreEl.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      nombreEl.prepend(img);
    }
    img.src = url;
  });
}

// Ajusta el bracket al ancho de la pantalla usando zoom (encoge la caja de verdad,
// así nunca se desborda ni deja huecos). Chrome/Edge/Safari lo soportan bien.
function ajustarEscala() {
  const escalable = document.getElementById("bracket-escalable");
  if (!escalable) return;
  escalable.style.zoom = "1"; // reset para medir el ancho natural
  const natural = escalable.scrollWidth;
  // Ancho REAL del contenedor donde vive el bracket (ya descuenta el padding
  // del <main>). Un pequeño margen evita el scrollbar por redondeos.
  const disponible = escalable.parentElement.clientWidth - 4;
  const escala = Math.min(1, disponible / natural);
  escalable.style.zoom = String(escala);
}

// Recorre las cajas de partido ya renderizadas y marca las que terminaron en
// empate (ambos marcadores iguales y ya jugados) para pintarlas de amarillo por CSS.
function marcarEmpates() {
  document.querySelectorAll(".brackets-viewer .opponents").forEach((caja) => {
    const marcadores = caja.querySelectorAll(".participant .result");
    if (marcadores.length !== 2) return;
    const a = marcadores[0].textContent.trim();
    const b = marcadores[1].textContent.trim();
    if (a !== "" && a !== "-" && a === b) {
      caja.classList.add("empate");
    }
  });
}