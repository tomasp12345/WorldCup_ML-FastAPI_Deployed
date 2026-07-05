import "brackets-viewer/dist/brackets-viewer.min.css";
import "brackets-viewer/dist/brackets-viewer.min.js";
import { bracket } from "./datos.js";
import { abrirModal } from "./modal.js";

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
    matches.push({
      id: matchId++, stage_id: 0, group_id: 0, round_id: indiceRonda, number: n + 1,
      child_count: 0, status: jugado ? 4 : 2,
      opponent1: { id: idDe(p.local), score: jugado ? p.golesLocal : undefined,
        result: jugado ? (p.golesLocal > p.golesVisitante ? "win" : "loss") : undefined },
      opponent2: { id: idDe(p.visitante), score: jugado ? p.golesVisitante : undefined,
        result: jugado ? (p.golesVisitante > p.golesLocal ? "win" : "loss") : undefined },
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

  const callback = {
    onMatchClicked: (match) => {
      if (match.opponent1.id === null || match.opponent2.id === null) return;
      const local = equipos[match.opponent1.id];
      const visitante = equipos[match.opponent2.id];
    },
  };

  window.bracketsViewer.onMatchClicked = (match) => {
  if (match.opponent1.id === null || match.opponent2.id === null) return;
  const local = equipos[match.opponent1.id];
  const visitante = equipos[match.opponent2.id];
  abrirModal(local, visitante);
  };

  const config = {
  ...callback,
  customRoundName: (info) => {
    // info.roundNumber es el número de ronda (1, 2, 3...)
    const nombres = ["Round of 16", "Round of 8", "Quarterfinals", "Semifinals"];
    return nombres[info.roundNumber - 1] || "Ronda";
  },
};

  // Renderizar cada mitad en su contenedor
    window.bracketsViewer.render(generarDatosMitad(izq, equipos),
        { selector: "#bracket-izq", ...config });
    window.bracketsViewer.render(generarDatosMitad(der, equipos),
        { selector: "#bracket-der", ...config });

    // La final al centro: una tarjeta simple (un partido por definir)
  const contenedorFinal = document.getElementById("bracket-final");
  contenedorFinal.innerHTML = `
    <div class="text-center">
      <div class="text-green-400 font-semibold mb-2 text-sm">FINAL</div>
      <div class="bg-slate-800 border border-slate-600 rounded-lg p-4 w-40">
        <div class="text-slate-400 py-2 border-b border-slate-700">Por definir</div>
        <div class="text-slate-400 py-2">Por definir</div>
      </div>
    </div>
  `;
}