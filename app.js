// SISTEMA DE REGISTRO DE TERRENOS MUNICIPALES - APP.JS (GENERACIÓN Y SYNC 100% EN VIVO)

// 1. BASE DE DATOS DE LOS 4 USUARIOS AUTORIZADOS Y CLAVES
const AUTHORIZED_USERS = {
  'USR-CAT-01': { name: 'Ing. Roberto Gómez', role: 'Director Catastro', key: 'CAT-9821-KEY', avatar: 'RG' },
  'USR-JUR-02': { name: 'Dra. Elena Rostova', role: 'Asesora Jurídica', key: 'JUR-4410-KEY', avatar: 'ER' },
  'USR-INS-03': { name: 'Arq. Carlos Mendoza', role: 'Inspector Zonal 1', key: 'INS-7732-KEY', avatar: 'CM' },
  'USR-INS-04': { name: 'Lic. Sofía Benítez', role: 'Inspectora Zonal 2', key: 'INS-3109-KEY', avatar: 'SB' }
};

// TERRENOS POR DEFECTO SI NO HAY DATOS PREVIOS
const INITIAL_LANDS = [
  { code: 'CAT-2026-001', zone: 'Centro Histórico', address: 'Av. Bolívar #450 entre Calle 4 y 5', owner: 'Constructora Urbana S.A.', docId: 'J-30948271-0', frente: 20.0, fondo: 40.0, coords: '-12.04637, -77.04279', limits: 'N: Av. Bolívar / S: Lote 12 / E: Calle 4 / O: Prop. Privada', usage: 'Comercial', status: 'Titulado', value: 120000.0, date: '2026-01-15', user: 'USR-CAT-01' },
  { code: 'CAT-2026-002', zone: 'San Martín', address: 'Calle Los Álamos Lote 8 Mz B', owner: 'María Elena Morales', docId: '0801198504932', frente: 12.5, fondo: 25.0, coords: '-12.04981, -77.03921', limits: 'N: Calle Los Álamos / S: Lote 9 / E: Pasaje A / O: Lote 7', usage: 'Residencial', status: 'Titulado', value: 38500.0, date: '2026-01-18', user: 'USR-INS-03' },
  { code: 'CAT-2026-003', zone: 'Industrial Norte', address: 'Vía Panamericana Km 14 Parcelación 4', owner: 'Logística del Norte Corp', docId: 'J-40192834-5', frente: 50.0, fondo: 120.0, coords: '-12.01234, -77.08765', limits: 'N: Vía Panamericana / S: Canal / E: Lote Ind 5 / O: Av. Fabril', usage: 'Industrial', status: 'Titulado', value: 350000.0, date: '2026-01-20', user: 'USR-CAT-01' },
  { code: 'CAT-2026-004', zone: 'Los Pinos', address: 'Av. Las Gardenias #1200', owner: 'Gobierno Municipal (Área Verde)', docId: 'M-00019283-0', frente: 40.0, fondo: 60.0, coords: '-12.05892, -77.02341', limits: 'N: Av. Gardenias / S: Quebrada / E: Calle 2 / O: Lote 14', usage: 'Equipamiento Urbano', status: 'Dominio Público', value: 95000.0, date: '2026-02-01', user: 'USR-JUR-02' },
  { code: 'CAT-2026-005', zone: 'El Recreo', address: 'Calle 8 de Diciembre #312', owner: 'Carlos Alberto Mendoza', docId: '0102938475', frente: 10.0, fondo: 30.0, coords: '-12.06112, -77.03119', limits: 'N: Calle 8 / S: Lote 4 / E: Prop. Gómez / O: Lote 2', usage: 'Residencial', status: 'En Trámite', value: 42000.0, date: '2026-02-05', user: 'USR-INS-04' }
];

// ESTADO GLOBAL
let currentUser = null;
let landRecords = [];

// ELEMENTOS DOM
const authOverlay = document.getElementById('authOverlay');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const userSelect = document.getElementById('userSelect');
const userKeyInput = document.getElementById('userKey');
const authError = document.getElementById('authError');

const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userRole = document.getElementById('userRole');
const btnLogout = document.getElementById('btnLogout');

const searchInput = document.getElementById('searchInput');
const filterZone = document.getElementById('filterZone');
const filterStatus = document.getElementById('filterStatus');

const tableBody = document.getElementById('tableBody');
const tableCounter = document.getElementById('tableCounter');

