/* ============================================================
   PO ARQUITETOS — components.js
   WhatsApp flutuante (apenas)

   [Atualizado 9-Jun-2026]
   O banner de cookies + injeção do GTM/GA4 foi movido para
   cookie-consent.js (Google Consent Mode v2, opt-in granular
   com 3 botões Aceitar/Rejeitar/Configurar, CNPD-compliant).
   Este ficheiro mantém apenas o WhatsApp flutuante.
============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    WA_NUMBER:  '351912344767',
    WA_MSG_LEG: 'Olá, pedi uma análise de legalização e gostaria de falar convosco.',
    WA_MSG_MAD: 'Olá, pedi uma análise para projeto de casa de madeira e gostaria de falar convosco.',
  };

  const isMadeira = document.title.toLowerCase().includes('madeira');
  const waMsg     = isMadeira ? CONFIG.WA_MSG_MAD : CONFIG.WA_MSG_LEG;
  const waUrl     = `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  /* ── INJETAR HTML ── */
  const html = `
    <!-- WhatsApp Flutuante -->
    <div class="wa-float" id="wa-float">
      <div class="wa-bubble">Fale connosco agora 👋</div>
      <a class="wa-btn" href="${waUrl}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.61 1.832 6.512L4 29l7.695-1.808A11.94 11.94 0 0016 28c6.627 0 12-5.373 12-12S22.627 3 16 3z" fill="white"/>
          <path d="M22.406 19.594c-.307-.154-1.816-.896-2.097-.998-.281-.102-.486-.154-.69.154-.204.307-.793.998-.972 1.203-.179.205-.358.23-.665.077-.307-.154-1.297-.478-2.47-1.525-.913-.815-1.529-1.82-1.708-2.127-.179-.307-.019-.473.135-.626.138-.137.307-.358.46-.537.154-.18.205-.307.307-.512.102-.205.051-.384-.026-.537-.077-.154-.69-1.664-.946-2.278-.25-.598-.503-.516-.69-.526l-.588-.01c-.204 0-.537.077-.818.384-.281.307-1.073 1.049-1.073 2.559s1.099 2.969 1.252 3.174c.154.204 2.164 3.305 5.243 4.634.733.316 1.305.505 1.75.646.735.234 1.404.201 1.933.122.59-.088 1.816-.742 2.073-1.459.256-.717.256-1.332.179-1.459-.077-.128-.281-.205-.588-.359z" fill="#25D366"/>
        </svg>
      </a>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  /* ── WA BUBBLE — mostrar após 4s de inatividade ── */
  const waFloat = document.getElementById('wa-float');
  let waTimer;
  function showBubble() {
    if (waFloat) waFloat.classList.add('show-bubble');
  }
  function resetBubbleTimer() {
    clearTimeout(waTimer);
    waTimer = setTimeout(showBubble, 4000);
  }
  ['scroll', 'mousemove', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, resetBubbleTimer, { passive: true, once: true })
  );
  setTimeout(showBubble, 8000);

})();
