/* ============================================================
   PO ARQUITETOS — components.js
   WhatsApp flutuante · Cookie Banner RGPD · GA4 consent
   Incluir em AMBAS as LPs antes de </body>
============================================================ */
(function () {
  'use strict';

  /* ════════════════════════════════════════════
     ⚠️  CONFIGURAÇÃO — SUBSTITUIR AQUI
  ════════════════════════════════════════════ */
  const CONFIG = {
    WA_NUMBER:  '351912344767',           
    WA_MSG_LEG: 'Olá, pedi uma análise de legalização e gostaria de falar convosco.',
    WA_MSG_MAD: 'Olá, pedi uma análise para projeto de casa de madeira e gostaria de falar convosco.',
    GA4_ID:     'G-37DZQBVZ5F',     
    GADS_ID:    'AW-17918640863',     
    GADS_LABEL: '808ECNuE2e8bEN-Fo-BC', 
    PRIVACY_URL: '/politica-privacidade.html',
  };
  /* ════════════════════════════════════════════ */

  // Detectar qual LP está ativa
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

    <!-- Cookie Banner RGPD -->
    <div class="cookie-banner" id="cookie-banner" role="dialog" aria-label="Política de cookies">
      <div class="cookie-inner">
        <p class="cookie-text">
          <strong>🍪 Utilizamos cookies</strong> para melhorar a sua experiência e medir o desempenho
          das nossas campanhas (Google Analytics &amp; Google Ads). Ao aceitar, consente o uso de
          cookies de análise e publicidade.
          <a href="${CONFIG.PRIVACY_URL}" target="_blank">Política de privacidade</a>
        </p>
        <div class="cookie-actions">
          <button class="cookie-btn cookie-btn--reject" id="cookie-reject">Só essenciais</button>
          <button class="cookie-btn cookie-btn--accept" id="cookie-accept">Aceitar tudo</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  /* ── COOKIE BANNER LOGIC ── */
  const banner     = document.getElementById('cookie-banner');
  const btnAccept  = document.getElementById('cookie-accept');
  const btnReject  = document.getElementById('cookie-reject');
  const COOKIE_KEY = 'po_cookie_consent';

  function loadGtag(consent) {
    // GA4
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src   = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA4_ID}`;
    document.head.appendChild(s1);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());

    // Definir consent antes de configurar
    gtag('consent', 'update', {
      analytics_storage:     consent ? 'granted' : 'denied',
      ad_storage:            consent ? 'granted' : 'denied',
      ad_personalization:    consent ? 'granted' : 'denied',
      ad_user_data:          consent ? 'granted' : 'denied',
    });

    gtag('config', CONFIG.GA4_ID, { anonymize_ip: true });
    if (consent) gtag('config', CONFIG.GADS_ID);
  }

  function hideBanner() {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  }

  function setConsent(accepted) {
    localStorage.setItem(COOKIE_KEY, accepted ? 'granted' : 'denied');
    loadGtag(accepted);
    hideBanner();
  }

  btnAccept.addEventListener('click', () => setConsent(true));
  btnReject.addEventListener('click', () => setConsent(false));

  // Verificar se já respondeu
  const saved = localStorage.getItem(COOKIE_KEY);
  if (saved) {
    loadGtag(saved === 'granted');
    // Banner não aparece
  } else {
    // Mostrar banner após 1.5s
    setTimeout(() => {
      if (banner) banner.classList.add('visible');
    }, 1500);

    // Consent mode default — bloqueado até resposta
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('consent', 'default', {
      analytics_storage:  'denied',
      ad_storage:         'denied',
      ad_personalization: 'denied',
      ad_user_data:       'denied',
      wait_for_update:    500,
    });
  }

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
  // Mostrar sempre após 8s mesmo sem interação
  setTimeout(showBubble, 8000);

})();
