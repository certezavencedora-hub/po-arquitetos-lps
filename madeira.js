/* ============================================================
   PO ARQUITETOS — Casas de Madeira — script.js
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
    nav.style.boxShadow = window.scrollY > 20 ? '0 2px 24px rgba(0,0,0,.5)' : 'none';
  }, { passive: true });

  /* ══════════════════════════════════════
     MULTI-STEP FORM + FormSubmit AJAX
  ══════════════════════════════════════ */
  const form       = document.getElementById('madeira-form');
  const successBox = document.getElementById('form-success');
  if (!form) return;

  const answers    = {};
  let currentStep  = 1;
  const totalSteps = 7;

  /* Barra de progresso */
  function updateProgress(step) {
    for (let i = 1; i <= totalSteps; i++) {
      const el = document.getElementById(`prog-${i}`);
      if (!el) continue;
      el.classList.remove('active', 'done');
      if (i < step)  el.classList.add('done');
      if (i === step) el.classList.add('active');
    }
  }

  /* Navegar entre passos */
  function goTo(step) {
    const current = form.querySelector(`.form-step[data-step="${currentStep}"]`);
    const next    = form.querySelector(`.form-step[data-step="${step}"]`);
    if (!next) return;
    if (current) current.classList.remove('active');
    next.classList.add('active');
    currentStep = step;
    updateProgress(step);
  }

  /* Opções clicáveis — selecionar e avançar */
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

  /* Botões "Anterior" */
  form.querySelectorAll('.btn--back').forEach((btn) => {
    btn.addEventListener('click', () => goTo(parseInt(btn.dataset.prev, 10)));
  });

  /* Botão "Continuar" no passo 6 → passa para contactos */
  const btnContacts = document.getElementById('btn-to-contacts');
  if (btnContacts) {
    btnContacts.addEventListener('click', () => {
      answers.municipio = (document.getElementById('municipio')?.value || '').trim();
      goTo(7);
    });
  }

  /* ── Mapeamento de valores para labels legíveis no email ── */
  const labels = {
    objetivo:   { nova:'Construir casa nova', legalizar:'Legalizar existente', anexo:'Anexo / estrutura', explorar:'A explorar opções' },
    terreno:    { sim:'Sim, tem terreno próprio', procura:'A procurar terreno', nao:'Ainda não tem', jardim:'Jardim de casa existente' },
    area:       { 'ate80':'Até 80 m²', '80-150':'80 a 150 m²', '150-250':'150 a 250 m²', mais250:'Mais de 250 m²' },
    prazo:      { urgente:'Menos de 6 meses', medio:'6 a 12 meses', longo:'Mais de 1 ano', indefinido:'Ainda não definido' },
    orcamento:  { sim:'Orçamento aprovado', financiamento:'A preparar financiamento', nao:'Ainda não analisou' },
  };

  function label(key, val) {
    return (labels[key] && labels[key][val]) ? labels[key][val] : val || '—';
  }

  /* ── Submit final ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    /* Validação campos obrigatórios */
    let valid = true;
    form.querySelectorAll('[required]').forEach((f) => {
      f.style.borderColor = '';
      if (!f.value.trim()) { f.style.borderColor = '#c0392b'; valid = false; }
    });
    if (!valid) return;

    /* Recolher contactos */
    answers.nome     = (document.getElementById('nome')?.value     || '').trim();
    answers.telefone = (document.getElementById('telefone')?.value || '').trim();
    answers.email    = (document.getElementById('email')?.value    || '').trim();
    answers.notas    = (document.getElementById('notas')?.value    || '').trim();

    /* Loading state */
    const btn      = form.querySelector('[type=submit]');
    const origText = btn.textContent;
    btn.textContent = 'A enviar…';
    btn.disabled = true;

    /* Payload para FormSubmit — formato tabela legível */
    const payload = {
      _subject:    '🌲 Nova lead — Casa de Madeira | PO Arquitetos',
      _template:   'table',
      _captcha:    'false',
      '01_Nome':           answers.nome,
      '02_Telefone':       answers.telefone,
      '03_Email':          answers.email,
      '04_Objetivo':       label('objetivo',  answers.objetivo),
      '05_Tem_Terreno':    label('terreno',   answers.terreno),
      '06_Area_Pretendida':label('area',      answers.area),
      '07_Prazo':          label('prazo',     answers.prazo),
      '08_Orcamento':      label('orcamento', answers.orcamento),
      '09_Municipio':      answers.municipio || '—',
      '10_Notas':          answers.notas     || '—',
      '11_Origem':         'LP Casas de Madeira',
    };

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success === 'true' || data.success === true) {
        // Disparar conversão Google Ads antes de redirecionar
        if (typeof gtag !== 'undefined') {
          gtag('event', 'conversion', {
            send_to: 'AW-17918640863/808ECNuE2e8bEN-Fo-BC'
          });
        }
        // Redirecionar para página de obrigado (conversão contada pelo GA4 + Ads)
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

  /* Inicializar */
  updateProgress(1);

})();
