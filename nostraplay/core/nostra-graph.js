import { renderLatex } from './nostra-math.js';

const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}) {
  const node = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function mathLabel(svg, { x, y, latex, anchor = 'middle', size = 19, className = '' }) {
  const fo = el('foreignObject', { x: x - 70, y: y - 24, width: 140, height: 48, class: className });
  const box = document.createElement('div');
  box.style.cssText = `width:100%;height:100%;display:flex;align-items:center;justify-content:${anchor === 'middle' ? 'center' : anchor === 'start' ? 'flex-start' : 'flex-end'};font-size:${size}px;pointer-events:none;`;
  fo.appendChild(box);
  svg.appendChild(fo);
  renderLatex(box, latex, false);
  return fo;
}

function baseSvg(viewBox = '0 0 720 420') {
  const svg = el('svg', { viewBox, role: 'img', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet' });
  svg.style.width = '100%';
  svg.style.height = 'auto';
  return svg;
}

export function renderVectorSum(container, spec = {}) {
  const svg = baseSvg('0 0 720 420');
  const defs = el('defs');
  const marker = el('marker', { id: 'npArrow', markerWidth: 10, markerHeight: 10, refX: 8, refY: 3, orient: 'auto', markerUnits: 'strokeWidth' });
  marker.appendChild(el('path', { d: 'M0,0 L0,6 L9,3 z', fill: '#022D33' }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  const origin = spec.origin || [135, 315];
  const scale = spec.scale || 52;
  const vectors = spec.vectors || [];
  const project = ([x, y]) => [origin[0] + x * scale, origin[1] - y * scale];

  svg.appendChild(el('line', { x1: 70, y1: origin[1], x2: 650, y2: origin[1], stroke: '#909294', 'stroke-width': 1.4 }));
  svg.appendChild(el('line', { x1: origin[0], y1: 360, x2: origin[0], y2: 45, stroke: '#909294', 'stroke-width': 1.4 }));

  vectors.forEach((vector, index) => {
    const a = project(vector.from || [0, 0]);
    const b = project(vector.to || [0, 0]);
    svg.appendChild(el('line', {
      x1: a[0], y1: a[1], x2: b[0], y2: b[1],
      stroke: index === vectors.length - 1 ? '#068695' : '#022D33',
      'stroke-width': 2.2,
      'marker-end': 'url(#npArrow)'
    }));
    if (vector.label) {
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2 - 18;
      mathLabel(svg, { x: mx, y: my, latex: vector.label, size: 18 });
    }
  });

  container.replaceChildren(svg);
  return svg;
}

export function renderVenn3(container, spec = {}) {
  const svg = baseSvg('0 0 760 440');
  svg.appendChild(el('rect', { x: 26, y: 20, width: 708, height: 384, rx: 18, fill: '#fff', stroke: '#022D33', 'stroke-width': 1.5 }));

  const circles = spec.circles || [
    { key: 'A', cx: 285, cy: 174, r: 118, label: 'A', lx: 245, ly: 48 },
    { key: 'B', cx: 475, cy: 174, r: 118, label: 'B', lx: 515, ly: 48 },
    { key: 'C', cx: 380, cy: 288, r: 118, label: 'C', lx: 380, ly: 424 }
  ];

  circles.forEach((circle) => {
    svg.appendChild(el('circle', {
      cx: circle.cx, cy: circle.cy, r: circle.r,
      fill: 'rgba(6,134,149,.035)', stroke: '#022D33', 'stroke-width': 1.6
    }));
    mathLabel(svg, { x: circle.lx, y: circle.ly, latex: circle.label, size: 21 });
  });

  mathLabel(svg, { x: 54, y: 50, latex: spec.universeLabel || 'U', anchor: 'start', size: 21 });
  (spec.labels || []).forEach((item) => mathLabel(svg, {
    x: item.x,
    y: item.y,
    latex: String(item.latex ?? item.value ?? ''),
    size: item.size || 17
  }));

  container.replaceChildren(svg);
  return svg;
}

export function renderNumberLine(container, spec = {}) {
  const svg = baseSvg('0 0 760 210');
  const y = 98;
  const x1 = 70;
  const x2 = 690;
  svg.appendChild(el('line', { x1, y1: y, x2, y2: y, stroke: '#022D33', 'stroke-width': 1.6 }));

  const min = spec.min ?? -5;
  const max = spec.max ?? 5;
  const px = (value) => x1 + (value - min) / (max - min) * (x2 - x1);

  for (let value = min; value <= max; value += 1) {
    const x = px(value);
    svg.appendChild(el('line', { x1: x, y1: y - 7, x2: x, y2: y + 7, stroke: '#909294', 'stroke-width': 1 }));
    mathLabel(svg, { x, y: y + 40, latex: String(value), size: 13 });
  }

  (spec.intervals || []).forEach((interval) => {
    const a = px(interval.from);
    const b = px(interval.to);
    svg.appendChild(el('line', { x1: a, y1: y, x2: b, y2: y, stroke: '#068695', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    [[a, interval.closedFrom], [b, interval.closedTo]].forEach(([x, closed]) => {
      svg.appendChild(el('circle', { cx: x, cy: y, r: 7, fill: closed ? '#068695' : '#fff', stroke: '#068695', 'stroke-width': 2 }));
    });
  });

  container.replaceChildren(svg);
  return svg;
}

export const NostraGraph = Object.freeze({
  'vector-sum': renderVectorSum,
  venn3: renderVenn3,
  'number-line': renderNumberLine
});

export function renderAcademicGraphic(container, spec) {
  const renderer = NostraGraph[spec?.type];
  if (!renderer) {
    container.innerHTML = '<div class="np-graphic-error">Gráfico pendiente de implementación en NostraGRAPH.</div>';
    return null;
  }
  return renderer(container, spec);
}
