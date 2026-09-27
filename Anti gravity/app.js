/**
 * AeroCalc - Scientific Calculator Engine
 * Pure Vanilla JavaScript implementation mirroring C <math.h> operations.
 */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentInput: '0',
    expression: '',
    storedResult: null,
    memory: 0,
    angleMode: 'DEG', // 'DEG' | 'RAD'
    isSecondMode: false,
    isHypMode: false,
    history: [],
    shouldResetInput: false
  };

  // --- DOM Elements ---
  const elExprDisplay = document.getElementById('expression-display');
  const elResultDisplay = document.getElementById('result-display');
  const elBadgeAngle = document.getElementById('badge-angle');
  const elBadge2nd = document.getElementById('badge-2nd');
  const elBadgeHyp = document.getElementById('badge-hyp');
  const elBadgeMem = document.getElementById('badge-mem');

  const btnToggleAngle = document.getElementById('toggle-angle');
  const btnToggle2nd = document.getElementById('toggle-2nd');
  const btnToggleHyp = document.getElementById('toggle-hyp');

  const btnMemClear = document.getElementById('mem-clear');
  const btnMemRecall = document.getElementById('mem-recall');
  const btnMemPlus = document.getElementById('mem-plus');
  const btnMemMinus = document.getElementById('mem-minus');

  const btnHistoryToggle = document.getElementById('btn-history-toggle');
  const drawerHistory = document.getElementById('history-drawer');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const elHistoryList = document.getElementById('history-list');

  const btnMathModal = document.getElementById('btn-math-modal');
  const modalMath = document.getElementById('math-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  // --- Trigonometric & Math Helpers ---
  function toRad(val) {
    return state.angleMode === 'DEG' ? val * (Math.PI / 180.0) : val;
  }

  function fromRad(val) {
    return state.angleMode === 'DEG' ? val * (180.0 / Math.PI) : val;
  }

  // Factorial with exact integers & gamma approximation
  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (Number.isInteger(n) && n <= 170) {
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return res;
    }
    // Stirling/Lanczos approximation for gamma(n + 1)
    return gamma(n + 1);
  }

  function gamma(z) {
    const g = 7;
    const C = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1;
    let x = C[0];
    for (let i = 1; i < g + 2; i++) x += C[i] / (z + i);
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  // --- Display Updates ---
  function formatNumber(num) {
    if (Number.isNaN(num)) return 'Error: Undefined';
    if (!Number.isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    // Avoid floating point precision issues like 0.1 + 0.2 = 0.30000000000000004
    const str = num.toString();
    if (Math.abs(num) < 1e14 && Math.abs(num) > 1e-6) {
      return parseFloat(num.toFixed(10)).toString();
    }
    return num.toPrecision(10).replace(/(?:\.0+|(\.\d+?)0+)$/, '$1');
  }

  function updateDisplay() {
    elResultDisplay.textContent = state.currentInput;
    elExprDisplay.textContent = state.expression;

    if (state.currentInput.startsWith('Error')) {
      elResultDisplay.classList.add('has-error');
    } else {
      elResultDisplay.classList.remove('has-error');
    }

    elBadgeAngle.textContent = state.angleMode;
    elBadge2nd.classList.toggle('active-mode', state.isSecondMode);
    elBadgeHyp.classList.toggle('active-mode', state.isHypMode);
    elBadgeMem.textContent = `M: ${formatNumber(state.memory)}`;
    elBadgeMem.classList.toggle('active-mode', state.memory !== 0);

    updateDynamicKeys();
  }

  // Update dynamic key labels when 2nd or HYP mode is toggled
  function updateDynamicKeys() {
    const btnSin = document.querySelector('[data-action="sin"]');
    const btnCos = document.querySelector('[data-action="cos"]');
    const btnTan = document.querySelector('[data-action="tan"]');
    const btnLn = document.querySelector('[data-action="ln"]');
    const btnLog = document.querySelector('[data-action="log10"]');
    const btnPow2 = document.querySelector('[data-action="pow-2"]');
    const btnSqrt = document.querySelector('[data-action="sqrt"]');

    if (btnSin && btnCos && btnTan) {
      if (state.isHypMode && state.isSecondMode) {
        btnSin.textContent = 'asinh';
        btnCos.textContent = 'acosh';
        btnTan.textContent = 'atanh';
      } else if (state.isHypMode) {
        btnSin.textContent = 'sinh';
        btnCos.textContent = 'cosh';
        btnTan.textContent = 'tanh';
      } else if (state.isSecondMode) {
        btnSin.textContent = 'sin⁻¹';
        btnCos.textContent = 'cos⁻¹';
        btnTan.textContent = 'tan⁻¹';
      } else {
        btnSin.textContent = 'sin';
        btnCos.textContent = 'cos';
        btnTan.textContent = 'tan';
      }
    }

    if (btnLn && btnLog) {
      btnLn.textContent = state.isSecondMode ? 'eˣ' : 'ln';
      btnLog.textContent = state.isSecondMode ? '10ˣ' : 'log₁₀';
    }

    if (btnPow2 && btnSqrt) {
      btnPow2.textContent = state.isSecondMode ? 'x³' : 'x²';
      btnSqrt.textContent = state.isSecondMode ? '∛x' : '√x';
    }
  }

  // --- Number & Basic Entry ---
  function inputDigit(digit) {
    if (state.shouldResetInput || state.currentInput === '0' || state.currentInput.startsWith('Error')) {
      state.currentInput = digit;
      state.shouldResetInput = false;
    } else {
      if (state.currentInput.length < 16) {
        state.currentInput += digit;
      }
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (state.shouldResetInput || state.currentInput.startsWith('Error')) {
      state.currentInput = '0.';
      state.shouldResetInput = false;
    } else if (!state.currentInput.includes('.')) {
      state.currentInput += '.';
    }
    updateDisplay();
  }

  function clearAll() {
    state.currentInput = '0';
    state.expression = '';
    state.storedResult = null;
    state.shouldResetInput = false;
    updateDisplay();
  }

  function deleteLast() {
    if (state.shouldResetInput || state.currentInput.startsWith('Error')) {
      state.currentInput = '0';
      state.shouldResetInput = false;
    } else {
      state.currentInput = state.currentInput.slice(0, -1);
      if (state.currentInput === '' || state.currentInput === '-') {
        state.currentInput = '0';
      }
    }
    updateDisplay();
  }

  function negate() {
    if (state.currentInput.startsWith('Error')) return;
    const val = parseFloat(state.currentInput);
    state.currentInput = formatNumber(-val);
    updateDisplay();
  }

  function inputConstant(name) {
    const val = (name === 'pi') ? Math.PI : Math.E;
    state.currentInput = formatNumber(val);
    state.shouldResetInput = true;
    updateDisplay();
  }

  // --- Immediate Unary Function Execution ---
  function applyUnary(action) {
    let x = parseFloat(state.currentInput);
    if (Number.isNaN(x)) return;

    let res = null;
    let label = '';

    switch (action) {
      case 'sin':
        if (state.isHypMode && state.isSecondMode) {
          res = Math.asinh(x);
          label = `asinh(${x})`;
        } else if (state.isHypMode) {
          res = Math.sinh(x);
          label = `sinh(${x})`;
        } else if (state.isSecondMode) {
          if (x < -1 || x > 1) {
            state.currentInput = 'Error: Domain (-1 to 1)';
            updateDisplay();
            return;
          }
          res = fromRad(Math.asin(x));
          label = `asin(${x})`;
        } else {
          res = Math.sin(toRad(x));
          label = `sin(${x})`;
        }
        break;

      case 'cos':
        if (state.isHypMode && state.isSecondMode) {
          if (x < 1) {
            state.currentInput = 'Error: Domain (x >= 1)';
            updateDisplay();
            return;
          }
          res = Math.acosh(x);
          label = `acosh(${x})`;
        } else if (state.isHypMode) {
          res = Math.cosh(x);
          label = `cosh(${x})`;
        } else if (state.isSecondMode) {
          if (x < -1 || x > 1) {
            state.currentInput = 'Error: Domain (-1 to 1)';
            updateDisplay();
            return;
          }
          res = fromRad(Math.acos(x));
          label = `acos(${x})`;
        } else {
          res = Math.cos(toRad(x));
          label = `cos(${x})`;
        }
        break;

      case 'tan':
        if (state.isHypMode && state.isSecondMode) {
          if (x <= -1 || x >= 1) {
            state.currentInput = 'Error: Domain (-1 < x < 1)';
            updateDisplay();
            return;
          }
          res = Math.atanh(x);
          label = `atanh(${x})`;
        } else if (state.isHypMode) {
          res = Math.tanh(x);
          label = `tanh(${x})`;
        } else if (state.isSecondMode) {
          res = fromRad(Math.atan(x));
          label = `atan(${x})`;
        } else {
          // Asymptote check
          const rad = toRad(x);
          if (Math.abs(Math.cos(rad)) < 1e-14) {
            state.currentInput = 'Error: Undefined';
            updateDisplay();
            return;
          }
          res = Math.tan(rad);
          label = `tan(${x})`;
        }
        break;

      case 'sinh': res = Math.sinh(x); label = `sinh(${x})`; break;
      case 'cosh': res = Math.cosh(x); label = `cosh(${x})`; break;
      case 'tanh': res = Math.tanh(x); label = `tanh(${x})`; break;

      case 'ln':
        if (state.isSecondMode) {
          res = Math.exp(x);
          label = `e^(${x})`;
        } else {
          if (x <= 0) {
            state.currentInput = 'Error: Domain (x > 0)';
            updateDisplay();
            return;
          }
          res = Math.log(x);
          label = `ln(${x})`;
        }
        break;

      case 'log10':
        if (state.isSecondMode) {
          res = Math.pow(10, x);
          label = `10^(${x})`;
        } else {
          if (x <= 0) {
            state.currentInput = 'Error: Domain (x > 0)';
            updateDisplay();
            return;
          }
          res = Math.log10(x);
          label = `log10(${x})`;
        }
        break;

      case 'exp':
        res = Math.exp(x);
        label = `e^(${x})`;
        break;

      case 'sqrt':
        if (state.isSecondMode) {
          res = Math.cbrt(x);
          label = `cbrt(${x})`;
        } else {
          if (x < 0) {
            state.currentInput = 'Error: Domain (x >= 0)';
            updateDisplay();
            return;
          }
          res = Math.sqrt(x);
          label = `sqrt(${x})`;
        }
        break;

      case 'cbrt':
        res = Math.cbrt(x);
        label = `cbrt(${x})`;
        break;

      case 'pow-2':
        if (state.isSecondMode) {
          res = Math.pow(x, 3);
          label = `sqr3(${x})`;
        } else {
          res = Math.pow(x, 2);
          label = `sqr(${x})`;
        }
        break;

      case 'reciprocal':
        if (x === 0) {
          state.currentInput = 'Error: Div by 0';
          updateDisplay();
          return;
        }
        res = 1.0 / x;
        label = `1/(${x})`;
        break;

      case 'abs':
        res = Math.abs(x);
        label = `|${x}|`;
        break;

      case 'round':
        res = Math.round(x);
        label = `round(${x})`;
        break;

      case 'factorial':
        if (x < 0 || x > 170) {
          state.currentInput = 'Error: Overflow / Neg';
          updateDisplay();
          return;
        }
        res = factorial(x);
        label = `${x}!`;
        break;

      case 'percent':
        res = x / 100.0;
        label = `${x}%`;
        break;

      default:
        return;
    }

    if (res !== null) {
      addHistory(label, formatNumber(res));
      state.currentInput = formatNumber(res);
      state.shouldResetInput = true;
      updateDisplay();
    }
  }

  // --- Binary Operations & Expression Construction ---
  function inputOperator(op, symbol) {
    if (state.currentInput.startsWith('Error')) return;

    if (state.expression !== '' && state.shouldResetInput) {
      // Replace last operator if user clicks a different operator consecutively
      const lastChar = state.expression.trim().slice(-1);
      if (['+', '-', '*', '/', '%', '^'].includes(lastChar)) {
        state.expression = state.expression.trim().slice(0, -1) + ' ' + op + ' ';
        updateDisplay();
        return;
      }
    }

    state.expression += `${state.currentInput} ${op} `;
    state.shouldResetInput = true;
    updateDisplay();
  }

  function inputParenthesis(paren) {
    if (paren === '(') {
      if (state.currentInput !== '0' && !state.shouldResetInput) {
        state.expression += `${state.currentInput} * ( `;
      } else {
        state.expression += '( ';
      }
      state.shouldResetInput = true;
    } else {
      state.expression += `${state.currentInput} ) `;
      state.shouldResetInput = true;
    }
    updateDisplay();
  }

  // --- Evaluation Engine ---
  function evaluateExpression() {
    if (state.currentInput.startsWith('Error')) return;

    let fullExpr = state.expression;
    if (!state.shouldResetInput) {
      fullExpr += state.currentInput;
    }

    if (!fullExpr.trim()) return;

    try {
      // Sanitize expression tokens
      let sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**');

      // Check balance of parentheses
      const openParens = (sanitized.match(/\(/g) || []).length;
      const closeParens = (sanitized.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        sanitized += ' )'.repeat(openParens - closeParens);
      }

      // Safe mathematical expression evaluation using Function constructor with restricted scope
      const evalFunc = new Function(`"use strict"; return (${sanitized});`);
      const result = evalFunc();

      if (!Number.isFinite(result)) {
        state.currentInput = 'Error: Math Error';
      } else {
        const formatted = formatNumber(result);
        addHistory(fullExpr, formatted);
        state.currentInput = formatted;
        state.expression = '';
        state.shouldResetInput = true;
      }
    } catch (err) {
      state.currentInput = 'Error: Syntax';
      state.shouldResetInput = true;
    }

    updateDisplay();
  }

  // --- Memory Operations ---
  function memClear() {
    state.memory = 0;
    updateDisplay();
  }

  function memRecall() {
    state.currentInput = formatNumber(state.memory);
    state.shouldResetInput = true;
    updateDisplay();
  }

  function memAdd() {
    const val = parseFloat(state.currentInput);
    if (!Number.isNaN(val)) {
      state.memory += val;
      state.shouldResetInput = true;
      updateDisplay();
    }
  }

  function memSub() {
    const val = parseFloat(state.currentInput);
    if (!Number.isNaN(val)) {
      state.memory -= val;
      state.shouldResetInput = true;
      updateDisplay();
    }
  }

  // --- History Tape ---
  function addHistory(expr, result) {
    state.history.unshift({ expr, result, timestamp: new Date() });
    if (state.history.length > 30) state.history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elHistoryList.innerHTML = '<div class="empty-history">No calculations recorded yet</div>';
      return;
    }

    elHistoryList.innerHTML = '';
    state.history.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div class="hist-expr">${escapeHtml(item.expr)}</div>
        <div class="hist-res">${escapeHtml(item.result)}</div>
      `;
      card.addEventListener('click', () => {
        state.currentInput = item.result;
        state.shouldResetInput = true;
        updateDisplay();
        drawerHistory.classList.remove('open');
      });
      elHistoryList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- Event Listeners for UI ---
  document.querySelectorAll('.num-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const num = btn.getAttribute('data-num');
      if (num === '.') {
        inputDecimal();
      } else {
        inputDigit(num);
      }
    });
  });

  document.querySelectorAll('.op-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const op = btn.getAttribute('data-op');
      const sym = btn.getAttribute('data-symbol') || op;
      inputOperator(op, sym);
    });
  });

  document.querySelectorAll('.func-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'paren-open') inputParenthesis('(');
      else if (action === 'paren-close') inputParenthesis(')');
      else if (action === 'const-pi') inputConstant('pi');
      else if (action === 'const-e') inputConstant('e');
      else if (action === 'negate') negate();
      else if (action === 'pow-y') inputOperator('^', '^');
      else if (action === 'mod') inputOperator('%', 'mod');
      else {
        applyUnary(action);
      }
    });
  });

  // Action Buttons
  document.getElementById('key-ac').addEventListener('click', clearAll);
  document.getElementById('key-del').addEventListener('click', deleteLast);
  document.getElementById('key-equals').addEventListener('click', evaluateExpression);

  // Toggles
  btnToggleAngle.addEventListener('click', () => {
    state.angleMode = (state.angleMode === 'DEG') ? 'RAD' : 'DEG';
    btnToggleAngle.textContent = state.angleMode;
    btnToggleAngle.classList.toggle('active', state.angleMode === 'DEG');
    updateDisplay();
  });

  btnToggle2nd.addEventListener('click', () => {
    state.isSecondMode = !state.isSecondMode;
    btnToggle2nd.classList.toggle('active', state.isSecondMode);
    updateDisplay();
  });

  btnToggleHyp.addEventListener('click', () => {
    state.isHypMode = !state.isHypMode;
    btnToggleHyp.classList.toggle('active', state.isHypMode);
    updateDisplay();
  });

  // Memory
  btnMemClear.addEventListener('click', memClear);
  btnMemRecall.addEventListener('click', memRecall);
  btnMemPlus.addEventListener('click', memAdd);
  btnMemMinus.addEventListener('click', memSub);

  // History Drawer
  btnHistoryToggle.addEventListener('click', () => {
    drawerHistory.classList.toggle('open');
  });

  btnCloseHistory.addEventListener('click', () => {
    drawerHistory.classList.remove('open');
  });

  btnClearHistory.addEventListener('click', () => {
    state.history = [];
    renderHistory();
  });

  // Modal: math.h Reference
  btnMathModal.addEventListener('click', () => {
    modalMath.classList.add('open');
  });

  btnCloseModal.addEventListener('click', () => {
    modalMath.classList.remove('open');
  });

  modalMath.addEventListener('click', (e) => {
    if (e.target === modalMath) {
      modalMath.classList.remove('open');
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (modalMath.classList.contains('open')) {
      if (e.key === 'Escape') modalMath.classList.remove('open');
      return;
    }

    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
    } else if (e.key === '.') {
      inputDecimal();
    } else if (['+', '-', '*', '/'].includes(e.key)) {
      inputOperator(e.key, e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      evaluateExpression();
    } else if (e.key === 'Backspace') {
      deleteLast();
    } else if (e.key === 'Escape') {
      clearAll();
    } else if (e.key === '(' || e.key === ')') {
      inputParenthesis(e.key);
    } else if (e.key === '^') {
      inputOperator('^', '^');
    }
  });

  // Init
  updateDisplay();
})();
