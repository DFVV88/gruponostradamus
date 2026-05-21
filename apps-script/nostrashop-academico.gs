/*
  =========================================================
  NOSTRASHOP ACADÉMICO - BACKEND GOOGLE APPS SCRIPT
  Grupo Nostradamus / NOSTRA S.A.C.
  =========================================================

  OBJETIVO:
  - Crear estructura de Google Sheets para vender libros, folletos,
    separatas, simulacros, solucionarios y packs nivel UNI.
  - Exponer catálogo a la web nostrashop.html.
  - Registrar pedidos en Google Sheets.
  - Preparar el sistema para futura entrega digital automática.

  USO INICIAL:
  1. Crear un Google Sheets nuevo.
  2. Ir a Extensiones > Apps Script.
  3. Pegar este código.
  4. Guardar.
  5. Ejecutar: crearEstructuraNostraShopAcademico
  6. Implementar como aplicación web.
*/

const NSA_CONFIG = {
  STORE_NAME: 'NostraShop Académico',
  BUSINESS_NAME: 'NOSTRA S.A.C.',
  BRAND_NAME: 'Grupo Nostradamus',
  OWNER_EMAIL: 'fernandodaniel8888@gmail.com',
  WHATSAPP: '51993750351',
  CURRENCY: 'S/',
  SHEETS: {
    MATERIALS: 'Materiales',
    CATEGORIES: 'Categorias',
    ORDERS: 'PedidosMateriales',
    DETAILS: 'DetalleMateriales',
    DASHBOARD: 'DashboardMateriales'
  }
};

const NSA_HEADERS = {
  MATERIALS: [
    'ID Material',
    'Categoria',
    'Curso',
    'Tipo',
    'Nombre',
    'Descripcion',
    'Nivel',
    'Precio',
    'Precio anterior',
    'Formato',
    'Stock',
    'Estado',
    'Imagen URL',
    'Vista previa URL',
    'Archivo Drive ID',
    'Entrega digital',
    'Etiqueta',
    'Emoji',
    'Orden',
    'Observaciones'
  ],
  CATEGORIES: [
    'ID Categoria',
    'Categoria',
    'Descripcion',
    'Emoji',
    'Orden',
    'Estado'
  ],
  ORDERS: [
    'Fecha',
    'ID Pedido',
    'Cliente',
    'Celular',
    'Correo',
    'Tipo entrega',
    'Subtotal',
    'Total',
    'Estado pedido',
    'Estado pago',
    'Estado entrega digital',
    'Metodo pago',
    'Observaciones',
    'Token descarga',
    'Fecha pago',
    'Fecha entrega',
    'Origen'
  ],
  DETAILS: [
    'Fecha',
    'ID Pedido',
    'ID Material',
    'Nombre',
    'Categoria',
    'Curso',
    'Tipo',
    'Formato',
    'Cantidad',
    'Precio unitario',
    'Total linea',
    'Archivo Drive ID',
    'Entrega digital',
    'Estado entrega'
  ]
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('NostraShop Académico')
    .addItem('Crear / actualizar estructura', 'crearEstructuraNostraShopAcademico')
    .addItem('Actualizar estados de stock', 'actualizarEstadosMaterialesNostraShop')
    .addItem('Actualizar dashboard', 'crearDashboardNostraShopAcademico')
    .addSeparator()
    .addItem('Crear pedido de prueba', 'crearPedidoPruebaNostraShopAcademico')
    .addItem('Limpiar pruebas', 'limpiarPruebasNostraShopAcademico')
    .addToUi();
}

function crearEstructuraNostraShopAcademico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const materiales = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.MATERIALS, NSA_HEADERS.MATERIALS);
  const categorias = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.CATEGORIES, NSA_HEADERS.CATEGORIES);
  const pedidos = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.ORDERS, NSA_HEADERS.ORDERS);
  const detalles = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.DETAILS, NSA_HEADERS.DETAILS);
  const dashboard = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.DASHBOARD, []);

  setupMaterialsSheet_(materiales);
  setupCategoriesSheet_(categorias);
  setupOrdersSheet_(pedidos);
  setupDetailsSheet_(detalles);

  seedCategoriesIfEmpty_(categorias);
  seedMaterialsIfEmpty_(materiales);

  crearDashboardNostraShopAcademico();

  SpreadsheetApp.flush();
  Logger.log('Estructura NostraShop Académico creada correctamente.');
}

