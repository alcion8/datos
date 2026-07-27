const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { generateLandRegistryExcel } = require('./excel_builder');

const PORT = 3000;
const PUBLIC_DIR = __dirname;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'land_records.json');
const EXCEL_FILE = path.join(__dirname, 'Registro_De_Terrenos_Municipal.xlsx');

// Asegurar directorio data
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Terrenos Iniciales por Defecto
const INITIAL_LANDS = [
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

function loadRecords() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_LANDS, null, 2), 'utf-8');
    // Generar archivo excel inicial
    generateLandRegistryExcel(INITIAL_LANDS, EXCEL_FILE).catch(console.error);
    return INITIAL_LANDS;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_LANDS;
  }
}

function saveRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

// Carga inicial
let currentRecords = loadRecords();

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // ---------------------------------------------------------
  // ENDPOINT: GET /api/records (Obtener lista de predios)
  // ---------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/records') {
    currentRecords = loadRecords();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, records: currentRecords }));
    return;
  }

  // ---------------------------------------------------------
  // ENDPOINT: POST /api/records (Guardar/Actualizar predios y REGENERAR EXCEL)
  // ---------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/records') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const recordsToSave = payload.records || [];
        const modifiedBy = payload.modifiedBy || 'USR-CAT-01';
        const lastAction = payload.action || 'Actualización de Registro';

        // 1. Guardar en JSON
        currentRecords = recordsToSave;
        saveRecords(currentRecords);

        // 2. REGENERAR ARCHIVO EXCEL (.xlsx) CON FÓRMULAS Y CABECERA FLOTANTE
        await generateLandRegistryExcel(currentRecords, EXCEL_FILE);

        // 3. Auto-commit local en git si el directorio es un repositorio git
        exec(`git add Registro_De_Terrenos_Municipal.xlsx data/land_records.json && git commit -m "${lastAction} por ${modifiedBy}"`, (error, stdout, stderr) => {
          if (!error) {
            console.log(`📌 Git Auto-Commit realizado: ${lastAction}`);
            // Intentar push silencioso
            exec('git push', () => {});
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Terrenos guardados y Excel regenerado exitosamente.',
          excelPath: '/Registro_De_Terrenos_Municipal.xlsx'
        }));
      } catch (err) {
        console.error('❌ Error guardando registros:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ---------------------------------------------------------
  // ENDPOINT: POST /api/sync-github (Sincronizar explícitamente con GitHub)
  // ---------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/sync-github') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body) || {};
        const user = payload.user || 'USR-CAT-01';

        // Asegurar que el Excel esté generado con los últimos datos
        await generateLandRegistryExcel(currentRecords, EXCEL_FILE);

        const commitMessage = `Sync Catastral: ${currentRecords.length} terrenos registrados por ${user}`;

        exec(`git add . && git commit -m "${commitMessage}" && git push origin main`, (error, stdout, stderr) => {
          if (error) {
            // Si no está configurado remote o no es git repo, enviar respuesta indicando estado
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              mode: 'local_excel_updated',
              message: `Excel actualizado localmente. Para enviar a GitHub automáticamente, ejecute 'git push' o configure las credenciales en su repositorio.`
            }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              mode: 'git_pushed',
              message: `Commit y Push realizado a GitHub con éxito: "${commitMessage}"`
            }));
          }
        });
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ---------------------------------------------------------
  // SERVIR ARCHIVOS ESTÁTICOS CON CACHE-BUSTING PARA EL EXCEL
  // ---------------------------------------------------------
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      // Si es el archivo Excel, deshabilitar caché del navegador para forzar la descarga de la versión más reciente
      if (ext === '.xlsx') {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Content-Disposition': 'attachment; filename="Registro_De_Terrenos_Municipal.xlsx"'
        });
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
      }
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Catastral con API de Excel activo en http://localhost:${PORT}`);
});
