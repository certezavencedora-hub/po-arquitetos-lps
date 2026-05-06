/* ============================================================
   PO ARQUITETOS — Passive House — script.js
   FormSubmit AJAX
============================================================ */
(function () {
  'use strict';

  const FORM_EMAIL = 'geral@pedrodooarquitetos.pt';

  /* ── SCROLL REVEAL ── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

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
    nav.style.boxShadow = window.scrollY > 20 ? '0 2px 24px rgba(0,0,0,.5)' : 'none';
  }, { passive: true });

  /* ══════════════════════════════════════
     MULTI-STEP FORM + FormSubmit AJAX
  ══════════════════════════════════════ */
  const form       = document.getElementById('passiva-form');
  const successBox = document.getElementById('form-success');
  if (!form) return;

  const answers    = {};
  let currentStep  = 1;
  const totalSteps = 7;

  function updateProgress(step) {
    for (let i = 1; i <= totalSteps; i++) {
      const el = document.getElementById(`prog-${i}`);
      if (!el) continue;
      el.classList.remove('active', 'done');
      if (i < step)  el.classList.add('done');
      if (i === step) el.classList.add('active');
    }
  }

  function goTo(step) {
    const current = form.querySelector(`.form-step[data-step="${currentStep}"]`);
    const next    = form.querySelector(`.form-step[data-step="${step}"]`);
    if (!next) return;
    if (current) current.classList.remove('active');
    next.classList.add('active');
    currentStep = step;
    updateProgress(step);
  }

  form.querySelectorAll('.option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const v = btn.dataset.v;
      form.querySelectorAll(`.option-btn[data-q="${q}"]`).forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      answers[q] = v;
      setTimeout(() => goTo(currentStep + 1), 280);
    });
  });

  form.querySelectorAll('.btn--back').forEach((btn) => {
    btn.addEventListener('click', () => goTo(parseInt(btn.dataset.prev, 10)));
  });

  const btnContacts = document.getElementById('btn-to-contacts');
  if (btnContacts) {
    btnContacts.addEventListener('click', () => {
      answers.municipio = (document.getElementById('municipio')?.value || '').trim();
      goTo(7);
    });
  }

  const labels = {
    objetivo:  { 'nova-passiva':'Construir Passive House de raiz', retrofit:'Reabilitar para Passive House', eficiencia:'Alta eficiência (não certificada)', explorar:'A explorar opções' },
    terreno:   { sim:'Sim, tem terreno próprio', procura:'A procurar terreno', 'casa-existente':'Casa existente para reabilitar', nao:'Ainda não tem' },
    area:      { 'ate100':'Até 100 m²', '100-180':'100 a 180 m²', '180-280':'180 a 280 m²', mais280:'Mais de 280 m²' },
    prazo:     { urgente:'Menos de 6 meses', medio:'6 a 12 meses', longo:'Mais de 1 ano', indefinido:'Ainda não definido' },
    orcamento: { sim:'Orçamento aprovado', financiamento:'A preparar financiamento', nao:'Ainda não analisou' },
  };

  function label(key, val) {
    return (labels[key] && labels[key][val]) ? labels[key][val] : val || '—';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach((f) => {
      f.style.borderColor = '';
      if (!f.value.trim()) { f.style.borderColor = '#c0392b'; valid = false; }
    });
    if (!valid) return;

    answers.nome     = (document.getElementById('nome')?.value     || '').trim();
    answers.telefone = (document.getElementById('telefone')?.value || '').trim();
    answers.email    = (document.getElementById('email')?.value    || '').trim();
    answers.notas    = (document.getElementById('notas')?.value    || '').trim();

    const btn      = form.querySelector('[type=submit]');
    const origText = btn.textContent;
    btn.textContent = 'A enviar…';
    btn.disabled = true;

    const payload = {
      _subject:    '🏠 Nova lead — Passive House | PO Arquitetos',
      _template:   'table',
      _captcha:    'false',
      '01_Nome':            answers.nome,
      '02_Telefone':        answers.telefone,
      '03_Email':           answers.email,
      '04_Objetivo':        label('objetivo',  answers.objetivo),
      '05_Tem_Terreno':     label('terreno',   answers.terreno),
      '06_Area_Pretendida': label('area',      answers.area),
      '07_Prazo':           label('prazo',     answers.prazo),
      '08_Orcamento':       label('orcamento', answers.orcamento),
      '09_Municipio':       answers.municipio || '—',
      '10_Notas':           answers.notas     || '—',
      '11_Origem':          'LP Passive House',
    };

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success === 'true' || data.success === true) {
        if (typeof gtag !== 'undefined') {
          gtag('event', 'conversion', {
            send_to: 'AW-17918640863/808ECNuE2e8bEN-Fo-BC'
          });
        }
        window.location.href = '/obrigado.html';
      } else {
        throw new Error('FormSubmit returned failure');
      }
    } catch (err) {
      console.error('Erro no envio:', err);
      btn.textContent = 'Erro — tente novamente';
      btn.style.background = '#c0392b';
      btn.disabled = false;
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
      }, 3000);
    }
  });

  updateProgress(1);

})();
