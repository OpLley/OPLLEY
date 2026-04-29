// ═══════════════════════════════════════════════════════════
//  LLEY-OPERACIONES · Bitácora — Google Apps Script Backend
//  Pega este código en: script.google.com → nuevo proyecto
// ═══════════════════════════════════════════════════════════

// ── CONFIGURACIÓN ──────────────────────────────────────────
const SHEET_NAME   = 'Bitácora';          // Nombre de la hoja
const ADMIN_PASS   = 'lley2024';          // Cambia esta contraseña
const HEADERS = ['ID','Fecha','Categoría','Título','Anotación','Etiquetas','Fotos','Usuario','Sincronizado'];

// ── INICIALIZAR HOJA ────────────────────────────────────────
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  // Encabezados
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  // Formato encabezados
  const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
  hdr.setBackground('#1877f2');
  hdr.setFontColor('#ffffff');
  hdr.setFontWeight('bold');
  hdr.setFontSize(10);

  // Anchos de columna
  sheet.setColumnWidth(1, 80);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 300);
  sheet.setColumnWidth(6, 160);
  sheet.setColumnWidth(7, 60);
  sheet.setColumnWidth(8, 120);
  sheet.setColumnWidth(9, 120);

  sheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert('✅ Hoja configurada correctamente.');
}

// ── MANEJO DE REQUESTS ──────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'addRecord';

    if (action === 'addRecord')    return addRecord(data);
    if (action === 'addBatch')     return addBatch(data);
    if (action === 'deleteRecord') return deleteRecord(data);

    return respond({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return respond({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action || 'getAll';

    if (action === 'auth') {
      const ok = e.parameter.pass === ADMIN_PASS;
      return respond({ ok, role: ok ? 'admin' : null });
    }

    if (action === 'getAll') {
      if (e.parameter.pass !== ADMIN_PASS)
        return respond({ ok: false, error: 'No autorizado' });
      return respond({ ok: true, records: getAllRecords() });
    }

    if (action === 'getStats') {
      if (e.parameter.pass !== ADMIN_PASS)
        return respond({ ok: false, error: 'No autorizado' });
      return respond({ ok: true, stats: getStats() });
    }

    return respond({ ok: false, error: 'Acción desconocida' });
  } catch (err) {
    return respond({ ok: false, error: err.toString() });
  }
}

// ── AGREGAR UN REGISTRO ─────────────────────────────────────
function addRecord(data) {
  const sheet = getSheet();
  const now   = new Date().toLocaleString('es-MX', { timeZone: 'America/Tijuana' });

  sheet.appendRow([
    data.id          || '',
    data.createdAt   || now,
    data.category    || '',
    data.title       || 'Sin título',
    data.text        || '',
    (data.tags || []).join(', '),
    data.photoCount  || 0,
    data.user        || 'Trabajador',
    now
  ]);

  // Alternar color de filas
  const lastRow = sheet.getLastRow();
  if (lastRow % 2 === 0) {
    sheet.getRange(lastRow, 1, 1, HEADERS.length).setBackground('#f0f4ff');
  }

  return respond({ ok: true, row: lastRow });
}

// ── AGREGAR LOTE (sincronización inicial) ───────────────────
function addBatch(data) {
  const sheet   = getSheet();
  const records = data.records || [];
  let added = 0;

  // Obtener IDs existentes para no duplicar
  const existingIds = new Set();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
    ids.forEach(id => existingIds.add(id));
  }

  records.forEach(r => {
    if (existingIds.has(r.id)) return; // ya existe
    const now = new Date().toLocaleString('es-MX', { timeZone: 'America/Tijuana' });
    sheet.appendRow([
      r.id, r.createdAt, r.category, r.title || 'Sin título',
      r.text || '', (r.tags || []).join(', '), r.photoCount || 0,
      r.user || 'Trabajador', now
    ]);
    added++;
  });

  return respond({ ok: true, added });
}

// ── ELIMINAR REGISTRO ───────────────────────────────────────
function deleteRecord(data) {
  const sheet = getSheet();
  const id    = data.id;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return respond({ ok: false, error: 'Sin registros' });

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const idx = ids.indexOf(id);
  if (idx === -1) return respond({ ok: false, error: 'Registro no encontrado' });

  sheet.deleteRow(idx + 2);
  return respond({ ok: true });
}

// ── LEER TODOS LOS REGISTROS ────────────────────────────────
function getAllRecords() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return data.map(row => ({
    id:         row[0],
    createdAt:  row[1],
    category:   row[2],
    title:      row[3],
    text:       row[4],
    tags:       row[5] ? row[5].split(', ').filter(Boolean) : [],
    photoCount: row[6],
    user:       row[7],
    syncedAt:   row[8]
  })).filter(r => r.id);
}

// ── ESTADÍSTICAS ────────────────────────────────────────────
function getStats() {
  const records = getAllRecords();
  const catCount = {};
  records.forEach(r => {
    catCount[r.category] = (catCount[r.category] || 0) + 1;
  });
  return {
    total:    records.length,
    byCategory: catCount,
    lastSync: records.length ? records[records.length - 1].syncedAt : null
  };
}

// ── HELPERS ─────────────────────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    const hdr = sheet.getRange(1, 1, 1, HEADERS.length);
    hdr.setBackground('#1877f2');
    hdr.setFontColor('#ffffff');
    hdr.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
