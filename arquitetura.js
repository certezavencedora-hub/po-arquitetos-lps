/* ============================================================
   PO ARQUITETOS — Arquitetura Residencial — arquitetura.js
   FormSubmit AJAX · Google Ads via GTM dataLayer
============================================================ */
(function () {
  'use strict';

  const FORM_EMAIL  = 'geral@pedrodooarquitetos.pt';
  const GADS_LABEL  = 'AW-17918640863/808ECNuE2e8bEN-Fo-BC';

  /* ── SCROLL REVEAL ── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ── FAQ ── */
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

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

  /* ── FORMULÁRIO — FormSubmit AJAX ── */
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

      /* Loading */
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'A enviar…';
      submitBtn.disabled = true;

      const payload = {
        _subject:    '🏠 Nova lead — Projeto Arquitetura | PO Arquitetos',
        _template:   'table',
        _captcha:    'false',
        nome:        form.nome?.value        || '',
        telefone:    form.telefone?.value    || '',
        email:       form.email?.value       || '',
        municipio:   form.municipio?.value   || '',
        tipo:        form.tipo?.value        || '',
        fase:        form.fase?.value        || '',
        mensagem:    form.mensagem?.value    || '',
        _origem:     'LP Arquitetura Residencial',
      };

      try {
        const res  = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success === 'true' || data.success === true) {

          /* 1. Google Ads via gtag direto (se disponível) */
          if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', { send_to: GADS_LABEL });
          }

          /* 2. Google Ads via GTM dataLayer (garante disparo pelo GTM) */
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event:          'form_submit_success',
            form_id:        'arquitetura',
            form_name:      'LP Arquitetura Residencial',
            conversion_label: GADS_LABEL,
          });

          /* 3. Redirect para página de obrigado */
          window.location.href = '/obrigado.html';

        } else {
          throw new Error('FormSubmit failure');
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