function doGet(e) {
  try {
    const action = String(e && e.parameter && e.parameter.action || '').toLowerCase();

    if (action === 'materials' || action === 'products') {
      return jsonResponse_({
        success: true,
        store: NSA_CONFIG.STORE_NAME,
        materials: getActiveMaterials_(),
        products: getActiveMaterials_(),
        categories: getActiveCategories_()
      });
    }

    if (action === 'categories') {
      return jsonResponse_({
        success: true,
        categories: getActiveCategories_()
      });
    }

    return jsonResponse_({
      success: true,
      message: 'Backend NostraShop Académico activo.',
      availableActions: ['materials', 'categories']
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error.message
    });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const order = normalizeOrder_(payload);
    validateOrder_(order);

    const materials = getAllMaterials_();
    validateStock_(order.items, materials);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordersSheet = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.ORDERS, NSA_HEADERS.ORDERS);
    const detailsSheet = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.DETAILS, NSA_HEADERS.DETAILS);

    const completedOrder = enrichOrder_(order, materials);

    appendOrder_(ordersSheet, completedOrder);
    appendDetails_(detailsSheet, completedOrder);
    decrementMaterialStock_(completedOrder.items);
    crearDashboardNostraShopAcademico();
    sendOrderEmails_(completedOrder);

    return jsonResponse_({
      success: true,
      message: 'Pedido registrado correctamente.',
      orderId: completedOrder.orderId
    });
  } catch (error) {
    return jsonResponse_({
      success: false,
      message: error.message
    });
  }
}

function getOrCreateSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (headers && headers.length) {
    const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const needsHeaders = headers.some((header, index) => current[index] !== header);

    if (needsHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#061426')
        .setFontColor('#ffffff')
        .setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

function setupMaterialsSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange('A:T').setVerticalAlignment('middle');
  sheet.getRange('H:I').setNumberFormat('S/ #,##0.00');
  sheet.getRange('K:K').setNumberFormat('0');

  const estados = ['Activo', 'Agotado', 'Inactivo', 'Próximamente'];
  const formatos = ['Físico', 'Digital', 'Ambos'];
  const tipos = ['Libro', 'Folleto', 'Separata', 'Simulacro', 'Solucionario', 'Pack'];
  const entregaDigital = ['Sí', 'No'];

  sheet.getRange('D2:D1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(tipos, true).setAllowInvalid(false).build());
  sheet.getRange('J2:J1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(formatos, true).setAllowInvalid(false).build());
  sheet.getRange('L2:L1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(estados, true).setAllowInvalid(false).build());
  sheet.getRange('P2:P1000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(entregaDigital, true).setAllowInvalid(false).build());
  sheet.getRange('K2:K1000').setDataValidation(SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false).build());

  sheet.autoResizeColumns(1, NSA_HEADERS.MATERIALS.length);
}

function setupCategoriesSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange('A:F').setVerticalAlignment('middle');
  sheet.getRange('F2:F1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Activo', 'Inactivo'], true).setAllowInvalid(false).build()
  );
  sheet.autoResizeColumns(1, NSA_HEADERS.CATEGORIES.length);
}

function setupOrdersSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange('A:Q').setVerticalAlignment('middle');
  sheet.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  sheet.getRange('G:H').setNumberFormat('S/ #,##0.00');

  sheet.getRange('I2:I1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Nuevo', 'En revisión', 'Confirmado', 'Cancelado', 'Completado'], true).setAllowInvalid(false).build()
  );
  sheet.getRange('J2:J1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Pendiente', 'Pagado', 'Rechazado', 'Devuelto'], true).setAllowInvalid(false).build()
  );
  sheet.getRange('K2:K1000').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['No aplica', 'Pendiente', 'Entregado'], true).setAllowInvalid(false).build()
  );

  sheet.autoResizeColumns(1, NSA_HEADERS.ORDERS.length);
}

function setupDetailsSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange('A:N').setVerticalAlignment('middle');
  sheet.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
  sheet.getRange('J:K').setNumberFormat('S/ #,##0.00');
  sheet.autoResizeColumns(1, NSA_HEADERS.DETAILS.length);
}