const kpiTotalRecords = document.getElementById('kpiTotalRecords');
const kpiTotalAreaM2 = document.getElementById('kpiTotalAreaM2');
const kpiTotalAreaHa = document.getElementById('kpiTotalAreaHa');
const kpiTotalValue = document.getElementById('kpiTotalValue');
const kpiTotalTax = document.getElementById('kpiTotalTax');

const recordModal = document.getElementById('recordModal');
const btnNewRecord = document.getElementById('btnNewRecord');
const btnCloseModal = document.getElementById('btnCloseModal');
const btnCancelModal = document.getElementById('btnCancelModal');
const landForm = document.getElementById('landForm');

const inputFrente = document.getElementById('inputFrente');
const inputFondo = document.getElementById('inputFondo');
const inputValor = document.getElementById('inputValor');
const inputAreaM2 = document.getElementById('inputAreaM2');
const inputAreaHa = document.getElementById('inputAreaHa');
const inputTax = document.getElementById('inputTax');

const btnDownloadExcel = document.getElementById('btnDownloadExcel');
const btnExportJson = document.getElementById('btnExportJson');
const inputImportJson = document.getElementById('inputImportJson');

const githubModal = document.getElementById('githubModal');
const btnGithubModal = document.getElementById('btnGithubModal');
const btnCloseGithub = document.getElementById('btnCloseGithub');
const btnPushToGithub = document.getElementById('btnPushToGithub');
const btnFetchFromGithub = document.getElementById('btnFetchFromGithub');
const inputGithubRepo = document.getElementById('inputGithubRepo');
const inputGithubToken = document.getElementById('inputGithubToken');
const syncResult = document.getElementById('syncResult');


// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadInitialData();
  checkSavedSession();
});

// Carga Inteligente de Datos (LocalStorage -> Backend -> Github Pages -> Defaults)
async function loadInitialData() {
  // 1. Intentar LocalStorage primero (para no perder datos recién creados en el navegador)
  const localData = localStorage.getItem('landRecords');
  if (localData) {
    try {
      landRecords = JSON.parse(localData);
      renderTable();
      console.log('✅ Carga desde LocalStorage exitosa');
    } catch (e) {
      console.error('Error parseando LocalStorage', e);
    }
  }

  // 2. Intentar backend / JSON local
  try {
    const res = await fetch('/api/records');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.records) && data.records.length > 0) {
        // Si el backend tiene más registros o local estaba vacío
        if (!localData || data.records.length >= landRecords.length) {
          landRecords = data.records;
          localStorage.setItem('landRecords', JSON.stringify(landRecords));
          renderTable();
          console.log('✅ Carga desde Servidor Backend / JSON exitosa');
        }
      }
    }
  } catch (err) {
    // Si estamos en GitHub Pages sin backend
    if (landRecords.length === 0) {
      try {
        const ghRes = await fetch('data/land_records.json');
        if (ghRes.ok) {
          landRecords = await ghRes.json();
          localStorage.setItem('landRecords', JSON.stringify(landRecords));
          renderTable();
        }
      } catch (e) {
        landRecords = INITIAL_LANDS;
        localStorage.setItem('landRecords', JSON.stringify(landRecords));
        renderTable();
      }
    }
  }

  if (landRecords.length === 0) {
    landRecords = INITIAL_LANDS;
    localStorage.setItem('landRecords', JSON.stringify(landRecords));
    renderTable();
  }
}

// Guardar registros en LocalStorage y Backend
async function saveAndSyncRecords(actionDescription) {
  // Guardar inmediatamente en LocalStorage para garantizar persisencia en el navegador
  localStorage.setItem('landRecords', JSON.stringify(landRecords));
  renderTable();

  // Intentar backend local si está activo
  try {
    fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: landRecords,
        modifiedBy: currentUser ? currentUser.id : 'USR-CAT-01',
        action: actionDescription || 'Modificación de Terrenos'
      })
    });
  } catch (e) {
    console.log('Modo Estático / GitHub Pages activo');
  }

  showToast(`✅ Cambios guardados. Total: ${landRecords.length} terrenos.`);
}


