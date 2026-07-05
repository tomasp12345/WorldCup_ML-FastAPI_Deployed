// src/datos.js
// Diccionario de partidos por ronda. Editas esto a mano conforme avanza el Mundial.
// golesLocal / golesVisitante en null = partido no jugado (saldrá gris).

export const bracket = {
  dieciseisavos: [
    { local: "Germany", visitante: "Paraguay", golesLocal: 1, golesVisitante: 1 },
    { local: "France", visitante: "Sweden", golesLocal: 3, golesVisitante: 0 },
    { local: "South Africa", visitante: "Canada", golesLocal: 0, golesVisitante: 1 },
    { local: "Netherlands", visitante: "Morocco", golesLocal: 1, golesVisitante: 1 },
    { local: "Portugal", visitante: "Croatia", golesLocal: 2, golesVisitante: 1 },
    { local: "Spain", visitante: "Austria", golesLocal: 3, golesVisitante: 0 },
    { local: "United States", visitante: "Bosnia and Herzegovina", golesLocal: 2, golesVisitante: 0 },
    { local: "Belgium", visitante: "Senegal", golesLocal: 3, golesVisitante: 2 },
    { local: "Brazil", visitante: "Japan", golesLocal: 2, golesVisitante: 1 },
    { local: "Ivory Coast", visitante: "Norway", golesLocal: 1, golesVisitante: 2 },
    { local: "Mexico", visitante: "Ecuador", golesLocal: 2, golesVisitante: 0 },
    { local: "England", visitante: "DR Congo", golesLocal: 2, golesVisitante: 1 },
    { local: "Argentina", visitante: "Cape Verde", golesLocal: null, golesVisitante: null },
    { local: "Australia", visitante: "Egypt", golesLocal: 1, golesVisitante: 1 },
    { local: "Switzerland", visitante: "Algeria", golesLocal: 2, golesVisitante: 0 },
    { local: "Colombia", visitante: "Ghana", golesLocal: null, golesVisitante: null }
    // agrega el resto de dieciseisavos aquí
  ],
  octavos: [],
  cuartos: [],
  semifinales: [],
  final: [],
};