/* ============================================================
   PO ARQUITETOS — Legalização — script.js
   FormSubmit AJAX — trocar EMAIL pelo email real do Pedro
============================================================ */
(function () {
  'use strict';

  const FORM_EMAIL = 'geral@pedrodooarquitetos.pt'; // ← alterar se necessário

  /* ── SCROLL REVEAL ── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ── FAQ — handled via inline onclick in HTML ── */

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── NAVBAR SHADOW ── */
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 20 ? '0 2px 24px rgba(0,0,0,.4)' : 'none';
  }, { passive: true });

  /* ── FORM — FormSubmit AJAX ── */
  const form       = document.getElementById('contact-form');
  const successBox = document.getElementById('form-success');
  const submitBtn  = form ? form.querySelector('[type=submit]') : null;

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      /* Validação */
      let valid = true;
      form.querySelectorAll('[required]').forEach((f) => {
        f.style.borderColor = '';
        if (!f.value.trim()) { f.style.borderColor = '#c0392b'; valid = false; }
      });
      if (!valid) return;

      /* Loading state */
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'A enviar…';
      submitBtn.disabled = true;

      /* Recolher dados do formulário */
      const payload = {
        _subject:    '🏠 Nova lead — Legalização de Imóvel | PO Arquitetos',
        _template:   'table',
        _captcha:    'false',
        nome:        form.nome?.value        || '',
        telefone:    form.telefone?.value    || '',
        email:       form.email?.value       || '',
        localizacao: form.localizacao?.value || '',
        tipo:        form.tipo?.value        || '',
        urgencia:    form.urgencia?.value    || '',
        mensagem:    form.mensagem?.value    || '',
        _origem:     'LP Legalização',
      };

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success === 'true' || data.success === true) {
          // Disparar conversão Google Ads — só aqui, só após submit real com sucesso
          if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
              send_to: 'AW-17918640863/808ECNuE2e8bEN-Fo-BC'
            });
          }
          // Redirect para página de obrigado (GA4 conta pageview, Ads já contou acima)
          window.location.href = '/obrigado.html';
        } else {
          throw new Error('FormSubmit returned failure');
        }
      } catch (err) {
        console.error('Erro no envio:', err);
        submitBtn.textContent = 'Erro — tente novamente';
        submitBtn.style.background = '#c0392b';
        submitBtn.disabled = false;
        setTimeout(() => {
          submitBtn.textContent = origText;
          submitBtn.style.background = '';
        }, 3000);
      }
    });
  }

})();