// GENERADOR EN TIEMPO REAL DEL EXCEL (.XLSX) EN EL NAVEGADOR (100% GARANTIZADO)
async function downloadExcelInBrowser() {
  if (typeof ExcelJS === 'undefined') {
    alert('Espere un momento mientras se carga la librería ExcelJS en el navegador.');
    return;
  }

  showToast('⏳ Generando Excel actualizado con todos los predios...');

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Catastro Municipal';
  workbook.lastModifiedBy = currentUser ? currentUser.name : 'Director de Catastro';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------
  // HOJA 1: REGISTRO DE TERRENOS
  // ---------------------------------------------------------
  const sheet1 = workbook.addWorksheet('1. Registro de Terrenos', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }] // Fila superior inmovilizada (rows 1-5 fixed)
  });

  // Encabezado Superior
  sheet1.mergeCells('A1:Q1');
  const t1 = sheet1.getCell('A1');
  t1.value = 'SISTEMA UNIFICADO DE REGISTRO CATASTRAL DE TERRENOS MUNICIPALES';
  t1.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  t1.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 36;

  sheet1.mergeCells('A2:Q2');
  const t2 = sheet1.getCell('A2');
  t2.value = 'Base de Datos Oficial para Gestión Territorial y Colaboración en GitHub (Acceso Restringido - 4 Usuarios Autorizados)';
  t2.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '94A3B8' } };
  t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
  t2.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(2).height = 22;

  sheet1.mergeCells('A3:Q3');
  const t3 = sheet1.getCell('A3');
  t3.value = `📌 NOTA: Cabecera inmovilizada. Fórmulas activas. Descarga en vivo (${landRecords.length} terrenos incluidos) - ${new Date().toLocaleString('es-ES')}`;
  t3.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '0369A1' } };
  t3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
  t3.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  sheet1.getRow(3).height = 20;

  sheet1.getRow(4).height = 8;

  // Nombres de Columnas (Fila 5)
  const headers = [
    'Código Catastral', 'Zona / Barrio', 'Dirección Exacta', 'Propietario / Titular',
    'Documento ID / RUC', 'Frente (m)', 'Fondo (m)', 'Superficie (m²)', 'Superficie (Ha)',
    'Coordenadas GPS (Lat, Lng)', 'Límites y Linderos', 'Finalidad / Uso de Suelo',
    'Estatus Legal', 'Valor Catastral ($)', 'Impuesto Anual ($)', 'Fecha Registro', 'Usuario Registrador'
  ];

  const headerRow = sheet1.getRow(5);
  headerRow.height = 30;
  headers.forEach((hText, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = hText;
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: '334155' } },
      left: { style: 'thin', color: { argb: '334155' } },
      bottom: { style: 'medium', color: { argb: '0F172A' } },
      right: { style: 'thin', color: { argb: '334155' } }
    };
  });

  sheet1.autoFilter = { from: { row: 5, column: 1 }, to: { row: 5, column: 17 } };

  // Renderizar exactamente los terrenos presentes en pantalla
  const startRow = 6;
  landRecords.forEach((rec, idx) => {
    const rowNum = startRow + idx;
    const r = sheet1.getRow(rowNum);
    r.height = 24;

    const frente = parseFloat(rec.frente) || 0;
    const fondo = parseFloat(rec.fondo) || 0;
    const val = parseFloat(rec.value) || 0;

    r.getCell(1).value = rec.code;
    r.getCell(2).value = rec.zone;
    r.getCell(3).value = rec.address;
    r.getCell(4).value = rec.owner;
    r.getCell(5).value = rec.docId;
    r.getCell(6).value = frente;
    r.getCell(7).value = fondo;

    // FÓRMULAS AUTOMÁTICAS NATIVAS DE EXCEL
    r.getCell(8).value = { formula: `F${rowNum}*G${rowNum}` };
    r.getCell(9).value = { formula: `H${rowNum}/10000` };

    const coordsStr = rec.coords || '';
    r.getCell(10).value = {
      text: coordsStr,
      hyperlink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordsStr)}`,
      tooltip: 'Abrir mapa'
    };

    r.getCell(11).value = rec.limits || '';
    r.getCell(12).value = rec.usage || 'Residencial';
    r.getCell(13).value = rec.status || 'Titulado';
    r.getCell(14).value = val;
    r.getCell(15).value = { formula: `N${rowNum}*0.005` };
    r.getCell(16).value = rec.date || new Date().toISOString().split('T')[0];
    r.getCell(17).value = rec.user || 'USR-CAT-01';

    // Formatos de celdas
    r.getCell(6).numberFormat = '#,##0.00 "m"';
    r.getCell(7).numberFormat = '#,##0.00 "m"';
    r.getCell(8).numberFormat = '#,##0.00 "m²"';
    r.getCell(9).numberFormat = '0.0000 "Ha"';
    r.getCell(14).numberFormat = '"$"#,##0.00';
    r.getCell(15).numberFormat = '"$"#,##0.00';

    const rowBg = idx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    for (let c = 1; c <= 17; c++) {
      const cell = r.getCell(c);
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: c === 10 ? '0284C7' : '1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };

      if ([1, 5, 10, 16, 17].includes(c)) cell.alignment = { horizontal: 'center', vertical: 'middle' };
      else if ([6, 7, 8, 9, 14, 15].includes(c)) cell.alignment = { horizontal: 'right', vertical: 'middle' };
      else cell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    // Coloreado Estatus Badge
    const stCell = r.getCell(13);
    const st = rec.status;
    if (st === 'Titulado') stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
    else if (st === 'En Trámite') stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } };
    else if (st === 'Dominio Público') stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
    else if (st === 'En Litigio') stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
  });

  const colWidths = [18, 22, 34, 28, 18, 14, 14, 18, 16, 24, 38, 22, 18, 20, 20, 16, 20];
  colWidths.forEach((w, i) => sheet1.getColumn(i + 1).width = w);

  // Fila de Totales Generales
  const endRowIndex = startRow + landRecords.length - 1;
  const totalRowIndex = endRowIndex + 1;
  const totalRow = sheet1.getRow(totalRowIndex);
  totalRow.height = 28;

  totalRow.getCell(1).value = 'TOTALES GENERALES';
  sheet1.mergeCells(`A${totalRowIndex}:G${totalRowIndex}`);

  const labelCell = totalRow.getCell(1);
  labelCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  labelCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };

  if (landRecords.length > 0) {
    totalRow.getCell(8).value = { formula: `SUM(H6:H${endRowIndex})` };
    totalRow.getCell(9).value = { formula: `SUM(I6:I${endRowIndex})` };
    totalRow.getCell(14).value = { formula: `SUM(N6:N${endRowIndex})` };
    totalRow.getCell(15).value = { formula: `SUM(O6:O${endRowIndex})` };
  } else {
    totalRow.getCell(8).value = 0; totalRow.getCell(9).value = 0;
    totalRow.getCell(14).value = 0; totalRow.getCell(15).value = 0;
  }

  [8, 9, 14, 15].forEach(col => {
    const cCell = totalRow.getCell(col);
    cCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    cCell.alignment = { horizontal: 'right', vertical: 'middle' };
  });
  totalRow.getCell(8).numberFormat = '#,##0.00 "m²"';
  totalRow.getCell(9).numberFormat = '0.0000 "Ha"';
  totalRow.getCell(14).numberFormat = '"$"#,##0.00';
  totalRow.getCell(15).numberFormat = '"$"#,##0.00';

  for (let c = 10; c <= 17; c++) {
    if (c !== 14 && c !== 15) totalRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  }

  // ---------------------------------------------------------
  // HOJA 2: CONTROL DE USUARIOS Y CLAVES
  // ---------------------------------------------------------
  const sheet2 = workbook.addWorksheet('2. Control de Usuarios y Claves', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }]
  });

  sheet2.mergeCells('A1:F1');
  const uTitle = sheet2.getCell('A1');
  uTitle.value = 'REGISTRO DE USUARIOS AUTORIZADOS Y CLAVES DE ACCESO CATASTRAL (MÁX. 4 PERSONAS)';
  uTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  uTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  uTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(1).height = 32;

  sheet2.mergeCells('A2:F2');
  const uSub = sheet2.getCell('A2');
  uSub.value = '🔒 Solo las 4 personas registradas poseen credenciales para editar y firmar commits en GitHub';
  uSub.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'DC2626' } };
  uSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF2F2' } };
  uSub.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet2.getRow(2).height = 22;

  const uHeaders = ['ID Usuario', 'Nombre Completo', 'Rol / Cargo Catastral', 'Clave de Acceso / PIN', 'Estado', 'Nivel Permisos'];
  const uHeaderRow = sheet2.getRow(3);
  uHeaderRow.height = 26;
  uHeaders.forEach((text, i) => {
    const cell = uHeaderRow.getCell(i + 1);
    cell.value = text;
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  const usersData = [
    { id: 'USR-CAT-01', name: 'Ing. Roberto Gómez', role: 'Director de Catastro Municipal', key: 'CAT-9821-KEY', status: 'Activo', access: 'Administrador Total (Read/Write/Commit)' },
    { id: 'USR-JUR-02', name: 'Dra. Elena Rostova', role: 'Asesora Jurídica & Estatus Legal', key: 'JUR-4410-KEY', status: 'Activo', access: 'Edición Estatus & Legales' },
    { id: 'USR-INS-03', name: 'Arq. Carlos Mendoza', role: 'Inspector Zonal 1 (Norte & Centro)', key: 'INS-7732-KEY', status: 'Activo', access: 'Registro & Medición de Campo' },
    { id: 'USR-INS-04', name: 'Lic. Sofía Benítez', role: 'Inspectora Zonal 2 (Sur & Este)', key: 'INS-3109-KEY', status: 'Activo', access: 'Registro & Medición de Campo' }
  ];

  usersData.forEach((u, idx) => {
    const rowNum = 4 + idx;
    const row = sheet2.getRow(rowNum);
    row.height = 24;
    row.getCell(1).value = u.id;
    row.getCell(2).value = u.name;
    row.getCell(3).value = u.role;
    row.getCell(4).value = u.key;
    row.getCell(5).value = u.status;
    row.getCell(6).value = u.access;

    for (let c = 1; c <= 6; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
      if (c === 4) {
        cell.font = { name: 'Consolas', size: 11, bold: true, color: { argb: '0369A1' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F9FF' } };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } }, left: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } }, right: { style: 'thin', color: { argb: 'CBD5E1' } }
      };
      cell.alignment = { horizontal: c === 1 || c === 4 || c === 5 ? 'center' : 'left', vertical: 'middle' };
    }
  });
  [18, 26, 32, 22, 14, 34].forEach((w, i) => sheet2.getColumn(i + 1).width = w);

  // ---------------------------------------------------------
  // HOJA 3: RESUMEN Y ESTADÍSTICAS
  // ---------------------------------------------------------
  const sheet3 = workbook.addWorksheet('3. Resumen y Estadísticas');
  sheet3.mergeCells('A1:D1');
  const sTitle = sheet3.getCell('A1');
  sTitle.value = 'RESUMEN EJECUTIVO DEL REGISTRO DE TERRENOS';
  sTitle.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  sTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet3.getRow(1).height = 32;

  const kpis = [
    { label: 'Total Predios Registrados', formula: `=COUNTA('1. Registro de Terrenos'!A6:A${endRowIndex})`, fmt: '#,##0' },
    { label: 'Superficie Total Registrada (m²)', formula: `=SUM('1. Registro de Terrenos'!H6:H${endRowIndex})`, fmt: '#,##0.00 "m²"' },
    { label: 'Superficie Total Registrada (Hectáreas)', formula: `=SUM('1. Registro de Terrenos'!I6:I${endRowIndex})`, fmt: '0.0000 "Ha"' },
    { label: 'Valor Catastral Total del Suelo ($)', formula: `=SUM('1. Registro de Terrenos'!N6:N${endRowIndex})`, fmt: '"$"#,##0.00' },
    { label: 'Recaudación Impuesto Anual Estimada ($)', formula: `=SUM('1. Registro de Terrenos'!O6:O${endRowIndex})`, fmt: '"$"#,##0.00' }
  ];

  kpis.forEach((kpi, idx) => {
    const rowNum = 3 + idx;
    const row = sheet3.getRow(rowNum);
    row.height = 24;
    sheet3.mergeCells(`A${rowNum}:B${rowNum}`);
    const lCell = row.getCell(1);
    lCell.value = kpi.label;
    lCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '1E293B' } };
    lCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
    lCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

    const vCell = row.getCell(3);
    vCell.value = { formula: kpi.formula };
    vCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: '0F172A' } };
    vCell.numberFormat = kpi.fmt;
    vCell.alignment = { horizontal: 'right', vertical: 'middle' };
    vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
  });
  sheet3.getColumn(1).width = 30; sheet3.getColumn(2).width = 15; sheet3.getColumn(3).width = 25;

  // Generar Buffer y Descargar en Navegador
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Registro_De_Terrenos_Municipal.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showToast(`✅ Descargado Excel con ${landRecords.length} terrenos`);
}


// CONFIGURACIÓN DE EVENTOS
function setupEventListeners() {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = userSelect.value;
    const key = userKeyInput.value.trim();

    if (AUTHORIZED_USERS[userId] && AUTHORIZED_USERS[userId].key === key) {
      currentUser = { id: userId, ...AUTHORIZED_USERS[userId] };
      localStorage.setItem('cadastreSessionUser', JSON.stringify(currentUser));
      authError.classList.add('hidden');
      loginSuccess();
    } else {
      authError.classList.remove('hidden');
    }
  });

  btnLogout.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('cadastreSessionUser');
    authOverlay.classList.remove('hidden');
    appContainer.classList.add('blur-content');
  });

  // Filtros en tiempo real
  searchInput.addEventListener('input', renderTable);
  filterZone.addEventListener('change', renderTable);
  filterStatus.addEventListener('change', renderTable);

  // Modal Nuevo/Editar Terreno
  btnNewRecord.addEventListener('click', () => openRecordModal());
  btnCloseModal.addEventListener('click', () => recordModal.classList.add('hidden'));
  btnCancelModal.addEventListener('click', () => recordModal.classList.add('hidden'));

  // Cálculo automático de Superficie m², Hectáreas e Impuesto
  [inputFrente, inputFondo, inputValor].forEach(input => {
    input.addEventListener('input', calculateFormValues);
  });

  landForm.addEventListener('submit', handleSaveRecord);

  // BOTÓN DESCARGAR EXCEL (SIEMPRE GENERA EL EXCEL ACTUALIZADO EN VIVO)
  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener('click', (e) => {
      e.preventDefault();
      downloadExcelInBrowser();
    });
  }

  // BOTÓN EXPORTAR JSON BACKUP
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(landRecords, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'land_records_backup.json');
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  // BOTÓN IMPORTAR JSON BACKUP
  if (inputImportJson) {
    inputImportJson.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            landRecords = imported;
            saveAndSyncRecords('Importación Backup JSON');
            showToast(`✅ Importados ${landRecords.length} terrenos exitosamente`);
          }
        } catch (err) {
          alert('Error: Archivo JSON no válido');
        }
      };
      reader.readAsText(file);
    });
  }

  // Modal GitHub Sync
  btnGithubModal.addEventListener('click', () => {
    if (localStorage.getItem('gh_token')) inputGithubToken.value = localStorage.getItem('gh_token');
    if (localStorage.getItem('gh_repo')) inputGithubRepo.value = localStorage.getItem('gh_repo');
    githubModal.classList.remove('hidden');
  });
  btnCloseGithub.addEventListener('click', () => githubModal.classList.add('hidden'));

  // SINCRONIZAR A GITHUB DIRECTAMENTE VÍA API O SERVIDOR
  btnPushToGithub.addEventListener('click', async () => {
    const repo = inputGithubRepo.value.trim() || 'alcion8/datos';
    const token = inputGithubToken.value.trim();

    if (token) localStorage.setItem('gh_token', token);
    localStorage.setItem('gh_repo', repo);

    btnPushToGithub.disabled = true;
    syncResult.classList.remove('hidden');
    syncResult.innerHTML = '⏳ Conectando con GitHub API...';

    // 1. Si hay Token, intentar Push directo a GitHub API (funciona en GitHub Pages!)
    if (token) {
      try {
        const path = 'data/land_records.json';
        const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
        let sha = null;

        const getRes = await fetch(getUrl, { headers: { 'Authorization': `token ${token}` } });
        if (getRes.ok) {
          const getJson = await getRes.json();
          sha = getJson.sha;
        }

        const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(landRecords, null, 2))));
        const putBody = {
          message: `Sync Catastral: ${landRecords.length} predios registrados por ${currentUser ? currentUser.id : 'Admin'}`,
          content: contentEncoded,
          sha: sha
        };

        const putRes = await fetch(getUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putBody)
        });

        if (putRes.ok) {
          syncResult.innerHTML = `✅ <strong>Sincronización Exitosa con GitHub (${repo})!</strong><br>La base de datos y registros están al día en GitHub Pages.`;
        } else {
          const errData = await putRes.json();
          syncResult.innerHTML = `⚠️ Error GitHub API: ${errData.message || 'Verifique el token'}`;
        }
      } catch (err) {
        syncResult.innerHTML = `⚠️ Error enviando a GitHub: ${err.message}`;
      } finally {
        btnPushToGithub.disabled = false;
      }
      return;
    }

    // 2. Si no hay token, intentar servidor backend local
    try {
      const res = await fetch('/api/sync-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser ? currentUser.id : 'USR-CAT-01' })
      });
      const data = await res.json();
      syncResult.innerHTML = `✅ ${data.message}`;
    } catch (err) {
      syncResult.innerHTML = `💡 Ingrese su <strong>GitHub Personal Access Token</strong> arriba para sincronizar directamente con <code>${repo}</code>`;
    } finally {
      btnPushToGithub.disabled = false;
    }
  });

  // CARGAR DATOS DESDE GITHUB REPO (alcion8/datos)
  btnFetchFromGithub.addEventListener('click', async () => {
    const repo = inputGithubRepo.value.trim() || 'alcion8/datos';
    try {
      const ghUrl = `https://raw.githubusercontent.com/${repo}/main/data/land_records.json?t=${Date.now()}`;
      const res = await fetch(ghUrl);
      if (res.ok) {
        const remoteData = await res.json();
        if (Array.isArray(remoteData)) {
          landRecords = remoteData;
          saveAndSyncRecords('Sincronizado desde GitHub');
          syncResult.classList.remove('hidden');
          syncResult.innerHTML = `✅ <strong>Cargados ${landRecords.length} terrenos desde GitHub (${repo})!</strong>`;
        }
      } else {
        alert(`No se pudo encontrar data/land_records.json en ${repo}`);
      }
    } catch (err) {
      alert('Error cargando desde GitHub: ' + err.message);
    }
  });
}

