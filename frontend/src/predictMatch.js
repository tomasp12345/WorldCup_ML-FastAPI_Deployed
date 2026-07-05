// src/predictMatch.js
// Arma el HTML del detalle de una predicción. Solo presentación: no cambia ningún cálculo.

export function construirDetalle(datos, local, visitante) {
  const [gl, gv] = datos.marcador_probable;

  let html = `
    <div class="space-y-5">
      <div>
        <h3 class="text-xl font-bold text-slate-100">${local} <span class="text-slate-500">vs</span> ${visitante}</h3>
        <p class="text-slate-400 text-sm mt-1">Most likely score:
          <span class="text-emerald-400 font-semibold">${gl} - ${gv}</span>
          <span class="text-slate-500">(${pct(datos.prob_marcador)})</span>
        </p>
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">
        ${resultadoCard(`${local} win`, datos.gana_local, "text-emerald-400")}
        ${resultadoCard("Draw", datos.empate, "text-yellow-400")}
        ${resultadoCard(`${visitante} win`, datos.gana_visitante, "text-sky-400")}
      </div>

      <div>
        <h4 class="text-sm font-semibold text-slate-300 mb-2">Goals per team</h4>
        <div class="space-y-1 text-sm">
          ${filaOver(local, datos.over_local)}
          ${filaOver(visitante, datos.over_visitante)}
        </div>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-slate-300 mb-2">Total match goals</h4>
        <p class="text-sm text-slate-300">
          ${chip("+1.5", datos.over_total["over_1.5"])}
          ${chip("+2.5", datos.over_total["over_2.5"])}
          ${chip("+3.5", datos.over_total["over_3.5"])}
        </p>
      </div>

      <div>
        <h4 class="text-sm font-semibold text-slate-300 mb-2">Score matrix</h4>
        ${construirMatriz(datos.matriz, local, visitante, gl, gv)}
      </div>
    </div>
  `;

  return html;
}

function pct(valor) {
  return (valor * 100).toFixed(1) + "%";
}

// Tarjeta grande para gana / empate / gana.
function resultadoCard(titulo, valor, colorClase) {
  return `
    <div class="bg-slate-900/60 border border-slate-700 rounded-lg py-3 px-2">
      <div class="text-[11px] uppercase tracking-wide text-slate-500 truncate">${titulo}</div>
      <div class="text-lg font-bold ${colorClase}">${pct(valor)}</div>
    </div>`;
}

// Línea de over/under por equipo.
function filaOver(nombre, over) {
  return `
    <div class="flex items-center justify-between bg-slate-900/40 rounded px-3 py-1.5">
      <span class="text-slate-300 font-medium">${nombre}</span>
      <span class="text-slate-400">
        ${chip("+0.5", over["over_0.5"])}
        ${chip("+1.5", over["over_1.5"])}
        ${chip("+2.5", over["over_2.5"])}
      </span>
    </div>`;
}

// Etiqueta compacta "umbral: prob".
function chip(etiqueta, valor) {
  return `<span class="inline-block bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300 mr-1">${etiqueta}: <span class="text-green-400">${pct(valor)}</span></span>`;
}

// Matriz de probabilidades por marcador. Resalta el marcador más probable.
function construirMatriz(matriz, local, visitante, glMax, gvMax) {
  let tabla = `<div class="overflow-x-auto"><table class="text-base border-collapse">`;
  tabla += `<tr><th class="p-2.5 text-slate-500 font-medium"></th>`;
  for (let j = 0; j < matriz.length; j++) {
    tabla += `<th class="p-2.5 text-slate-400 font-medium whitespace-nowrap">${visitante} ${j}</th>`;
  }
  tabla += `</tr>`;
  for (let i = 0; i < matriz.length; i++) {
    tabla += `<tr><th class="p-2.5 text-slate-400 font-medium text-left whitespace-nowrap">${local} ${i}</th>`;
    for (let j = 0; j < matriz[i].length; j++) {
      const prob = (matriz[i][j] * 100).toFixed(1);
      const esMax = i === glMax && j === gvMax;
      const clase = esMax
        ? "bg-green-500/20 text-green-300 font-semibold"
        : "text-slate-400";
      tabla += `<td class="p-2.5 text-center border border-slate-700/60 ${clase}">${prob}%</td>`;
    }
    tabla += `</tr>`;
  }
  tabla += `</table></div>`;
  return tabla;
}
