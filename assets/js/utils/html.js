// Helpers de escapado compartidos. Se cargan antes que cualquier consumidor
// (ver el <script> en templates/index.template.html) y se exponen en window
// porque el resto de la app todavía son scripts clásicos sin módulos.
//
// Existían tres copias de escapeHtml (leaderboard.js, auth-backend.js,
// firebase-client.js) y dos de ellas usaban el truco de createTextNode, que
// escapa &, < y > pero NO comillas. Como se usaban dentro de atributos
// (src="${...}"), un valor con " se escapaba del atributo. Una sola
// implementación, correcta también en contexto de atributo.
(function () {
  "use strict";

  const HTML_ENTITIES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  // Seguro tanto en contenido de texto como dentro de un atributo entrecomillado.
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
  }

  // Solo https:// para URLs que terminan en src/href. Cualquier otra cosa
  // (javascript:, data:, protocolo relativo) cae al avatar por defecto.
  function safeHttpsUrl(url, fallback = "/default-avatar.png") {
    if (typeof url !== "string" || !url.startsWith("https://")) return fallback;
    return escapeHtml(url);
  }

  window.hskEscapeHtml = escapeHtml;
  window.hskSafeHttpsUrl = safeHttpsUrl;
})();
