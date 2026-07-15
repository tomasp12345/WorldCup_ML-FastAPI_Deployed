// src/config.js
// URL del backend. En local usa localhost; en producción, Vercel inyecta
// VITE_API_URL (la URL del backend en Render) al hacer el build.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
