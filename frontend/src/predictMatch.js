// src/predictMatch.js

export function construirDetalle(datos, local, visitante) {
  const [gl, gv] = datos.marcador_probable;

  let html = `<h3>${local} vs ${visitante}</h3>`;
  html += `<p><strong>Marcador más probable:</strong> ${gl} - ${gv} 
           (${(datos.prob_marcador * 100).toFixed(1)}%)</p>`;
  html += `<p><strong>Gana ${local}:</strong> ${pct(datos.gana_local)} | 
           <strong>Empate:</strong> ${pct(datos.empate)} | 
           <strong>Gana ${visitante}:</strong> ${pct(datos.gana_visitante)}</p>`;

  html += `<h4>Goles por equipo</h4>`;
  html += `<p><strong>${local}:</strong> +0.5: ${pct(datos.over_local["over_0.5"])}, 
           +1.5: ${pct(datos.over_local["over_1.5"])}, 
           +2.5: ${pct(datos.over_local["over_2.5"])}</p>`;
  html += `<p><strong>${visitante}:</strong> +0.5: ${pct(datos.over_visitante["over_0.5"])}, 
           +1.5: ${pct(datos.over_visitante["over_1.5"])}, 
           +2.5: ${pct(datos.over_visitante["over_2.5"])}</p>`;

  html += `<h4>Goles totales del partido</h4>`;
  html += `<p>+1.5: ${pct(datos.over_total["over_1.5"])}, 
           +2.5: ${pct(datos.over_total["over_2.5"])}, 
           +3.5: ${pct(datos.over_total["over_3.5"])}</p>`;

  html += `<h4>Matriz de marcadores</h4>`;
  html += construirMatriz(datos.matriz, local, visitante);

  return html;
}

function pct(valor) {
  return (valor * 100).toFixed(1) + "%";
}

function construirMatriz(matriz, local, visitante) {
  let tabla = `<table border="1"><tr><th></th>`;
  for (let j = 0; j < matriz.length; j++) {
    tabla += `<th>${visitante} ${j}</th>`;
  }
  tabla += `</tr>`;
  for (let i = 0; i < matriz.length; i++) {
    tabla += `<tr><th>${local} ${i}</th>`;
    for (let j = 0; j < matriz[i].length; j++) {
      const prob = (matriz[i][j] * 100).toFixed(1);
      tabla += `<td>${prob}%</td>`;
    }
    tabla += `</tr>`;
  }
  tabla += `</table>`;
  return tabla;
}