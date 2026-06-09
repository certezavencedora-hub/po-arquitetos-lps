/* ============================================================
   PO ARQUITETOS — Legalização — script.js
   FormSubmit AJAX — trocar EMAIL pelo email real do Pedro
   [Atualizado 28-Mai-2026: dataLayer push + event_callback +
   log de data.message no catch para diagnóstico futuro]
============================================================ */
(function () {
  'use strict';

  const FORM_EMAIL = 'geral@pedrodooarquitetos.pt'; // ← alterar se necessário
  const GADS_LABEL = 'AW-17918640863/808ECNuE2e8bEN-Fo-BC';

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

      let serverMsg = '';

      try {
        const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload),
        });

        const data = await res.json();
        serverMsg = data?.message || '';

        if (data.success === 'true' || data.success === true) {

          /* 1. GTM dataLayer — síncrono, dispara sempre */
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event:            'form_submit_success',
            form_id:          'legalizacao',
            form_name:        'LP Legalização',
            conversion_label: GADS_LABEL,
          });

          /* 2. Google Ads — espera envio antes de redirecionar (event_callback) */
          let redirected = false;
          const goNext = () => {
            if (redirected) return;
            redirected = true;
            window.location.href = '/obrigado';
          };

          if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
              send_to: GADS_LABEL,
              event_callback: goNext,
            });
            /* Fallback: se o callback não disparar em 1.5s, redireciona na mesma */
            setTimeout(goNext, 1500);
          } else {
            goNext();
          }

        } else {
          throw new Error('FormSubmit returned failure');
        }
      } catch (err) {
        console.error('Erro no envio:', err, 'Server message:', serverMsg || '(none)');
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
