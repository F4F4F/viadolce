// =====================================================================
//  VIA DOLCE · CONFIGURACIÓN
//  Para cambiar productos, precios o disponibilidad, edita solo esta parte.
//  - precio: número sin puntos (ej. 28000) o null para mostrar "Consultar".
//  - disponible: true / false (false lo marca como "Agotado").
//  - img: nombre de la foto dentro de la carpeta img/.
// =====================================================================
const WHATSAPP = '573147675906'; // 57 + número, sin espacios

const CATEGORIAS = [
  { id: 'todo', nombre: 'Todo' },
  { id: 'tortas', nombre: 'Tortas' },
  { id: 'galletas', nombre: 'Galletas y brownies' },
  { id: 'postres', nombre: 'Postres' },
];

const PRODUCTOS = [
  { id: 'torta-personalizada', cat: 'tortas', nombre: 'Torta personalizada', desc: 'Diseñada según tu idea y tu celebración.', img: 'torta-cumple.jpg', alt: 'Torta de cumpleaños blanca con topper de Feliz Cumpleaños', precio: null, disponible: true },
  { id: 'torta-chocolate', cat: 'tortas', nombre: 'Torta de chocolate', desc: 'Bañada en ganache con chips de chocolate.', img: 'torta-chocolate.jpg', alt: 'Torta de chocolate con cobertura brillante', precio: null, disponible: true },
  { id: 'galletas-rellenas', cat: 'galletas', nombre: 'Galletas rellenas', desc: 'Grandes y suaves. Pregunta por los sabores disponibles.', img: 'galletas.jpg', alt: 'Torre de galletas rellenas con chips', precio: null, disponible: true },
  { id: 'caja-brownies', cat: 'galletas', nombre: 'Caja de brownies', desc: 'Caja con 6 brownies, lista para regalar.', img: 'brownies.jpg', alt: 'Caja de brownies con el sello de Via Dolce', precio: null, disponible: true },
  { id: 'cinnamon-rolls', cat: 'postres', nombre: 'Cinnamon rolls', desc: 'Masa suave con canela, recién horneados.', img: 'rolls.jpg', alt: 'Bandeja de cinnamon rolls', precio: null, disponible: true },
  { id: 'cuchareable-maracuya', cat: 'postres', nombre: 'Cuchareable de maracuyá', desc: 'Postre frío con pulpa de maracuyá.', img: 'maracuya.jpg', alt: 'Vaso de cuchareable de maracuyá', precio: null, disponible: true },
  { id: 'cuchareable-matilda', cat: 'postres', nombre: 'Cuchareable Matilda', desc: 'Chocolate intenso, para los más golosos.', img: 'matilda.jpg', alt: 'Vaso de cuchareable de chocolate Matilda', precio: null, disponible: false },
  { id: 'postres-vaso', cat: 'postres', nombre: 'Postres en vaso', desc: 'Variedad de sabores en porción individual.', img: 'vasos.jpg', alt: 'Postres en vaso con el sello de Via Dolce', precio: null, disponible: true },
];
// =====================================================================

const fmt = (n) => '$' + n.toLocaleString('es-CO');
const $ = (sel) => document.querySelector(sel);

let filtro = 'todo';
let carrito = {};
try { carrito = JSON.parse(localStorage.getItem('viadolce-carrito')) || {}; } catch (e) { carrito = {}; }
// Quitar del carrito lo que ya no exista o esté agotado
for (const id of Object.keys(carrito)) {
  const p = PRODUCTOS.find((x) => x.id === id);
  if (!p || !p.disponible || !(carrito[id] > 0)) delete carrito[id];
}

function guardar() {
  try { localStorage.setItem('viadolce-carrito', JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento */ }
}

function setCantidad(id, n) {
  if (n <= 0) delete carrito[id]; else carrito[id] = n;
  guardar();
  render();
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children) if (c != null) node.append(c);
  return node;
}