function seedCategoriesIfEmpty_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const rows = [
    ['cat-aritmetica', 'Aritmética', 'Material de teoría, práctica y problemas tipo UNI.', '📘', 1, 'Activo'],
    ['cat-algebra', 'Álgebra', 'Folletos y separatas para dominar álgebra preuniversitaria.', '📗', 2, 'Activo'],
    ['cat-geometria', 'Geometría', 'Material visual y problemas de geometría nivel UNI.', '📐', 3, 'Activo'],
    ['cat-trigonometria', 'Trigonometría', 'Identidades, ecuaciones, gráficos y práctica intensiva.', '📏', 4, 'Activo'],
    ['cat-fisica', 'Física', 'Problemas resueltos y teoría aplicada para admisión UNI.', '⚙️', 5, 'Activo'],
    ['cat-quimica', 'Química', 'Separatas, ejercicios y solucionarios de química.', '🧪', 6, 'Activo'],
    ['cat-rm', 'Razonamiento Matemático', 'Material para desarrollar pensamiento lógico y rapidez.', '🧠', 7, 'Activo'],
    ['cat-rv', 'Razonamiento Verbal', 'Comprensión, analogías, conectores y práctica verbal.', '📖', 8, 'Activo'],
    ['cat-humanidades', 'Humanidades', 'Material de cultura general, historia, geografía y economía.', '🏛️', 9, 'Activo'],
    ['cat-simulacros', 'Simulacros UNI', 'Simulacros tipo admisión para medir rendimiento.', '📝', 10, 'Activo'],
    ['cat-solucionarios', 'Solucionarios', 'Resoluciones paso a paso con enfoque didáctico.', '✅', 11, 'Activo'],
    ['cat-packs', 'Packs por ciclo', 'Paquetes completos de estudio por curso o etapa.', '🎒', 12, 'Activo']
  ];

  sheet.getRange(2, 1, rows.length, NSA_HEADERS.CATEGORIES.length).setValues(rows);
}

function seedMaterialsIfEmpty_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const rows = [
    [
      'pack-aritmetica-uni-001',
      'Aritmética',
      'Aritmética',
      'Pack',
      'Pack Aritmética UNI',
      'Folletos seleccionados de teoría, práctica y problemas tipo UNI para reforzar aritmética desde base hasta nivel admisión.',
      'UNI',
      49,
      69,
      'Físico',
      12,
      'Activo',
      '',
      '',
      '',
      'No',
      'Recomendado',
      '📘',
      1,
      'Material de ejemplo. Reemplazar por producto real.'
    ],
    [
      'solucionario-fisica-uni-002',
      'Física',
      'Física',
      'Solucionario',
      'Solucionario Física UNI',
      'Resolución paso a paso de problemas seleccionados de física con enfoque preuniversitario y explicación didáctica.',
      'UNI',
      59,
      79,
      'Digital',
      99,
      'Activo',
      '',
      '',
      '',
      'Sí',
      'Digital',
      '⚙️',
      2,
      'Material de ejemplo. Falta Archivo Drive ID.'
    ],
    [
      'simulacro-uni-pack-003',
      'Simulacros UNI',
      'General',
      'Simulacro',
      'Pack Simulacros Tipo UNI',
      'Compilado de simulacros estilo admisión UNI para practicar bajo presión y medir avance por áreas.',
      'UNI',
      39,
      59,
      'Digital',
      99,
      'Activo',
      '',
      '',
      '',
      'Sí',
      'Más pedido',
      '📝',
      3,
      'Material de ejemplo. Falta Archivo Drive ID.'
    ]
  ];

  sheet.getRange(2, 1, rows.length, NSA_HEADERS.MATERIALS.length).setValues(rows);
}

function getActiveMaterials_() {
  return getAllMaterials_()
    .filter(item => item.status === 'Activo')
    .sort((a, b) => Number(a.order || 999) - Number(b.order || 999));
}

function getAllMaterials_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NSA_CONFIG.SHEETS.MATERIALS);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, NSA_HEADERS.MATERIALS.length).getValues();

  return values.map((row, index) => ({
    rowNumber: index + 2,
    id: String(row[0] || '').trim(),
    category: String(row[1] || '').trim(),
    course: String(row[2] || '').trim(),
    type: String(row[3] || '').trim(),
    name: String(row[4] || '').trim(),
    description: String(row[5] || '').trim(),
    level: String(row[6] || '').trim(),
    price: Number(row[7] || 0),
    oldPrice: Number(row[8] || 0),
    format: String(row[9] || '').trim(),
    stock: Number(row[10] || 0),
    status: String(row[11] || '').trim(),
    imageUrl: String(row[12] || '').trim(),
    previewUrl: String(row[13] || '').trim(),
    driveFileId: String(row[14] || '').trim(),
    digitalDelivery: String(row[15] || '').trim(),
    tag: String(row[16] || '').trim(),
    emoji: String(row[17] || '📚').trim(),
    order: Number(row[18] || 999),
    notes: String(row[19] || '').trim()
  })).filter(item => item.id && item.name);
}

