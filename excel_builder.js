const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Genera el archivo Registro_De_Terrenos_Municipal.xlsx dinámicamente
 * a partir de la lista de terrenos provista.
 * @param {Array} landRecords - Arreglo de objetos de predios catastrales.
 * @param {string} outputPath - Ruta completa donde guardar el archivo Excel.
 */
async function generateLandRegistryExcel(landRecords, outputPath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Catastro Municipal';
  workbook.lastModifiedBy = 'Director de Catastro';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------
  // HOJA 1: REGISTRO DE TERRENOS
  // ---------------------------------------------------------
  const sheet1 = workbook.addWorksheet('1. Registro de Terrenos', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }] // Inmovilizar fila superior (Filas 1-5 fijas)
  });

  // Título Superior y Metadata
  sheet1.mergeCells('A1:Q1');
  const mainTitleCell = sheet1.getCell('A1');
  mainTitleCell.value = 'SISTEMA UNIFICADO DE REGISTRO CATASTRAL DE TERRENOS MUNICIPALES';
  mainTitleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  mainTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  mainTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 36;

  sheet1.mergeCells('A2:Q2');
  const subTitleCell = sheet1.getCell('A2');
  subTitleCell.value = 'Base de Datos Oficial para Gestión Territorial y Colaboración en GitHub (Acceso Restringido - 4 Usuarios Autorizados)';
  subTitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '94A3B8' } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(2).height = 22;

  sheet1.mergeCells('A3:Q3');
  const infoCell = sheet1.getCell('A3');
  infoCell.value = `📌 NOTA: Cabecera inmovilizada. Fórmulas activas. Última actualización del registro: ${new Date().toLocaleString('es-ES')}`;
  infoCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '0369A1' } };
  infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
  infoCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  sheet1.getRow(3).height = 20;

  sheet1.getRow(4).height = 8;

  // Encabezados de Columna (Fila 5)
  const headers = [
    'Código Catastral',
    'Zona / Barrio',
    'Dirección Exacta',
    'Propietario / Titular',
    'Documento ID / RUC',
    'Frente (m)',
    'Fondo (m)',
    'Superficie (m²)',
    'Superficie (Ha)',
    'Coordenadas GPS (Lat, Lng)',
    'Límites y Linderos',
    'Finalidad / Uso de Suelo',
    'Estatus Legal',
    'Valor Catastral ($)',
    'Impuesto Anual ($)',
    'Fecha Registro',
    'Usuario Registrador'
  ];

  const headerRow = sheet1.getRow(5);
  headerRow.height = 30;
  headers.forEach((headerText, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = headerText;
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

  sheet1.autoFilter = {
    from: { row: 5, column: 1 },
    to: { row: 5, column: 17 }
  };

  // Renderizar filas de datos de predios
  const startRow = 6;
  landRecords.forEach((record, idx) => {
    const currentRow = startRow + idx;
    const row = sheet1.getRow(currentRow);
    row.height = 24;

    const frenteNum = parseFloat(record.frente) || 0;
    const fondoNum = parseFloat(record.fondo) || 0;
    const valorNum = parseFloat(record.value) || 0;

    row.getCell(1).value = record.code;
    row.getCell(2).value = record.zone;
    row.getCell(3).value = record.address;
    row.getCell(4).value = record.owner;
    row.getCell(5).value = record.docId;
    row.getCell(6).value = frenteNum;
    row.getCell(7).value = fondoNum;

    // FÓRMULAS AUTOMÁTICAS NATIVAS DE EXCEL
    row.getCell(8).value = { formula: `F${currentRow}*G${currentRow}` };
    row.getCell(9).value = { formula: `H${currentRow}/10000` };

    const coordsStr = record.coords || '';
    row.getCell(10).value = {
      text: coordsStr,
      hyperlink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordsStr)}`,
      tooltip: 'Abrir ubicación en Google Maps'
    };

    row.getCell(11).value = record.limits || '';
    row.getCell(12).value = record.usage;
    row.getCell(13).value = record.status;
    row.getCell(14).value = valorNum;
    row.getCell(15).value = { formula: `N${currentRow}*0.005` };
    row.getCell(16).value = record.date || new Date().toISOString().split('T')[0];
    row.getCell(17).value = record.user || 'USR-CAT-01';

    // Formatos de números y moneda
    row.getCell(6).numberFormat = '#,##0.00 "m"';
    row.getCell(7).numberFormat = '#,##0.00 "m"';
    row.getCell(8).numberFormat = '#,##0.00 "m²"';
    row.getCell(9).numberFormat = '0.0000 "Ha"';
    row.getCell(14).numberFormat = '"$"#,##0.00';
    row.getCell(15).numberFormat = '"$"#,##0.00';

    const isEven = idx % 2 === 0;
    const rowBgColor = isEven ? 'FFFFFF' : 'F8FAFC';

    for (let c = 1; c <= 17; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: c === 10 ? '0284C7' : '1E293B' } };
      if (c === 10) cell.font.underline = true;

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };

      if ([1, 5, 10, 16, 17].includes(c)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if ([6, 7, 8, 9, 14, 15].includes(c)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: c === 3 || c === 11 };
      }
    }

    // Coloreado según Estatus Legal
    const statusCell = row.getCell(13);
    const st = record.status;
    if (st === 'Titulado') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } };
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '166534' } };
    } else if (st === 'En Trámite') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } };
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '854D0E' } };
    } else if (st === 'Dominio Público') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '075985' } };
    } else if (st === 'En Litigio') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '991B1B' } };
    }
  });

  const colWidths = [18, 22, 34, 28, 18, 14, 14, 18, 16, 24, 38, 22, 18, 20, 20, 16, 20];
  colWidths.forEach((w, i) => {
    sheet1.getColumn(i + 1).width = w;
  });

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
    totalRow.getCell(8).value = 0;
    totalRow.getCell(9).value = 0;
    totalRow.getCell(14).value = 0;
    totalRow.getCell(15).value = 0;
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
    if (c !== 14 && c !== 15) {
      const emptyCell = totalRow.getCell(c);
      emptyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    }
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
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } }
      };
      cell.alignment = { horizontal: c === 1 || c === 4 || c === 5 ? 'center' : 'left', vertical: 'middle' };
    }
  });

  const uWidths = [18, 26, 32, 22, 14, 34];
  uWidths.forEach((w, i) => sheet2.getColumn(i + 1).width = w);

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

  sheet3.getColumn(1).width = 30;
  sheet3.getColumn(2).width = 15;
  sheet3.getColumn(3).width = 25;

  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Archivo Excel actualizado dinámicamente en: ${outputPath}`);
}

module.exports = { generateLandRegistryExcel };
