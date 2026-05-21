const NostraShop = (() => {
  const CONFIG = {
    storeName: 'NostraShop Académico',
    apiUrl: '',
    whatsapp: '51993750351'
  };

  const FALLBACK_MATERIALS = [
    {
      id: 'pack-aritmetica-uni-001',
      category: 'Aritmética',
      course: 'Aritmética',
      type: 'Pack',
      name: 'Pack Aritmética UNI',
      description: 'Folletos seleccionados de teoría, práctica y problemas tipo UNI para reforzar aritmética desde base hasta nivel admisión.',
      level: 'UNI',
      price: 49,
      oldPrice: 69,
      format: 'Físico',
      stock: 12,
      status: 'Activo',
      imageUrl: '',
      previewUrl: '',
      tag: 'Recomendado',
      emoji: '📘'
    },
    {
      id: 'solucionario-fisica-uni-002',
      category: 'Física',
      course: 'Física',
      type: 'Solucionario',
      name: 'Solucionario Física UNI',
      description: 'Resolución paso a paso de problemas seleccionados de física con enfoque preuniversitario y explicación didáctica.',
      level: 'UNI',
      price: 59,
      oldPrice: 79,
      format: 'Digital',
      stock: 99,
      status: 'Activo',
      imageUrl: '',
      previewUrl: '',
      tag: 'Digital',
      emoji: '⚙️'
    },
    {
      id: 'simulacro-uni-pack-003',
      category: 'Simulacros UNI',
      course: 'General',
      type: 'Simulacro',
      name: 'Pack Simulacros Tipo UNI',
      description: 'Compilado de simulacros estilo admisión UNI para practicar bajo presión y medir avance por áreas.',
      level: 'UNI',
      price: 39,
      oldPrice: 59,
      format: 'Digital',
      stock: 99,
      status: 'Activo',
      imageUrl: '',
      previewUrl: '',
      tag: 'Más pedido',
      emoji: '🧪'
    }
  ];

  let materials = [];
  let filteredMaterials = [];
  let selectedCategory = 'todos';
  let cart = JSON.parse(localStorage.getItem('nostraShopBooksCart') || '[]');
  let toastTimer = null;

  const money = value => `S/ ${Number(value || 0).toFixed(2)}`;

  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));

  function normalizeMaterial(item) {
    return {
      id: item.id || item.ID || item['ID Material'] || item.codigo || '',
      category: item.category || item.categoria || item['Categoría'] || 'General',
      course: item.course || item.curso || item['Curso'] || 'General',
      type: item.type || item.tipo || item['Tipo'] || 'Material',
      name: item.name || item.nombre || item['Nombre'] || 'Material académico',
      description: item.description || item.descripcion || item['Descripción'] || '',
      level: item.level || item.nivel || item['Nivel'] || 'UNI',
      price: Number(item.price || item.precio || item['Precio'] || item['Precio venta'] || 0),
      oldPrice: Number(item.oldPrice || item.precioAnterior || item['Precio anterior'] || 0),
      format: item.format || item.formato || item['Formato'] || 'Físico',
      stock: Number(item.stock || item['Stock'] || 0),
      status: item.status || item.estado || item['Estado'] || 'Activo',
      imageUrl: item.imageUrl || item.imagen || item['Imagen URL'] || '',
      previewUrl: item.previewUrl || item.vistaPrevia || item['Vista previa URL'] || '',
      tag: item.tag || item.etiqueta || item['Etiqueta'] || '',
      emoji: item.emoji || item['Emoji'] || '📚'
    };
  }

  async function loadMaterials() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '<div class="nostra-loading">Cargando materiales desde Google Sheets...</div>';

    try {
      if (!CONFIG.apiUrl) throw new Error('API pendiente de configurar');

      const url = `${CONFIG.apiUrl}?action=materials&t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo leer el catálogo');

      const data = await response.json();
      const list = data.materials || data.products || data.items || [];
      if (!data.success || !Array.isArray(list)) throw new Error('Respuesta inválida');

      materials = list.map(normalizeMaterial).filter(item => item.status === 'Activo');
      if (!materials.length) materials = FALLBACK_MATERIALS;
    } catch (error) {
      console.warn('Usando materiales de respaldo:', error);
      materials = FALLBACK_MATERIALS;
      showToast('Catálogo de prueba: falta conectar Google Sheets');
    }

    syncCart();
    buildCategories();
    applyFilters();
    renderCart();
  }

  function buildCategories() {
    const strip = document.getElementById('categoryStrip');
    const categories = [...new Set(materials.map(item => item.category).filter(Boolean))];

    strip.innerHTML = '<button type="button" class="active" data-category="todos">Todos</button>' +
      categories.map(category => `<button type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');

    strip.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        selectedCategory = button.dataset.category;
        strip.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        applyFilters();
      });
    });
  }

  function applyFilters() {
    const type = document.getElementById('typeFilter')?.value || 'todos';

    filteredMaterials = materials.filter(item => {
      const categoryMatch = selectedCategory === 'todos' || item.category === selectedCategory;
      const typeMatch = type === 'todos' || item.type === type;
      return categoryMatch && typeMatch;
    });

    renderMaterials();
  }

  function renderMaterials() {
    const grid = document.getElementById('productsGrid');

    if (!filteredMaterials.length) {
      grid.innerHTML = '<div class="nostra-loading">No hay materiales activos en esta categoría.</div>';
      return;
    }

    grid.innerHTML = filteredMaterials.map(item => {
      const stock = Number(item.stock || 0);
      const soldOut = stock <= 0;
      const image = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=&quot;emoji&quot;>${escapeHtml(item.emoji)}</span>'">`
        : `<span class="emoji">${escapeHtml(item.emoji)}</span>`;

      return `
        <article class="nostra-material-card">
          <div class="material-cover">
            ${item.tag ? `<span class="material-badge">${escapeHtml(item.tag)}</span>` : ''}
            ${image}
          </div>
          <div class="material-body">
            <div class="material-meta">
              <span>${escapeHtml(item.category)}</span>
              <span>${escapeHtml(item.type)}</span>
              <span>${escapeHtml(item.format)}</span>
            </div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="material-price">
              <strong>${money(item.price)}</strong>
              ${item.oldPrice > item.price ? `<span>${money(item.oldPrice)}</span>` : ''}
            </div>
            <div class="material-stock">${soldOut ? 'Agotado' : `Stock disponible: ${stock}`}</div>
            <button class="nostra-card-button" type="button" onclick="NostraShop.addToCart('${escapeHtml(item.id)}')" ${soldOut ? 'disabled' : ''}>
              ${soldOut ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  function addToCart(id) {
    const material = materials.find(item => item.id === id);
    if (!material) return;

    const existing = cart.find(item => item.id === id);
    const currentQty = existing ? existing.qty : 0;
    const stock = Number(material.stock || 0);

    if (currentQty >= stock) {
      showToast('Stock máximo alcanzado');
      return;
    }

    if (existing) existing.qty += 1;
    else cart.push({ ...material, qty: 1 });

    saveCart();
    showToast('Material agregado al carrito');
  }

  function changeQty(id, delta) {
    cart = cart.map(item => {
      if (item.id !== id) return item;
      const latest = materials.find(material => material.id === id);
      const maxStock = latest ? Number(latest.stock || 0) : item.stock;
      return { ...item, qty: Math.min(Math.max(item.qty + delta, 0), maxStock) };
    }).filter(item => item.qty > 0);

    saveCart();
  }

  function syncCart() {
    cart = cart.map(item => {
      const latest = materials.find(material => material.id === item.id);
      if (!latest) return null;
      const qty = Math.min(Number(item.qty || 1), Number(latest.stock || 0));
      return qty > 0 ? { ...latest, qty } : null;
    }).filter(Boolean);
    saveCart(false);
  }

  function saveCart(render = true) {
    localStorage.setItem('nostraShopBooksCart', JSON.stringify(cart));
    updateCartCount();
    if (render) renderCart();
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = count;
  }

  function renderCart() {
    const wrapper = document.getElementById('cartItems');
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);

    wrapper.innerHTML = cart.length
      ? cart.map(item => `
        <div class="nostra-cart-item">
          <div class="nostra-cart-thumb">${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}">` : escapeHtml(item.emoji)}</div>
          <div>
            <strong>${escapeHtml(item.name)}</strong><br>
            <small>${escapeHtml(item.type)} · ${escapeHtml(item.format)} · ${money(item.price)}</small>
            <div class="nostra-qty">
              <button type="button" onclick="NostraShop.changeQty('${escapeHtml(item.id)}',-1)">−</button>
              <span>${item.qty}</span>
              <button type="button" onclick="NostraShop.changeQty('${escapeHtml(item.id)}',1)">+</button>
            </div>
          </div>
          <strong>${money(Number(item.price || 0) * item.qty)}</strong>
        </div>
      `).join('')
      : '<p style="color:#6b7c89;font-weight:800;">Tu carrito está vacío.</p>';

    document.getElementById('cartSubtotal').textContent = money(subtotal);
    document.getElementById('cartTotal').textContent = money(subtotal);
    updateCartCount();
  }

  function openCart() {
    document.getElementById('cartBackdrop').classList.add('open');
    document.getElementById('cartPanel').classList.add('open');
  }

  function closeCart() {
    document.getElementById('cartBackdrop').classList.remove('open');
    document.getElementById('cartPanel').classList.remove('open');
  }

  async function refreshCatalog() {
    showToast('Actualizando catálogo...');
    await loadMaterials();
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function setStatus(type, message) {
    const status = document.getElementById('orderStatus');
    status.className = `nostra-order-status ${type}`;
    status.textContent = message;
  }

  function buildWhatsAppMessage(order) {
    const itemsText = order.items.map(item => `• ${item.qty} x ${item.name} - ${money(item.price * item.qty)}`).join('%0A');
    return `Hola Grupo Nostradamus, quiero confirmar mi pedido de NostraShop:%0A%0A${itemsText}%0A%0ATotal: ${money(order.total)}%0A%0ANombre: ${encodeURIComponent(order.customer.name)}%0ACelular: ${encodeURIComponent(order.customer.phone)}%0AEntrega: ${encodeURIComponent(order.customer.delivery)}`;
  }

  async function submitOrder(event) {
    event.preventDefault();

    if (!cart.length) {
      setStatus('error', 'Agrega al menos un material antes de enviar el pedido.');
      return;
    }

    const form = event.target;
    const customer = Object.fromEntries(new FormData(form).entries());
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);

    const order = {
      store: CONFIG.storeName,
      orderId: `NSL-${Date.now()}`,
      customer,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        course: item.course,
        type: item.type,
        format: item.format,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1)
      })),
      total,
      createdAt: new Date().toISOString(),
      status: 'Nuevo'
    };

    try {
      if (CONFIG.apiUrl) {
        const response = await fetch(CONFIG.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(order)
        });

        if (!response.ok) throw new Error('No se pudo registrar el pedido');
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Pedido no aceptado');
      }

      setStatus('ok', 'Pedido preparado correctamente. Te enviaremos a WhatsApp para confirmar.');
      const url = `https://wa.me/${CONFIG.whatsapp}?text=${buildWhatsAppMessage(order)}`;
      cart = [];
      saveCart();
      form.reset();
      setTimeout(() => window.open(url, '_blank'), 700);
    } catch (error) {
      console.error(error);
      setStatus('error', 'No se pudo enviar el pedido: ' + error.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('orderForm')?.addEventListener('submit', submitOrder);
    loadMaterials();
    renderCart();
  });

  return {
    addToCart,
    changeQty,
    openCart,
    closeCart,
    refreshCatalog,
    applyFilters
  };
})();