function getActiveCategories_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NSA_CONFIG.SHEETS.CATEGORIES);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, NSA_HEADERS.CATEGORIES.length).getValues();

  return values.map(row => ({
    id: String(row[0] || '').trim(),
    category: String(row[1] || '').trim(),
    description: String(row[2] || '').trim(),
    emoji: String(row[3] || '').trim(),
    order: Number(row[4] || 999),
    status: String(row[5] || '').trim()
  })).filter(item => item.category && item.status === 'Activo')
    .sort((a, b) => itemOrder_(a) - itemOrder_(b));
}

function itemOrder_(item) {
  return Number(item.order || 999);
}

function normalizeOrder_(payload) {
  const customer = payload.customer || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const subtotal = Number(payload.subtotal || payload.total || 0);

  return {
    orderId: payload.orderId || `NSL-${Date.now()}`,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
    customer: {
      name: customer.name || payload.name || '',
      phone: customer.phone || payload.phone || '',
      email: customer.email || payload.email || '',
      delivery: customer.delivery || payload.delivery || '',
      notes: customer.notes || payload.notes || ''
    },
    items,
    subtotal,
    total: Number(payload.total || subtotal || 0),
    paymentMethod: payload.paymentMethod || '',
    status: payload.status || 'Nuevo',
    paymentStatus: payload.paymentStatus || 'Pendiente',
    deliveryStatus: payload.deliveryStatus || 'Pendiente',
    source: payload.source || 'Web NostraShop Académico'
  };
}

function validateOrder_(order) {
  if (!order.customer.name) throw new Error('Falta el nombre del cliente.');
  if (!order.customer.phone) throw new Error('Falta el celular del cliente.');
  if (!order.customer.email) throw new Error('Falta el correo del cliente.');
  if (!order.items.length) throw new Error('El pedido no tiene materiales.');
}

function validateStock_(items, materials) {
  items.forEach(item => {
    const material = materials.find(material => material.id === item.id);
    if (!material) throw new Error(`Material no encontrado: ${item.id}`);
    if (material.status !== 'Activo') throw new Error(`Material no disponible: ${material.name}`);

    const qty = Number(item.qty || 1);
    if (material.stock < qty) {
      throw new Error(`Stock insuficiente para ${material.name}. Disponible: ${material.stock}`);
    }
  });
}

function enrichOrder_(order, materials) {
  const enrichedItems = order.items.map(item => {
    const material = materials.find(material => material.id === item.id);
    const qty = Number(item.qty || 1);
    const price = Number(material.price || 0);

    return {
      id: material.id,
      name: material.name,
      category: material.category,
      course: material.course,
      type: material.type,
      format: material.format,
      price,
      qty,
      total: price * qty,
      driveFileId: material.driveFileId,
      digitalDelivery: material.digitalDelivery
    };
  });

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.total, 0);
  const hasDigital = enrichedItems.some(item => item.digitalDelivery === 'Sí' || item.format === 'Digital' || item.format === 'Ambos');

  return {
    ...order,
    items: enrichedItems,
    subtotal,
    total: subtotal,
    deliveryStatus: hasDigital ? 'Pendiente' : 'No aplica',
    downloadToken: Utilities.getUuid()
  };
}

function appendOrder_(sheet, order) {
  sheet.appendRow([
    order.createdAt,
    order.orderId,
    order.customer.name,
    order.customer.phone,
    order.customer.email,
    order.customer.delivery,
    order.subtotal,
    order.total,
    order.status,
    order.paymentStatus,
    order.deliveryStatus,
    order.paymentMethod,
    order.customer.notes,
    order.downloadToken,
    '',
    '',
    order.source
  ]);
}

function appendDetails_(sheet, order) {
  const rows = order.items.map(item => [
    order.createdAt,
    order.orderId,
    item.id,
    item.name,
    item.category,
    item.course,
    item.type,
    item.format,
    item.qty,
    item.price,
    item.total,
    item.driveFileId,
    item.digitalDelivery,
    item.digitalDelivery === 'Sí' ? 'Pendiente' : 'No aplica'
  ]);

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, NSA_HEADERS.DETAILS.length).setValues(rows);
  }
}

