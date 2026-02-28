/**
 * RJConsig — Accordion de Dúvidas Frequentes
 * Arquivo: js/faq.js
 * Descrição: Controla abertura e fechamento dos itens do FAQ
 *            com animação suave e acessibilidade (teclado + ARIA).
 */

(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');

    // Acessibilidade: atributos ARIA
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');

    // Suporte a teclado (Enter e Espaço)
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleItem(item);
      }
    });

    // Clique
    question.addEventListener('click', () => toggleItem(item));
  });

  /**
   * Abre ou fecha um item do FAQ.
   * Fecha os outros itens abertos (comportamento accordion).
   * @param {HTMLElement} targetItem
   */
  function toggleItem(targetItem) {
    const isActive   = targetItem.classList.contains('active');
    const targetQ    = targetItem.querySelector('.faq-question');

    // Fecha todos os outros
    faqItems.forEach(item => {
      if (item !== targetItem) {
        item.classList.remove('active');
        const q = item.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle do item atual
    if (isActive) {
      targetItem.classList.remove('active');
      targetQ.setAttribute('aria-expanded', 'false');
    } else {
      targetItem.classList.add('active');
      targetQ.setAttribute('aria-expanded', 'true');
    }
  }
})();
