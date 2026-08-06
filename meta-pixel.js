/* ───────────────────────────────────────────────────────────
   META PIXEL — Pedro do Ó Arquitetos
   RGPD: só dispara depois do consentimento de marketing
   (integra com o cookie-consent.js já existente, chave
   localStorage 'cookie_consent_v1'). Na página /obrigado
   dispara também o evento de conversão "Lead".
─────────────────────────────────────────────────────────── */
(function () {
  var PIXEL_ID = '1539449841292506';
  if (!PIXEL_ID || PIXEL_ID.indexOf('__') === 0) return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('consent', 'revoke');
  fbq('init', PIXEL_ID);

  function marketingGranted(){
    try { var s = JSON.parse(localStorage.getItem('cookie_consent_v1') || '{}');
      return !!(s && (s.state ? s.state.marketing : s.marketing)); }
    catch (e) { return false; }
  }
  function isObrigado(){ return /(?:^|\/)obrigado\/?$/.test(location.pathname); }
  function grant(){
    fbq('consent', 'grant');
    fbq('track', 'PageView');
    if (isObrigado()) fbq('track', 'Lead');
  }

  if (marketingGranted()) { grant(); }
  else { var tries=0, iv=setInterval(function(){
      if (marketingGranted()) { grant(); clearInterval(iv); }
      else if (++tries > 120) { clearInterval(iv); }
    }, 1000); }

  window.fbqLead = function(){ if (window.fbq && marketingGranted()) fbq('track','Lead'); };
})();