function decrementMaterialStock_(items) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NSA_CONFIG.SHEETS.MATERIALS);
  const materials = getAllMaterials_();

  items.forEach(item => {
    const material = materials.find(material => material.id === item.id);
    if (!material) return;

    const newStock = Math.max(Number(material.stock || 0) - Number(item.qty || 1), 0);
    sheet.getRange(material.rowNumber, 11).setValue(newStock);
    if (newStock <= 0) sheet.getRange(material.rowNumber, 12).setValue('Agotado');
  });
}

function actualizarEstadosMaterialesNostraShop() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(NSA_CONFIG.SHEETS.MATERIALS);
  if (!sheet || sheet.getLastRow() < 2) return;

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, NSA_HEADERS.MATERIALS.length).getValues();
  const statuses = values.map(row => {
    const id = String(row[0] || '').trim();
    const name = String(row[4] || '').trim();
    const stock = Number(row[10] || 0);
    const currentStatus = String(row[11] || '').trim();

    if (!id && !name) return [currentStatus];
    if (stock <= 0) return ['Agotado'];
    if (!currentStatus || currentStatus === 'Agotado') return ['Activo'];
    return [currentStatus];
  });

  sheet.getRange(2, 12, statuses.length, 1).setValues(statuses);
}

function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  if (sheet.getName() !== NSA_CONFIG.SHEETS.MATERIALS) return;
  if (e.range.getRow() < 2) return;
  if (e.range.getColumn() !== 11) return;

  const row = e.range.getRow();
  const stock = Number(sheet.getRange(row, 11).getValue() || 0);
  const currentStatus = String(sheet.getRange(row, 12).getValue() || '').trim();

  if (stock <= 0) sheet.getRange(row, 12).setValue('Agotado');
  else if (!currentStatus || currentStatus === 'Agotado') sheet.getRange(row, 12).setValue('Activo');
}

function crearDashboardNostraShopAcademico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = getOrCreateSheet_(ss, NSA_CONFIG.SHEETS.DASHBOARD, []);
  dashboard.clear();

  dashboard.getRange('A1:H1').merge()
    .setValue('DASHBOARD NOSTRASHOP ACADÉMICO')
    .setFontWeight('bold')
    .setFontSize(18)
    .setFontColor('#ffffff')
    .setBackground('#061426')
    .setHorizontalAlignment('center');

  dashboard.getRange('A3').setValue('Métrica').setFontWeight('bold').setBackground('#078c95').setFontColor('#ffffff');
  dashboard.getRange('B3').setValue('Valor').setFontWeight('bold').setBackground('#078c95').setFontColor('#ffffff');

  dashboard.getRange('A4').setValue('Total materiales activos');
  dashboard.getRange('B4').setFormula(`=COUNTIF(${NSA_CONFIG.SHEETS.MATERIALS}!L:L,"Activo")`);
  dashboard.getRange('A5').setValue('Materiales agotados');
  dashboard.getRange('B5').setFormula(`=COUNTIF(${NSA_CONFIG.SHEETS.MATERIALS}!L:L,"Agotado")`);
  dashboard.getRange('A6').setValue('Pedidos registrados');
  dashboard.getRange('B6').setFormula(`=COUNTA(${NSA_CONFIG.SHEETS.ORDERS}!B2:B)`);
  dashboard.getRange('A7').setValue('Ventas totales registradas');
  dashboard.getRange('B7').setFormula(`=SUM(${NSA_CONFIG.SHEETS.ORDERS}!H2:H)`).setNumberFormat('S/ #,##0.00');

  dashboard.getRange('D3:E3').setValues([['Estado pedido', 'Cantidad']]).setFontWeight('bold').setBackground('#061426').setFontColor('#ffffff');
  dashboard.getRange('D4').setFormula(`=QUERY(${NSA_CONFIG.SHEETS.ORDERS}!I2:I,"select I, count(I) where I is not null group by I label I 'Estado', count(I) 'Cantidad'",0)`);

  dashboard.getRange('G3:H3').setValues([['Categoría', 'Cantidad']]).setFontWeight('bold').setBackground('#061426').setFontColor('#ffffff');
  dashboard.getRange('G4').setFormula(`=QUERY(${NSA_CONFIG.SHEETS.MATERIALS}!B2:B,"select B, count(B) where B is not null group by B label B 'Categoría', count(B) 'Cantidad'",0)`);

  dashboard.autoResizeColumns(1, 8);
}

