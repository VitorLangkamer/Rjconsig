/**
 * RJConsig — Formulário de Simulação de Crédito
 * Arquivo: js/simulation.js
 * Descrição: Lógica de validação, cálculo de crédito e envio do formulário
 *            de simulação. Inclui taxas reais aproximadas por modalidade.
 */

/* ==========================================================================
   TAXAS E CONFIGURAÇÕES POR MODALIDADE
   ========================================================================== */

/**
 * Tabela de configurações por modalidade de crédito.
 * - taxaMensal: taxa de juros mensal (%)
 * - prazoMax:   prazo máximo em meses
 * - limiteMin:  valor mínimo de crédito (R$)
 * - limiteMax:  valor máximo de crédito (R$)
 */
const MODALIDADES = {
  fgts: {
    nome:      'Antecipação FGTS',
    taxaMensal: 0,            // Sem juros mensais — desconto direto do fundo
    prazoMax:   10,           // Até 10 parcelas anuais
    limiteMin:  500,
    limiteMax:  50000,
    desconto:   0.018,        // 1,8% ao mês de antecipação
  },
  consignado: {
    nome:      'Consignado CLT',
    taxaMensal: 1.8,          // 1,8% ao mês (taxa média mercado)
    prazoMax:   48,
    limiteMin:  500,
    limiteMax:  100000,
    desconto:   null,
  },
  bolsaFamilia: {
    nome:      'Crédito Bolsa Família',
    taxaMensal: 2.5,          // Microcredito com taxa reduzida
    prazoMax:   24,
    limiteMin:  300,
    limiteMax:  5000,
    desconto:   null,
  },
};

/* ==========================================================================
   FORMATAÇÃO
   ========================================================================== */

/**
 * Formata número como moeda BRL.
 * @param {number} value
 * @returns {string} Ex: "R$ 1.500,00"
 */
function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style:                 'currency',
    currency:              'BRL',
    minimumFractionDigits: 2,
  });
}

/**
 * Formata string de input como valor monetário em tempo real.
 * @param {HTMLInputElement} input
 */
function maskCurrency(input) {
  let value = input.value.replace(/\D/g, '');
  value = (parseInt(value || '0', 10) / 100).toFixed(2);
  input.value = formatCurrency(parseFloat(value));
}

/**
 * Formata input de telefone como (XX) XXXXX-XXXX.
 * @param {HTMLInputElement} input
 */
function maskPhone(input) {
  let value = input.value.replace(/\D/g, '').slice(0, 11);

  if (value.length <= 2) {
    value = `(${value}`;
  } else if (value.length <= 7) {
    value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
  } else {
    value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  }

  input.value = value;
}

/* ==========================================================================
   CÁLCULO DE CRÉDITO
   ========================================================================== */

/**
 * Calcula parcela mensal pelo sistema PRICE (juros compostos).
 * @param {number} principal - Valor do empréstimo (R$)
 * @param {number} taxaMensal - Taxa de juros mensal (decimal, ex: 0.018)
 * @param {number} prazo - Número de parcelas
 * @returns {number} Valor da parcela
 */
function calcularParcelaPRICE(principal, taxaMensal, prazo) {
  if (taxaMensal === 0) return principal / prazo; 
  const taxa  = taxaMensal / 100; // Converte para decimal
  const fator = Math.pow(1 + taxa, prazo); // Fórmula: P = (PV * i * (1 + i)^n) / ((1 + i)^n - 1)
  return (principal * taxa * fator) / (fator - 1); // Retorna parcela mensal
}

/**
 * Calcula o crédito máximo aprovado com base na renda e modalidade.
 * Regra: comprometimento máximo de 30% da renda mensal.
 * @param {number} renda        - Renda mensal (R$)
 * @param {string} modalidadeKey - Chave da modalidade
 * @returns {{ aprovado: number, parcela: number, prazo: number }}
 */
function calcularCredito(renda, modalidadeKey) {
  const mod = MODALIDADES[modalidadeKey];
  if (!mod) return null;

  const margemDisponivel = renda * 0.30; // 30% da renda para FGTS/consignado

  let aprovado;
  let parcela;
  const prazo = mod.prazoMax;

  if (modalidadeKey === 'fgts') {
    // FGTS: antecipação com desconto fixo
    // Estimativa: saldo FGTS ≈ 8% do salário × meses de trabalho (aprox 12 meses)
    const saldoEstimado = renda * 0.08 * 12;
    aprovado = Math.min(saldoEstimado * (1 - mod.desconto * prazo), mod.limiteMax);
    aprovado = Math.max(aprovado, mod.limiteMin);
    parcela  = aprovado / prazo; // parcela anual do FGTS
  } else {
    // Calcula crédito máximo que cabe na margem consignável
    const taxa   = mod.taxaMensal / 100;
    if (taxa === 0) {
      aprovado = margemDisponivel * prazo;
    } else {
      const fator  = Math.pow(1 + taxa, prazo);
      aprovado     = (margemDisponivel * (fator - 1)) / (taxa * fator);
    }

    aprovado = Math.min(aprovado, mod.limiteMax);
    aprovado = Math.max(aprovado, mod.limiteMin);
    parcela  = calcularParcelaPRICE(aprovado, mod.taxaMensal, prazo);
  }

  return {
    aprovado: Math.floor(aprovado),
    parcela:  Math.ceil(parcela),
    prazo,
    modalidade: mod.nome,
  };
}

