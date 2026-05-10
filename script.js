/* ProtectID — script.js (Front-end conectado ao Node.js) */

/* ---- Scroll arrow ---- */
document.getElementById('scroll-hint').addEventListener('click', function (e) {
  e.preventDefault();
  const target = document.getElementById('proof');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---- Intersection Observer: cards ---- */
(function () {
  const cards = document.querySelectorAll('.card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => observer.observe(c));
})();

/* ---- Counter animation (com formatação BR) ---- */
(function () {
  const formatBR = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',').replace(',0', '') + ' mi';
    if (n >= 1000) return Math.round(n / 1000) + 'k';
    return n.toString();
  };
  const stats = document.querySelectorAll('.stat-num');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = target >= 1000 ? formatBR(current) : current;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  stats.forEach(s => observer.observe(s));
})();

/* ---- Phone mask ---- */
document.getElementById('whatsapp').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 2)       this.value = v.length ? '(' + v : '';
  else if (v.length <= 7)  this.value = '(' + v.slice(0,2) + ') ' + v.slice(2);
  else                     this.value = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
});

/* ---- Shake feedback ---- */
(function () {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-7px)}
      40%{transform:translateX(7px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }`;
  document.head.appendChild(s);
})();

function shake(el) {
  el.style.animation = '';
  void el.offsetWidth;
  el.style.animation = 'shake .4s ease';
  el.style.borderColor = '#ff4b4b';
  el.addEventListener('animationend', () => { el.style.animation = ''; el.style.borderColor = ''; }, { once: true });
  el.addEventListener('input', () => el.style.borderColor = '', { once: true });
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

/* ---- Dúvidas Frequentes (FAQ Accordion) ---- */
document.querySelectorAll('.duvida-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const resposta = item.querySelector('.duvida-resposta');
    
    document.querySelectorAll('.duvida-item').forEach(el => {
      if(el !== item) {
        el.classList.remove('ativo');
        el.querySelector('.duvida-resposta').style.maxHeight = null;
      }
    });
    
    item.classList.toggle('ativo');
    if (item.classList.contains('ativo')) {
      resposta.style.maxHeight = resposta.scrollHeight + "px";
    } else {
      resposta.style.maxHeight = null;
    }
  });
});

/* ---- Envia lead pro SEU backend em Node.js ---- */
async function saveLead(payload) {
  // URL da sua API local. Quando for para produção, você troca para a URL do seu servidor.
  const URL_API = 'https://securid-server.onrender.com/api/leads'; 

  const res = await fetch(URL_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const retorno = await res.json().catch(() => ({}));
    throw new Error(retorno.erro || 'Erro ao comunicar com o servidor');
  }
}

/* ---- Form submit ---- */
document.getElementById('btn-subscribe').addEventListener('click', async function () {
  const nome  = document.getElementById('nome');
  const email = document.getElementById('email');
  const whats = document.getElementById('whatsapp');
  const medo  = document.getElementById('medo');
  const errorMsg = document.getElementById('error-msg');
  errorMsg.classList.add('hidden');

  if (!nome.value.trim() || nome.value.trim().length < 2) { shake(nome);  nome.focus();  return; }
  if (!isValidEmail(email.value))                          { shake(email); email.focus(); return; }
  if (whats.value.replace(/\D/g,'').length < 10)           { shake(whats); whats.focus(); return; }
  if (!medo.value) {
    medo.style.borderColor = '#ff4b4b';
    medo.addEventListener('change', () => medo.style.borderColor = '', { once: true });
    medo.focus();
    return;
  }

  const btn     = this;
  const btnText = document.getElementById('btn-text');
  const spinner = document.getElementById('btn-spinner');
  btnText.classList.add('hidden');
  spinner.classList.remove('hidden');
  btn.disabled = true;

  try {
    await saveLead({
      nome: nome.value.trim(),
      email: email.value.trim().toLowerCase(),
      whatsapp: whats.value.trim(),
      medo: medo.value,
      user_agent: navigator.userAgent.slice(0, 250)
    });

    btn.classList.add('hidden');
    document.getElementById('success-msg').classList.remove('hidden');
  } catch (err) {
    console.error('Erro ao salvar lead:', err);
    errorMsg.classList.remove('hidden');
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');
    btn.disabled = false;
  }
});

/* ---- Smooth scroll para âncoras ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.id === 'scroll-hint') return;
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});