function checkSavedSession() {
  const saved = localStorage.getItem('cadastreSessionUser');
  if (saved) {
    currentUser = JSON.parse(saved);
    loginSuccess();
  }
}

function loginSuccess() {
  authOverlay.classList.add('hidden');
  appContainer.classList.remove('blur-content');

  userAvatar.textContent = currentUser.avatar;
  userName.textContent = currentUser.name;
  userRole.textContent = currentUser.role;

  renderTable();
}

// CÁLCULOS DEL FORMULARIO
function calculateFormValues() {
  const frente = parseFloat(inputFrente.value) || 0;
  const fondo = parseFloat(inputFondo.value) || 0;
  const valor = parseFloat(inputValor.value) || 0;

  const areaM2 = frente * fondo;
  const areaHa = areaM2 / 10000;
  const tax = valor * 0.005;

  inputAreaM2.value = areaM2 > 0 ? `${areaM2.toLocaleString('es-ES', { minimumFractionDigits: 2 })} m²` : '';
  inputAreaHa.value = areaHa > 0 ? `${areaHa.toFixed(4)} Ha` : '';
  inputTax.value = tax > 0 ? `$${tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '';
}

// RENDERIZADO DE TABLA Y KPIS
function renderTable() {
  const query = searchInput.value.toLowerCase().trim();
  const zoneVal = filterZone.value;
  const statusVal = filterStatus.value;

  const filtered = landRecords.filter(item => {
    const matchesSearch = (item.code || '').toLowerCase().includes(query) ||
                          (item.zone || '').toLowerCase().includes(query) ||
                          (item.owner || '').toLowerCase().includes(query) ||
                          (item.address || '').toLowerCase().includes(query);

    const matchesZone = zoneVal === 'ALL' || item.zone === zoneVal;
    const matchesStatus = statusVal === 'ALL' || item.status === statusVal;

    return matchesSearch && matchesZone && matchesStatus;
  });

  tableBody.innerHTML = '';
  filtered.forEach((item, index) => {
    const frente = parseFloat(item.frente) || 0;
    const fondo = parseFloat(item.fondo) || 0;
    const valor = parseFloat(item.value) || 0;

    const areaM2 = frente * fondo;
    const areaHa = areaM2 / 10000;
    const tax = valor * 0.005;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="code-cell">${item.code}</td>
      <td><strong>${item.zone}</strong></td>
      <td title="${item.address}">${truncateText(item.address || '', 32)}</td>
      <td>${item.owner || ''}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem;">${item.docId || ''}</td>
      <td class="number-cell">${frente.toFixed(1)}m × ${fondo.toFixed(1)}m</td>
      <td class="number-cell" style="font-weight: 700;">${areaM2.toLocaleString('es-ES', { minimumFractionDigits: 2 })} m²</td>
      <td class="number-cell">${areaHa.toFixed(4)} Ha</td>
      <td>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.coords || '')}" target="_blank" class="map-link" title="Ver mapa">
          📍 ${item.coords || '0,0'}
        </a>
      </td>
      <td><span class="usage-tag">${item.usage || 'Residencial'}</span></td>
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status || 'Titulado'}</span></td>
      <td class="number-cell" style="color: #4ade80; font-weight: 700;">$${valor.toLocaleString('es-ES')}</td>
      <td class="number-cell">$${tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
      <td><small style="color: var(--text-muted); font-family: var(--font-mono);">${item.user || 'USR-CAT-01'}</small></td>
      <td>
        <button class="btn-icon" onclick="editRecord(${index})" title="Editar Terreno">✏️</button>
        <button class="btn-icon" onclick="deleteRecord(${index})" title="Eliminar Terreno">🗑️</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableCounter.textContent = `Mostrando ${filtered.length} de ${landRecords.length} terrenos`;
  updateKPIs();
}

function updateKPIs() {
  const totalM2 = landRecords.reduce((acc, curr) => acc + ((parseFloat(curr.frente)||0) * (parseFloat(curr.fondo)||0)), 0);
  const totalHa = totalM2 / 10000;
  const totalVal = landRecords.reduce((acc, curr) => acc + (parseFloat(curr.value)||0), 0);
  const totalTax = totalVal * 0.005;

  kpiTotalRecords.textContent = landRecords.length;
  kpiTotalAreaM2.textContent = `${totalM2.toLocaleString('es-ES', { minimumFractionDigits: 2 })} m²`;
  kpiTotalAreaHa.textContent = `${totalHa.toFixed(2)} Ha`;
  kpiTotalValue.textContent = `$${totalVal.toLocaleString('es-ES')}`;
  kpiTotalTax.textContent = `$${totalTax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Titulado': return 'titulado';
    case 'En Trámite': return 'tramite';
    case 'Dominio Público': return 'publico';
    case 'En Litigio': return 'litigio';
    default: return 'baldio';
  }
}