/* ==========================================================================
   VALIDAÇÃO DO FORMULÁRIO
   ========================================================================== */

/**
 * Valida um campo e exibe/oculta mensagem de erro.
 * @param {HTMLElement} group - Elemento .form-group
 * @param {boolean} isValid
 * @param {string} [errorMsg]
 * @returns {boolean}
 */
function validateField(group, isValid, errorMsg = '') {
  const errorEl = group.querySelector('.form-error');
  if (isValid) {
    group.classList.remove('has-error');
  } else {
    group.classList.add('has-error');
    if (errorEl) errorEl.textContent = errorMsg;
  }
  return isValid;
}

/**
 * Extrai valor numérico de campo de moeda formatado.
 * @param {string} formatted - Ex: "R$ 2.500,00"
 * @returns {number}
 */
function parseCurrency(formatted) {
  const clean = formatted.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

/* ==========================================================================
   INICIALIZAÇÃO DO FORMULÁRIO
   ========================================================================== */

(function initSimulationForm() {
  const form = document.getElementById('sim-form');
  if (!form) return;

  const inputNome       = form.querySelector('#sim-nome');
  const inputWhatsApp   = form.querySelector('#sim-whatsapp');
  const selectCredito   = form.querySelector('#sim-credito');
  const inputRenda      = form.querySelector('#sim-renda');
  const btnSubmit       = form.querySelector('#sim-submit');
  const resultEl        = document.getElementById('sim-result');
  const resultValue     = document.getElementById('sim-result-value');
  const resultParcela   = document.getElementById('sim-result-parcela');
  const resultModalidade= document.getElementById('sim-result-modalidade');

  // Máscaras em tempo real
  inputWhatsApp.addEventListener('input', () => maskPhone(inputWhatsApp));
  inputRenda.addEventListener('input',    () => maskCurrency(inputRenda));

  // Inicializa máscara da renda
  inputRenda.addEventListener('focus', () => {
    if (inputRenda.value === '') inputRenda.value = 'R$ 0,00';
  });

  // Envio do formulário
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!runValidation()) return;

    // Estado de carregamento
    btnSubmit.disabled    = true;
    btnSubmit.textContent = 'Calculando...';

    // Simula delay de processamento (UX)
    setTimeout(() => {
      const renda        = parseCurrency(inputRenda.value);
      const modalidadeEl = selectCredito.value;

      // Mapa entre opções do select e chaves das modalidades
      const modalidadeMap = {
        'Antecipacao FGTS':    'fgts',
        'Consignado CLT':      'consignado',
        'Credito Bolsa Familia': 'bolsaFamilia',
      };

      const key      = modalidadeMap[modalidadeEl] || 'fgts';
      const resultado = calcularCredito(renda, key);

      if (resultado && resultado.aprovado >= MODALIDADES[key].limiteMin) {
        // Exibe resultado
        resultValue.textContent     = formatCurrency(resultado.aprovado);
        resultParcela.textContent   = `${resultado.prazo}x de ${formatCurrency(resultado.parcela)}`;
        resultModalidade.textContent = resultado.modalidade;
        resultEl.classList.add('visible');

        // Redireciona para WhatsApp com dados pré-preenchidos
        const msg = encodeURIComponent(
          `Olá! Quero simular um crédito pela RJConsig.\n\n` +
          `*Nome:* ${inputNome.value}\n` +
          `*Modalidade:* ${resultado.modalidade}\n` +
          `*Valor aprovado estimado:* ${formatCurrency(resultado.aprovado)}\n` +
          `*Parcelas:* ${resultado.prazo}x de ${formatCurrency(resultado.parcela)}\n\n` +
          `Gostaria de prosseguir!`
        );

        // Aguarda o usuário ver o resultado antes de redirecionar
        setTimeout(() => {
          window.open(`https://wa.me/5521999999999?text=${msg}`, '_blank');
        }, 1500);

        window.showToast('Simulação concluída! Abrindo WhatsApp...', 'success');
      } else {
        window.showToast('Renda informada abaixo do mínimo para esta modalidade.', 'error');
      }

      btnSubmit.disabled    = false;
      btnSubmit.textContent = 'Quero Minha Simulação →';
    }, 900);
  });

  /**
   * Executa todas as validações do form.
   * @returns {boolean} True se todos os campos são válidos.
   */
  function runValidation() {
    let valid = true;

    // Nome
    const nomeGroup = inputNome.closest('.form-group');
    if (!validateField(nomeGroup, inputNome.value.trim().length >= 3, 'Nome muito curto.')) {
      valid = false;
    }

    // WhatsApp — deve ter 14 ou 15 chars no formato mascarado
    const waGroup  = inputWhatsApp.closest('.form-group');
    const waDigits = inputWhatsApp.value.replace(/\D/g, '');
    if (!validateField(waGroup, waDigits.length >= 10, 'Número inválido.')) {
      valid = false;
    }

    // Modalidade
    const credGroup = selectCredito.closest('.form-group');
    if (!validateField(credGroup, selectCredito.value !== '', 'Selecione uma modalidade.')) {
      valid = false;
    }

    // Renda
    const rendaGroup = inputRenda.closest('.form-group');
    const rendaVal   = parseCurrency(inputRenda.value);
    if (!validateField(rendaGroup, rendaVal >= 100, 'Informe uma renda válida (mín. R$ 100).')) {
      valid = false;
    }

    return valid;
  }
})();
