/* ============================================================
   PO ARQUITETOS — Cookie Consent Banner
   Conforme Lei 41/2004 + Lei 16/2022 + RGPD + Orientações CNPD
   - Opt-in granular (Necessárias / Analíticas / Marketing)
   - "Rejeitar" tão visível como "Aceitar"
   - GTM (T99H7W3X) só carrega se Analíticas OU Marketing forem true
   - localStorage 6 meses; revogação via window.cookieConsent.openPanel()
   [Criado 29-Mai-2026]
============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY  = 'cookie_consent_v1';
  const GTM_ID       = 'GTM-T99H7W3X';
  const EXPIRY_DAYS  = 180; // 6 meses

  /* ── Helpers ── */
  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.timestamp || (Date.now() - data.timestamp) > EXPIRY_DAYS * 86400000) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch (e) { return null; }
  }

  function saveConsent(state) {
    const data = Object.assign({ timestamp: Date.now() }, state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* ── Carregar GTM (só se houver consentimento analytics ou marketing) ── */
  function loadGTM() {
    if (window._gtm_loaded) return;
    window._gtm_loaded = true;
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
  }

  /* ── Aplicar consentimento (Consent Mode v2 + carregar GTM) ── */
  function applyConsent(state) {
    window.dataLayer = window.dataLayer || [];

    // Google Consent Mode v2
    window.dataLayer.push({
      event: 'cookie_consent_update',
      analytics_storage: state.analytics ? 'granted' : 'denied',
      ad_storage: state.marketing ? 'granted' : 'denied',
      ad_user_data: state.marketing ? 'granted' : 'denied',
      ad_personalization: state.marketing ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });

    if (state.analytics || state.marketing) {
      loadGTM();
    }
  }

  /* ── Render do banner ── */
  function renderBanner() {
    if (document.getElementById('cc-banner')) return;
    const html = `
      <div id="cc-banner" class="cc-banner" role="dialog" aria-labelledby="cc-title" aria-describedby="cc-desc">
        <div class="cc-content">
          <h3 id="cc-title">A sua privacidade conta.</h3>
          <p id="cc-desc">
            Utilizamos cookies estritamente necessárias para o funcionamento do site. Com o seu consentimento, também usamos cookies analíticas e de marketing para melhorar o serviço e medir campanhas. Pode aceitar, rejeitar ou configurar as suas preferências. Saiba mais na <a href="/cookies">Política de Cookies</a> e na <a href="/privacidade">Política de Privacidade</a>.
          </p>
          <div class="cc-actions">
            <button type="button" class="cc-btn cc-btn--secondary" data-cc="reject">Rejeitar tudo</button>
            <button type="button" class="cc-btn cc-btn--secondary" data-cc="configure">Configurar</button>
            <button type="button" class="cc-btn cc-btn--primary" data-cc="accept">Aceitar tudo</button>
          </div>
        </div>
      </div>
      <div id="cc-panel" class="cc-panel" role="dialog" aria-labelledby="cc-panel-title" hidden>
        <div class="cc-panel-content">
          <h3 id="cc-panel-title">Preferências de cookies</h3>
          <p>Pode escolher individualmente que categorias de cookies aceita. As cookies estritamente necessárias são sempre carregadas porque são essenciais ao funcionamento do site.</p>
          <div class="cc-category">
            <label class="cc-switch">
              <input type="checkbox" id="cc-cat-necessary" checked disabled />
              <span class="cc-slider"></span>
            </label>
            <div class="cc-cat-info">
              <strong>Estritamente Necessárias</strong>
              <small>Permitem o funcionamento básico do site (sessão, consentimento). Não podem ser desativadas.</small>
            </div>
          </div>
          <div class="cc-category">
            <label class="cc-switch">
              <input type="checkbox" id="cc-cat-analytics" />
              <span class="cc-slider"></span>
            </label>
            <div class="cc-cat-info">
              <strong>Analíticas</strong>
              <small>Google Analytics — ajudam-nos a perceber como o site é utilizado, de forma agregada e anónima.</small>
            </div>
          </div>
          <div class="cc-category">
            <label class="cc-switch">
              <input type="checkbox" id="cc-cat-marketing" />
              <span class="cc-slider"></span>
            </label>
            <div class="cc-cat-info">
              <strong>Marketing</strong>
              <small>Google Ads — medem a eficácia de campanhas publicitárias e permitem remarketing.</small>
            </div>
          </div>
          <div class="cc-actions">
            <button type="button" class="cc-btn cc-btn--secondary" data-cc="cancel">Cancelar</button>
            <button type="button" class="cc-btn cc-btn--primary" data-cc="save">Guardar preferências</button>
          </div>
        </div>
      </div>
    `;
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    container.querySelector('[data-cc="accept"]').addEventListener('click', () => {
      const state = { necessary: true, analytics: true, marketing: true };
      saveConsent(state); applyConsent(state); hideBanner();
    });
    container.querySelector('[data-cc="reject"]').addEventListener('click', () => {
      const state = { necessary: true, analytics: false, marketing: false };
      saveConsent(state); applyConsent(state); hideBanner();
    });
    container.querySelector('[data-cc="configure"]').addEventListener('click', () => {
      openPanel();
    });
    container.querySelector('[data-cc="cancel"]').addEventListener('click', () => {
      closePanel();
    });
    container.querySelector('[data-cc="save"]').addEventListener('click', () => {
      const state = {
        necessary: true,
        analytics: !!document.getElementById('cc-cat-analytics').checked,
        marketing: !!document.getElementById('cc-cat-marketing').checked,
      };
      saveConsent(state); applyConsent(state); closePanel(); hideBanner();
    });
  }

  function openPanel() {
    const existing = getConsent();
    if (existing) {
      document.getElementById('cc-cat-analytics').checked = !!existing.analytics;
      document.getElementById('cc-cat-marketing').checked = !!existing.marketing;
    }
    document.getElementById('cc-panel').hidden = false;
  }
  function closePanel() {
    const panel = document.getElementById('cc-panel');
    if (panel) panel.hidden = true;
  }
  function hideBanner() {
    const b = document.getElementById('cc-banner');
    if (b) b.style.display = 'none';
  }
  function showBanner() {
    renderBanner();
    document.getElementById('cc-banner').style.display = '';
  }

  /* ── API pública ── */
  window.cookieConsent = {
    openPanel: function () { if (!document.getElementById('cc-panel')) renderBanner(); openPanel(); },
    getConsent: getConsent,
    reset: function () { localStorage.removeItem(STORAGE_KEY); showBanner(); },
  };

  /* ── Inicialização ── */
  // Definir Consent Mode v2 default (denied) antes de qualquer GTM
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  document.addEventListener('DOMContentLoaded', function () {
    const existing = getConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      showBanner();
    }
  });

})();
