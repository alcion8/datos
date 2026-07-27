const ExcelJS = require('exceljs');
const path = require('path');

async function createLandRegistryExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Catastro Municipal';
  workbook.lastModifiedBy = 'Director de Catastro';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ---------------------------------------------------------
  // HOJA 1: REGISTRO DE TERRENOS
  // ---------------------------------------------------------
  const sheet1 = workbook.addWorksheet('1. Registro de Terrenos', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 5 }] // Freeze top 5 rows (Header is row 5, so rows 1-5 fixed)
  });

  // Título Superior y Metadata del Documento
  sheet1.mergeCells('A1:Q1');
  const mainTitleCell = sheet1.getCell('A1');
  mainTitleCell.value = 'SISTEMA UNIFICADO DE REGISTRO CATASTRAL DE TERRENOS MUNICIPALES';
  mainTitleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
  mainTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } }; // Dark Navy / Slate
  mainTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(1).height = 36;

  sheet1.mergeCells('A2:Q2');
  const subTitleCell = sheet1.getCell('A2');
  subTitleCell.value = 'Base de Datos Oficial para Gestión Territorial y Colaboración en GitHub (Acceso Restringido - 4 Usuarios Autorizados)';
  subTitleCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: '94A3B8' } };
  subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
  subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet1.getRow(2).height = 22;

  // Fila de Filtros/Estado informativo
  sheet1.mergeCells('A3:Q3');
  const infoCell = sheet1.getCell('A3');
  infoCell.value = '📌 NOTA: Fila de encabezado flotante fijada. Las celdas de Superficie e Impuesto contienen fórmulas automatizadas. Actualizaciones sincronizadas vía GitHub.';
  infoCell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '0369A1' } };
  infoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } };
  infoCell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  sheet1.getRow(3).height = 20;

  sheet1.getRow(4).height = 8; // Fila vacía de separación

  // Definición de Nombres de Columnas (Fila 5)
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
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } }; // Sleek dark slate
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: '334155' } },
      left: { style: 'thin', color: { argb: '334155' } },
      bottom: { style: 'medium', color: { argb: '0F172A' } },
      right: { style: 'thin', color: { argb: '334155' } }
    };
  });

  // Habilitar Autofilter en la fila 5
  sheet1.autoFilter = {
    from: { row: 5, column: 1 },
    to: { row: 5, column: 17 }
  };

  // Datos reales de demostración (15 Terrenos)
  const landRecords = [
    { code: 'CAT-2026-001', zone: 'Centro Histórico', address: 'Av. Bolívar #450 entre Calle 4 y 5', owner: 'Constructora Urbana S.A.', docId: 'J-30948271-0', frente: 20.0, fondo: 40.0, coords: '-12.04637, -77.04279', limits: 'N: Av. Bolívar / S: Lote 12 / E: Calle 4 / O: Prop. Privada', usage: 'Comercial', status: 'Titulado', value: 120000.0, date: '2026-01-15', user: 'USR-CAT-01' },
    { code: 'CAT-2026-002', zone: 'San Martín', address: 'Calle Los Álamos Lote 8 Mz B', owner: 'María Elena Morales', docId: '0801198504932', frente: 12.5, fondo: 25.0, coords: '-12.04981, -77.03921', limits: 'N: Calle Los Álamos / S: Lote 9 / E: Pasaje A / O: Lote 7', usage: 'Residencial', status: 'Titulado', value: 38500.0, date: '2026-01-18', user: 'USR-INS-03' },
    { code: 'CAT-2026-003', zone: 'Industrial Norte', address: 'Vía Panamericana Km 14 Parcelación 4', owner: 'Logística del Norte Corp', docId: 'J-40192834-5', frente: 50.0, fondo: 120.0, coords: '-12.01234, -77.08765', limits: 'N: Vía Panamericana / S: Canal / E: Lote Ind 5 / O: Av. Fabril', usage: 'Industrial', status: 'Titulado', value: 350000.0, date: '2026-01-20', user: 'USR-CAT-01' },
    { code: 'CAT-2026-004', zone: 'Los Pinos', address: 'Av. Las Gardenias #1200', owner: 'Gobierno Municipal (Área Verde)', docId: 'M-00019283-0', frente: 40.0, fondo: 60.0, coords: '-12.05892, -77.02341', limits: 'N: Av. Gardenias / S: Quebrada / E: Calle 2 / O: Lote 14', usage: 'Equipamiento Urbano', status: 'Dominio Público', value: 95000.0, date: '2026-02-01', user: 'USR-JUR-02' },
    { code: 'CAT-2026-005', zone: 'El Recreo', address: 'Calle 8 de Diciembre #312', owner: 'Carlos Alberto Mendoza', docId: '0102938475', frente: 10.0, fondo: 30.0, coords: '-12.06112, -77.03119', limits: 'N: Calle 8 / S: Lote 4 / E: Prop. Gómez / O: Lote 2', usage: 'Residencial', status: 'En Trámite', value: 42000.0, date: '2026-02-05', user: 'USR-INS-04' },
    { code: 'CAT-2026-006', zone: 'Centro Histórico', address: 'Jr. Comercio #889 Escuadra 3', owner: 'Inversiones Patrimoniales SRL', docId: 'J-29837162-9', frente: 15.0, fondo: 35.0, coords: '-12.04510, -77.04100', limits: 'N: Jr. Comercio / S: Pasaje Colonial / E: Lote 22 / O: Lote 20', usage: 'Comercial', status: 'Titulado', value: 185000.0, date: '2026-02-10', user: 'USR-CAT-01' },
    { code: 'CAT-2026-007', zone: 'Bella Vista', address: 'Mirador de las Acacias Lote 5', owner: 'Herederos Familia Vargas', docId: '0918273645', frente: 18.0, fondo: 40.0, coords: '-12.07340, -77.01920', limits: 'N: Calle Acacias / S: Talud / E: Lote 6 / O: Lote 4', usage: 'Residencial', status: 'En Litigio', value: 68000.0, date: '2026-02-14', user: 'USR-JUR-02' },
    { code: 'CAT-2026-008', zone: 'Industrial Norte', address: 'Av. Las Industrias Mz D Lote 1', owner: 'Agroquímica del Valle SA', docId: 'J-50192837-1', frente: 60.0, fondo: 100.0, coords: '-12.01999, -77.08111', limits: 'N: Av. Industrias / S: Vía Férrea / E: Lote D2 / O: Av. Principal', usage: 'Industrial', status: 'Titulado', value: 420000.0, date: '2026-02-22', user: 'USR-INS-03' },
    { code: 'CAT-2026-009', zone: 'Residencial El Bosque', address: 'Calle Los Pinos #740', owner: 'Roberto Gómez Silva', docId: '0401928374', frente: 15.0, fondo: 30.0, coords: '-12.06821, -77.05432', limits: 'N: Calle Los Pinos / S: Lote 15 / E: Lote 10 / O: Calle Las Flores', usage: 'Residencial', status: 'Titulado', value: 89000.0, date: '2026-03-01', user: 'USR-CAT-01' },
    { code: 'CAT-2026-010', zone: 'San Martín', address: 'Pasaje San Jorge #105', owner: 'Sucesión Lucía Benítez', docId: '0802938471', frente: 8.5, fondo: 20.0, coords: '-12.05120, -77.03810', limits: 'N: Pasaje San Jorge / S: Casa 107 / E: Lote 3 / O: Lote 1', usage: 'Residencial', status: 'En Trámite', value: 24000.0, date: '2026-03-04', user: 'USR-INS-04' },
    { code: 'CAT-2026-011', zone: 'Reserva Ecológica', address: 'Sector Cuenca Alta del Río Lote Municipal', owner: 'Municipio de la Ciudad', docId: 'M-00000001-9', frente: 150.0, fondo: 300.0, coords: '-12.09540, -76.99210', limits: 'N: Cerros Protección / S: Río / E: Lote Rec 2 / O: Propiedad Privada', usage: 'Reserva Ecológica', status: 'Dominio Público', value: 150000.0, date: '2026-03-12', user: 'USR-JUR-02' },
    { code: 'CAT-2026-012', zone: 'Centro Histórico', address: 'Calle Real #210', owner: 'Banco de Comercio E Inversiones', docId: 'J-09182736-4', frente: 25.0, fondo: 50.0, coords: '-12.04780, -77.04390', limits: 'N: Calle Real / S: Edificio Central / E: Calle 2 / O: Plaza Mayor', usage: 'Comercial', status: 'Titulado', value: 310000.0, date: '2026-03-15', user: 'USR-CAT-01' },
    { code: 'CAT-2026-013', zone: 'El Recreo', address: 'Av. Universitaria Esquina Calle 12', owner: 'Universidad Metropolitana', docId: 'J-60192837-8', frente: 80.0, fondo: 100.0, coords: '-12.05990, -77.06780', limits: 'N: Av. Universitaria / S: Campus 2 / E: Calle 12 / O: Av. Central', usage: 'Equipamiento Urbano', status: 'Titulado', value: 520000.0, date: '2026-03-20', user: 'USR-INS-03' },
    { code: 'CAT-2026-014', zone: 'Bella Vista', address: 'Cerro Mirador Sector B Lote Baldío', owner: 'Estado Nacional', docId: 'E-90182736-2', frente: 35.0, fondo: 70.0, coords: '-12.07910, -77.01450', limits: 'N: Lote B2 / S: Ladera Norte / E: Lote B4 / O: Calle Acceso', usage: 'Mixto', status: 'Baldío Municipal', value: 45000.0, date: '2026-03-25', user: 'USR-JUR-02' },
    { code: 'CAT-2026-015', zone: 'Los Pinos', address: 'Calle Los Cedros #512', owner: 'Fernando & Sofía Benítez', docId: '0192837465', frente: 14.0, fondo: 28.0, coords: '-12.06240, -77.02670', limits: 'N: Calle Los Cedros / S: Lote 8 / E: Lote 11 / O: Lote 9', usage: 'Residencial', status: 'Titulado', value: 58000.0, date: '2026-03-28', user: 'USR-INS-04' }
  ];

  const startRow = 6;
  landRecords.forEach((record, idx) => {
    const currentRow = startRow + idx;
    const row = sheet1.getRow(currentRow);
    row.height = 24;

    // Asignación de Valores
    row.getCell(1).value = record.code;
    row.getCell(2).value = record.zone;
    row.getCell(3).value = record.address;
    row.getCell(4).value = record.owner;
    row.getCell(5).value = record.docId;
    row.getCell(6).value = record.frente;
    row.getCell(7).value = record.fondo;

    // FÓRMULAS AUTOMÁTICAS
    row.getCell(8).value = { formula: `F${currentRow}*G${currentRow}` }; // Superficie m2
    row.getCell(9).value = { formula: `H${currentRow}/10000` };         // Superficie Ha

    // Coordenadas con Hyperlink a Google Maps
    row.getCell(10).value = {
      text: record.coords,
      hyperlink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.coords)}`,
      tooltip: 'Abrir ubicación en Google Maps'
    };

    row.getCell(11).value = record.limits;
    row.getCell(12).value = record.usage;
    row.getCell(13).value = record.status;
    row.getCell(14).value = record.value;
    row.getCell(15).value = { formula: `N${currentRow}*0.005` };        // Impuesto Catastral (0.5%)
    row.getCell(16).value = record.date;
    row.getCell(17).value = record.user;

    // Formatos de Números y Moneda
    row.getCell(6).numberFormat = '#,##0.00 "m"';
    row.getCell(7).numberFormat = '#,##0.00 "m"';
    row.getCell(8).numberFormat = '#,##0.00 "m²"';
    row.getCell(9).numberFormat = '0.0000 "Ha"';
    row.getCell(14).numberFormat = '"$"#,##0.00';
    row.getCell(15).numberFormat = '"$"#,##0.00';

    // Estilos de Alineación y Bordes
    const isEven = idx % 2 === 0;
    const rowBgColor = isEven ? 'FFFFFF' : 'F8FAFC'; // Alternating zebra striping

    for (let c = 1; c <= 17; c++) {
      const cell = row.getCell(c);
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: c === 10 ? '0284C7' : '1E293B' } };
      if (c === 10) cell.font.underline = true; // Link style

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBgColor } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };

      // Alignment rules
      if ([1, 5, 10, 16, 17].includes(c)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if ([6, 7, 8, 9, 14, 15].includes(c)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: c === 3 || c === 11 };
      }
    }

    // Coloreado especial de Estatus Legal Badge
    const statusCell = row.getCell(13);
    if (record.status === 'Titulado') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }; // Light Green
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '166534' } };
    } else if (record.status === 'En Trámite') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF9C3' } }; // Light Yellow
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '854D0E' } };
    } else if (record.status === 'Dominio Público') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0F2FE' } }; // Light Blue
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '075985' } };
    } else if (record.status === 'En Litigio') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } }; // Light Red
      statusCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '991B1B' } };
    }
  });

  // Ajustar anchos de columnas óptimos
  const colWidths = [18, 22, 34, 28, 18, 14, 14, 18, 16, 24, 38, 22, 18, 20, 20, 16, 20];
  colWidths.forEach((w, i) => {
    sheet1.getColumn(i + 1).width = w;
  });

  // Fila de Totales Generales al final (Fila 21)
  const totalRowIndex = startRow + landRecords.length;
  const totalRow = sheet1.getRow(totalRowIndex);
  totalRow.height = 28;

  totalRow.getCell(1).value = 'TOTALES GENERALES';
  sheet1.mergeCells(`A${totalRowIndex}:G${totalRowIndex}`);
  
  const labelCell = totalRow.getCell(1);
  labelCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  labelCell.alignment = { horizontal: 'right', vertical: 'middle', indent: 1 };

  // Fórmulas Totales
  totalRow.getCell(8).value = { formula: `SUM(H6:H${totalRowIndex - 1})` };
  totalRow.getCell(9).value = { formula: `SUM(I6:I${totalRowIndex - 1})` };
  totalRow.getCell(14).value = { formula: `SUM(N6:N${totalRowIndex - 1})` };
  totalRow.getCell(15).value = { formula: `SUM(O6:O${totalRowIndex - 1})` };

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

  // Rellenar resto de celdas de fila total con fondo oscuro
  for (let c = 10; c <= 17; c++) {
    if (c !== 14 && c !== 15) {
      const emptyCell = totalRow.getCell(c);
      emptyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
    }
  }


  // ---------------------------------------------------------
  // HOJA 2: CONTROL DE USUARIOS Y CLAVES (4 USUARIOS)
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
  uSub.value = '🔒 Solo las 4 personas registradas a continuación poseen credenciales para editar y firmar commits en GitHub';
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
        cell.font = { name: 'Consolas', size: 11, bold: true, color: { argb: '0369A1' } }; // PIN code style
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
    { label: 'Total Predios Registrados', formula: "=COUNTA('1. Registro de Terrenos'!A6:A20)", fmt: '#,##0' },
    { label: 'Superficie Total Registrada (m²)', formula: "=SUM('1. Registro de Terrenos'!H6:H20)", fmt: '#,##0.00 "m²"' },
    { label: 'Superficie Total Registrada (Hectáreas)', formula: "=SUM('1. Registro de Terrenos'!I6:I20)", fmt: '0.0000 "Ha"' },
    { label: 'Valor Catastral Total del Suelo ($)', formula: "=SUM('1. Registro de Terrenos'!N6:N20)", fmt: '"$"#,##0.00' },
    { label: 'Recaudación Impuesto Anual Estimada ($)', formula: "=SUM('1. Registro de Terrenos'!O6:O20)", fmt: '"$"#,##0.00' }
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

  // Guardar archivo Excel
  const outputPath = path.join(__dirname, 'Registro_De_Terrenos_Municipal.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✅ Archivo Excel generado con éxito en: ${outputPath}`);
}

createLandRegistryExcel().catch(err => {
  console.error('❌ Error generando Excel:', err);
  process.exit(1);
});
