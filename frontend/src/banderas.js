// src/banderas.js
// Devuelve la bandera de cada país como archivo estático desde /public/flags/.
// Son archivos locales del proyecto: no dependen de internet ni de node_modules.

const CODIGOS = {
  Germany: "de",
  Paraguay: "py",
  France: "fr",
  Sweden: "se",
  "South Africa": "za",
  Canada: "ca",
  Netherlands: "nl",
  Morocco: "ma",
  Portugal: "pt",
  Croatia: "hr",
  Spain: "es",
  Austria: "at",
  "United States": "us",
  "Bosnia and Herzegovina": "ba",
  Belgium: "be",
  Senegal: "sn",
  Brazil: "br",
  Japan: "jp",
  "Ivory Coast": "ci",
  Norway: "no",
  Mexico: "mx",
  Ecuador: "ec",
  England: "gb-eng",
  "DR Congo": "cd",
  Argentina: "ar",
  "Cape Verde": "cv",
  Australia: "au",
  Egypt: "eg",
  Switzerland: "ch",
  Algeria: "dz",
  Colombia: "co",
  Ghana: "gh",
};

// Devuelve la URL local de la bandera de un país, o "" si no está mapeado.
export function urlBandera(nombre) {
  const codigo = CODIGOS[nombre];
  return codigo ? `/flags/${codigo}.svg` : "";
}
