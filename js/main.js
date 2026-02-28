/**
 * RJConsig — JavaScript Principal
 * Arquivo: js/main.js
 * Descrição: Controle de navbar, scroll, animações de entrada e
 *            comportamentos gerais de UI.
 */

/* ==========================================================================
   NAVBAR
   ========================================================================== */

/**
 * Adiciona classe "scrolled" à navbar quando o usuário rola a página,
 * e controla o menu mobile hamburguer.
 */
(function initNavbar() {
  const navbar    = document.querySelector('.navbar');
  const toggle    = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');

  // Scroll — adiciona fundo escuro à navbar
  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Hamburguer — abre/fecha menu mobile
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      toggle.classList.toggle('active', isOpen);
      // Bloqueia scroll do body quando menu está aberto
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fecha menu ao clicar em um link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Fecha menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        toggle.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
})();

/* ==========================================================================
   SCROLL SUAVE — âncoras
   ========================================================================== */

/**
 * Override do scroll nativo para animar suavemente e compensar
 * a altura da navbar fixa.
 */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.querySelector('.navbar').offsetHeight;
      const targetY   = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetY, behavior: 'smooth' });
    });
  });
})();

/* ==========================================================================
   ANIMAÇÕES DE ENTRADA — IntersectionObserver
   ========================================================================== */

/**
 * Observa elementos com classe "reveal" e adiciona "visible"
 * quando entram na viewport, disparando a animação CSS.
 */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Para de observar após revelar (otimização)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ==========================================================================
   UTILITÁRIO — TOAST NOTIFICATION
   ========================================================================== */

/**
 * Exibe uma notificação temporária (toast) na tela.
 * @param {string} message - Texto da notificação.
 * @param {'success'|'error'} type - Tipo visual do toast.
 * @param {number} [duration=4000] - Duração em ms antes de sumir.
 */
function showToast(message, type = 'success', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icon  = type === 'success' ? '✅' : '❌';
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Remove após a duração
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(-20px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Exporta para ser usada por outros módulos
window.showToast = showToast;

/* ==========================================================================
   LINK ATIVO NA NAVBAR — destaque baseado na seção visível
   ========================================================================== */

(function initActiveLink() {
  const sections  = document.querySelectorAll('section[id]');
  const navItems  = document.querySelectorAll('.nav-links a[href^="#"]');
  const navHeight = 80;

  function updateActiveLink() {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - navHeight - 40;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
})();