function truncateText(str, len) {
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function openRecordModal(editIdx = null) {
  landForm.reset();
  if (editIdx !== null) {
    const item = landRecords[editIdx];
    document.getElementById('formIndex').value = editIdx;
    document.getElementById('modalTitle').textContent = '✏️ Editar Terreno ' + item.code;
    document.getElementById('inputCode').value = item.code;
    document.getElementById('inputZone').value = item.zone;
    document.getElementById('inputAddress').value = item.address;
    document.getElementById('inputOwner').value = item.owner;
    document.getElementById('inputDocId').value = item.docId;
    document.getElementById('inputFrente').value = item.frente;
    document.getElementById('inputFondo').value = item.fondo;
    document.getElementById('inputCoords').value = item.coords;
    document.getElementById('inputLimits').value = item.limits;
    document.getElementById('inputUsage').value = item.usage;
    document.getElementById('inputStatus').value = item.status;
    document.getElementById('inputValor').value = item.value;
    calculateFormValues();
  } else {
    document.getElementById('formIndex').value = '';
    document.getElementById('modalTitle').textContent = '➕ Agregar Nuevo Terreno';
    document.getElementById('inputCode').value = `CAT-2026-0${landRecords.length + 1}`;
  }
  recordModal.classList.remove('hidden');
}

function handleSaveRecord(e) {
  e.preventDefault();
  const editIdx = document.getElementById('formIndex').value;

  const newRecord = {
    code: document.getElementById('inputCode').value.trim(),
    zone: document.getElementById('inputZone').value,
    address: document.getElementById('inputAddress').value.trim(),
    owner: document.getElementById('inputOwner').value.trim(),
    docId: document.getElementById('inputDocId').value.trim(),
    frente: parseFloat(document.getElementById('inputFrente').value),
    fondo: parseFloat(document.getElementById('inputFondo').value),
    coords: document.getElementById('inputCoords').value.trim(),
    limits: document.getElementById('inputLimits').value.trim(),
    usage: document.getElementById('inputUsage').value,
    status: document.getElementById('inputStatus').value,
    value: parseFloat(document.getElementById('inputValor').value),
    date: new Date().toISOString().split('T')[0],
    user: currentUser ? currentUser.id : 'USR-CAT-01'
  };

  let actionText = '';
  if (editIdx !== '') {
    landRecords[parseInt(editIdx)] = newRecord;
    actionText = `Edición predio ${newRecord.code}`;
  } else {
    landRecords.unshift(newRecord);
    actionText = `Registro nuevo predio ${newRecord.code}`;
  }

  recordModal.classList.add('hidden');
  saveAndSyncRecords(actionText);
}

function showToast(message) {
  let toast = document.getElementById('liveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'liveToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.backgroundColor = '#0284c7';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '700';
    toast.style.transition = 'opacity 0.3s';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.style.display = 'none', 300);
  }, 3500);
}

window.editRecord = function(index) {
  openRecordModal(index);
};

window.deleteRecord = function(index) {
  if (confirm(`¿Está seguro de eliminar el terreno ${landRecords[index].code}?`)) {
    const code = landRecords[index].code;
    landRecords.splice(index, 1);
    saveAndSyncRecords(`Eliminación predio ${code}`);
  }
};
