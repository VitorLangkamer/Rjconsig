# RJConsig — Website Institucional

> **Confiança que Resolve**  
> Landing page profissional com simulador de crédito funcional, FAQ interativo e design fiel ao Figma original.

---

## 📁 Estrutura do Projeto

```
rjconsig/
├── index.html              # Página principal (único HTML)
├── css/
│   ├── styles.css          # Estilos principais + design tokens
│   └── responsive.css      # Media queries (tablet 768px / mobile 480px)
├── js/
│   ├── main.js             # Navbar, scroll suave, animações reveal
│   ├── faq.js              # Accordion de Dúvidas Frequentes
│   └── simulation.js       # Simulador de crédito com cálculo real
├── assets/
│   ├── logo.png            # Logo RJConsig (fundo branco)
│   └── logo-dark.jpg       # Logo RJConsig (fundo escuro)
└── README.md               # Esta documentação
```

---

## 🚀 Como Rodar

Sem dependências ou build tools — é HTML/CSS/JS puro.

```bash
# Opção 1 — abrir direto no navegador
open index.html

# Opção 2 — servidor local (recomendado para evitar CORS)
npx serve .
# ou
python -m http.server 8080
```

Acesse: `http://localhost:8080`

---

## 🎨 Design System

Todas as variáveis de design estão no início de `css/styles.css` como custom properties CSS:

| Variável                  | Valor         | Uso                          |
|---------------------------|---------------|------------------------------|
| `--color-bg-primary`      | `#0b0e1a`     | Fundo principal (dark navy)  |
| `--color-bg-secondary`    | `#111827`     | Fundo de seções alternadas   |
| `--color-accent`          | `#1d9cf0`     | Azul principal (brand)       |
| `--color-text-primary`    | `#f0f4f8`     | Texto principal              |
| `--color-text-secondary`  | `#9aafc8`     | Texto secundário/muted       |
| `--font-display`          | Barlow        | Títulos e headings           |
| `--font-body`             | Nunito        | Corpo de texto               |

Para alterar a identidade visual, edite apenas as variáveis em `:root {}`.

---

## ⚙️ Funcionalidades

### Simulador de Crédito (`js/simulation.js`)
- Cálculo real usando sistema **PRICE** de amortização
- Três modalidades: FGTS, Consignado CLT, Bolsa Família
- Regra de margem consignável (30% da renda)
- Máscara automática de moeda e telefone
- Validação de campos em tempo real
- Após simulação: abre WhatsApp com mensagem pré-preenchida

**Para alterar taxas de juros**, edite o objeto `MODALIDADES` em `js/simulation.js`:
```js
const MODALIDADES = {
  consignado: {
    taxaMensal: 1.8,  // altere aqui (%)
    prazoMax: 48,     // e aqui (meses)
    ...
  }
}
```

### FAQ Accordion (`js/faq.js`)
- Abre/fecha com animação CSS suave
- Comportamento accordion (fecha outros ao abrir um)
- Acessível via teclado (Enter/Espaço) com atributos ARIA

### Navbar (`js/main.js`)
- Scroll → fundo escuro com blur
- Menu hamburguer mobile com overlay
- Scroll suave com offset da navbar fixa
- Link ativo destacado conforme seção visível

### Animações de Entrada
- IntersectionObserver observa elementos com classe `.reveal`
- Staggered reveals com `.reveal-delay-1`, `.reveal-delay-2`, `.reveal-delay-3`

---

## 📱 Responsividade

| Breakpoint | Comportamento                                    |
|------------|--------------------------------------------------|
| > 1024px   | Layout desktop completo                          |
| ≤ 1024px   | Footer 2 colunas, cards de soluções empilhados   |
| ≤ 768px    | Menu hamburger, grids em 1 coluna                |
| ≤ 480px    | Tipografia reduzida, form em 1 coluna            |

---

## 🔧 Personalização Rápida

### Alterar número de WhatsApp
Busque por `5527997436600` no `index.html` e substitua pelo número real.

### Alterar email de contato
Busque por `contato@rjconsig.com.br` no `index.html`.

### Adicionar novo item ao FAQ
No `index.html`, dentro de `.faq-list`, copie um bloco `.faq-item`:
```html
<div class="faq-item">
  <div class="faq-question">
    <span>Sua pergunta aqui?</span>
    <span class="faq-chevron"></span>
  </div>
  <div class="faq-answer">
    Sua resposta aqui.
  </div>
</div>
```

---

## ♿ Acessibilidade

- Landmarks semânticos: `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>`
- Atributos ARIA: `aria-label`, `aria-expanded`, `aria-live`, `aria-controls`
- Navegação por teclado no FAQ e no menu mobile
- Contraste de cores acima de 4.5:1 (WCAG AA)
- `alt` em todas as imagens

---

## 📦 Dependências Externas

| Recurso             | CDN                        | Uso            |
|---------------------|----------------------------|----------------|
| Google Fonts Barlow | fonts.googleapis.com       | Títulos        |
| Google Fonts Nunito | fonts.googleapis.com       | Corpo de texto |

Nenhum framework JavaScript ou CSS. Zero `node_modules`.

---

*Projeto desenvolvido com HTML5 semântico, CSS3 com custom properties e JavaScript ES6+ puro.*
