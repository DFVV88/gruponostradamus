const RAW_LATEX_PATTERN = /\\(?:frac|sqrt|mathbb|vec|overrightarrow|hat|mathbf|mathrm|cap|cup|subset|in|Delta|perp|parallel|angle)\b|\$[^$]+\$|\\\[[\s\S]*?\\\]/;

export function renderLatex(element, latex, displayMode = false) {
  if (!element) return false;
  if (!window.katex || typeof window.katex.render !== 'function') {
    element.textContent = latex;
    element.dataset.mathStatus = 'pending';
    return false;
  }
  try {
    window.katex.render(latex, element, {
      throwOnError: true,
      displayMode,
      strict: 'warn',
      trust: false,
      output: 'htmlAndMathml'
    });
    element.dataset.mathStatus = 'ok';
    return true;
  } catch (error) {
    element.textContent = '⚠ Expresión matemática pendiente de revisión';
    element.dataset.mathStatus = 'error';
    console.error('[NostraMATH] LaTeX inválido:', latex, error);
    return false;
  }
}

export function hydrateMath(root = document) {
  root.querySelectorAll('[data-latex]').forEach((node) => renderLatex(node, node.dataset.latex || '', false));
  root.querySelectorAll('[data-latex-display]').forEach((node) => renderLatex(node, node.dataset.latexDisplay || '', true));
}

export function containsRawLatex(text = '') {
  return RAW_LATEX_PATTERN.test(String(text));
}

export function assertNoRawLatex(root = document) {
  const text = root.body ? root.body.innerText : root.innerText || '';
  return !containsRawLatex(text);
}