function renderFiltros() {
  const box = $('#filters');
  box.replaceChildren(...CATEGORIAS.map((c) =>
    el('button', {
      type: 'button', class: 'filter', 'aria-pressed': String(c.id === filtro),
      onclick: () => { filtro = c.id; render(); },
    }, c.nombre)
  ));
}

function renderProductos() {
  const visibles = PRODUCTOS.filter((p) => filtro === 'todo' || p.cat === filtro);
  $('#products').replaceChildren(...visibles.map((p) => {
    const q = carrito[p.id] || 0;
    const controles = p.disponible
      ? el('div', { class: 'qty' },
          el('button', { type: 'button', 'aria-label': `Quitar uno de ${p.nombre}`, onclick: () => setCantidad(p.id, q - 1) }, '−'),
          el('output', { 'aria-live': 'polite' }, String(q)),
          el('button', { type: 'button', class: 'plus', 'aria-label': `Agregar uno de ${p.nombre}`, onclick: () => setCantidad(p.id, q + 1) }, '+'))
      : el('span', { class: 'muted' }, 'Vuelve pronto');
    return el('article', { class: 'product' + (q > 0 ? ' in-cart' : '') + (p.disponible ? '' : ' sold-out') },
      el('img', { src: 'img/' + p.img, alt: p.alt, width: 900, height: 600, loading: 'lazy' }),
      el('div', { class: 'product-body' },
        el('div', { class: 'product-top' },
          el('h3', {}, p.nombre),
          el('span', { class: 'badge' + (p.disponible ? '' : ' out') }, p.disponible ? 'Disponible' : 'Agotado')),
        el('p', { class: 'product-desc' }, p.desc),
        el('div', { class: 'product-bottom' },
          el('span', { class: 'price' }, p.precio ? fmt(p.precio) : 'Consultar'),
          controles)));
  }));
}

function lineasPedido() {
  return PRODUCTOS.filter((p) => carrito[p.id] > 0).map((p) => ({ ...p, qty: carrito[p.id] }));
}

function renderPedido() {
  const lineas = lineasPedido();
  const total = lineas.reduce((s, l) => s + l.qty, 0);
  $('#cart-count').textContent = total;
  $('#cart-empty').hidden = lineas.length > 0;
  $('#cart-lines').replaceChildren(...lineas.map((l) =>
    el('li', {}, el('span', {}, l.nombre), el('strong', {}, `× ${l.qty}`))
  ));

  const todosConPrecio = lineas.length > 0 && lineas.every((l) => l.precio);
  const subtotal = lineas.reduce((s, l) => s + (l.precio || 0) * l.qty, 0);
  const totalEl = $('#cart-total');
  totalEl.hidden = !todosConPrecio;
  if (todosConPrecio) totalEl.textContent = 'Subtotal: ' + fmt(subtotal);

  const btn = $('#wa-order');
  if (lineas.length === 0) {
    btn.classList.add('is-disabled');
    btn.setAttribute('aria-disabled', 'true');
    btn.setAttribute('href', '#productos');
    btn.removeAttribute('target');
  } else {
    btn.classList.remove('is-disabled');
    btn.removeAttribute('aria-disabled');
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener');
    btn.setAttribute('href', 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensaje(lineas, todosConPrecio ? subtotal : null)));
  }
}

function mensaje(lineas, subtotal) {
  let txt = '¡Hola Via Dolce! Quiero hacer este pedido:\n';
  txt += lineas.map((l) => `- ${l.qty} x ${l.nombre}`).join('\n');
  if (subtotal) txt += `\nSubtotal: ${fmt(subtotal)}`;
  const nota = $('#nota').value.trim();
  if (nota) txt += `\n\nNota: ${nota}`;
  return txt;
}

function render() {
  renderFiltros();
  renderProductos();
  renderPedido();
}

$('#nota').addEventListener('input', renderPedido);
render();