function sendOrderEmails_(order) {
  try {
    MailApp.sendEmail({
      to: order.customer.email,
      subject: `Pedido recibido - ${order.orderId}`,
      htmlBody: buildCustomerEmail_(order)
    });

    MailApp.sendEmail({
      to: NSA_CONFIG.OWNER_EMAIL,
      subject: `Nuevo pedido NostraShop - ${order.orderId}`,
      htmlBody: buildOwnerEmail_(order)
    });
  } catch (error) {
    Logger.log('No se pudieron enviar correos: ' + error.message);
  }
}

function buildCustomerEmail_(order) {
  const rows = order.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml_(item.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.qty}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">S/ ${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;background:#f4f8fa;padding:24px;">
      <div style="max-width:680px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #dbe5ef;">
        <div style="background:#061426;color:white;text-align:center;padding:24px;">
          <h2 style="margin:0;color:white;">NostraShop Académico</h2>
          <p style="margin:8px 0 0;color:#b9f8ff;">Pedido recibido correctamente</p>
        </div>
        <div style="padding:24px;">
          <p>Hola <strong>${escapeHtml_(order.customer.name)}</strong>, recibimos tu pedido.</p>
          <p><strong>Código:</strong> ${escapeHtml_(order.orderId)}</p>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;">
            <thead><tr style="background:#eaf7f8;"><th style="padding:10px;text-align:left;">Material</th><th>Cant.</th><th style="text-align:right;padding:10px;">Total</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="text-align:right;">Total: S/ ${order.total.toFixed(2)}</h3>
          <p>Te contactaremos para confirmar pago y entrega.</p>
        </div>
      </div>
    </div>
  `;
}

function buildOwnerEmail_(order) {
  const rows = order.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${escapeHtml_(item.name)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.qty}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">S/ ${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;background:#f4f8fa;padding:24px;">
      <div style="max-width:760px;margin:auto;background:white;border-radius:18px;overflow:hidden;border:1px solid #dbe5ef;">
        <div style="background:#061426;color:white;text-align:center;padding:24px;">
          <h2 style="margin:0;color:white;">Nuevo pedido NostraShop</h2>
          <p style="margin:8px 0 0;color:#b9f8ff;">${escapeHtml_(order.orderId)}</p>
        </div>
        <div style="padding:24px;">
          <p><strong>Cliente:</strong> ${escapeHtml_(order.customer.name)}</p>
          <p><strong>Celular:</strong> ${escapeHtml_(order.customer.phone)}</p>
          <p><strong>Correo:</strong> ${escapeHtml_(order.customer.email)}</p>
          <p><strong>Entrega:</strong> ${escapeHtml_(order.customer.delivery)}</p>
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;">
            <thead><tr style="background:#eaf7f8;"><th style="padding:10px;text-align:left;">Material</th><th>Cant.</th><th style="text-align:right;padding:10px;">Total</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="text-align:right;">Total: S/ ${order.total.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  `;
}

function crearPedidoPruebaNostraShopAcademico() {
  const payload = {
    orderId: `TEST-NSL-${Date.now()}`,
    customer: {
      name: 'Cliente Prueba NostraShop',
      phone: '999999999',
      email: NSA_CONFIG.OWNER_EMAIL,
      delivery: 'Entrega digital',
      notes: 'Pedido generado para prueba del sistema.'
    },
    items: [
      { id: 'solucionario-fisica-uni-002', qty: 1 }
    ],
    source: 'Prueba Apps Script'
  };

  const fakeEvent = {
    postData: {
      contents: JSON.stringify(payload)
    }
  };

  const response = doPost(fakeEvent);
  Logger.log(response.getContent());
}

function limpiarPruebasNostraShopAcademico() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  eliminarFilasPorTexto_(ss.getSheetByName(NSA_CONFIG.SHEETS.ORDERS), 2, 'TEST-NSL');
  eliminarFilasPorTexto_(ss.getSheetByName(NSA_CONFIG.SHEETS.DETAILS), 2, 'TEST-NSL');
  crearDashboardNostraShopAcademico();
}

function eliminarFilasPorTexto_(sheet, column, text) {
  if (!sheet || sheet.getLastRow() < 2) return;

  for (let row = sheet.getLastRow(); row >= 2; row--) {
    const value = String(sheet.getRange(row, column).getValue() || '');
    if (value.includes(text)) sheet.deleteRow(row);
  }
}

function escapeHtml_(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
