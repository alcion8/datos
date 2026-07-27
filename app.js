// SISTEMA DE REGISTRO DE TERRENOS MUNICIPALES - APP.JS

// 1. BASE DE DATOS DE LOS 4 USUARIOS AUTORIZADOS Y CLAVES
const AUTHORIZED_USERS = {
  'USR-CAT-01': {
    name: 'Ing. Roberto Gómez',
    role: 'Director Catastro',
    key: 'CAT-9821-KEY',
    avatar: 'RG'
  },
  'USR-JUR-02': {
    name: 'Dra. Elena Rostova',
    role: 'Asesora Jurídica',
    key: 'JUR-4410-KEY',
    avatar: 'ER'
  },
  'USR-INS-03': {
    name: 'Arq. Carlos Mendoza',
    role: 'Inspector Zonal 1',
    key: 'INS-7732-KEY',
    avatar: 'CM'
  },
  'USR-INS-04': {
    name: 'Lic. Sofía Benítez',
    role: 'Inspectora Zonal 2',
    key: 'INS-3109-KEY',
    avatar: 'SB'
  }
};

// 2. REGISTROS INICIALES DE TERRENOS (15 PREDIOS DEMO)
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

// ESTADO GLOBAL DE LA APP
let currentUser = null;
let landRecords = JSON.parse(localStorage.getItem('landRecords')) || INITIAL_LANDS;

// ELEMENTOS DEL DOM
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

const githubModal = document.getElementById('githubModal');
const btnGithubModal = document.getElementById('btnGithubModal');
const btnCloseGithub = document.getElementById('btnCloseGithub');
const btnSimulateSync = document.getElementById('btnSimulateSync');
const syncResult = document.getElementById('syncResult');


// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkSavedSession();
});

// AUTENTICACIÓN Y SESIONES
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

  // Cálculo automático de Superficie m², Hectáreas e Impuesto en el Formulario
  [inputFrente, inputFondo, inputValor].forEach(input => {
    input.addEventListener('input', calculateFormValues);
  });

  landForm.addEventListener('submit', handleSaveRecord);

  // Modal GitHub Sync
  btnGithubModal.addEventListener('click', () => githubModal.classList.remove('hidden'));
  btnCloseGithub.addEventListener('click', () => githubModal.classList.add('hidden'));

  btnSimulateSync.addEventListener('click', () => {
    syncResult.classList.remove('hidden');
    syncResult.innerHTML = `✅ Commit enviado exitosamente a GitHub por <strong>${currentUser.name}</strong> (${currentUser.id}). Archivo sync listo.`;
    setTimeout(() => {
      syncResult.classList.add('hidden');
    }, 4000);
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
    const matchesSearch = item.code.toLowerCase().includes(query) ||
                          item.zone.toLowerCase().includes(query) ||
                          item.owner.toLowerCase().includes(query) ||
                          item.address.toLowerCase().includes(query);

    const matchesZone = zoneVal === 'ALL' || item.zone === zoneVal;
    const matchesStatus = statusVal === 'ALL' || item.status === statusVal;

    return matchesSearch && matchesZone && matchesStatus;
  });

  // Render Filas
  tableBody.innerHTML = '';
  filtered.forEach((item, index) => {
    const areaM2 = item.frente * item.fondo;
    const areaHa = areaM2 / 10000;
    const tax = item.value * 0.005;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="code-cell">${item.code}</td>
      <td><strong>${item.zone}</strong></td>
      <td title="${item.address}">${truncateText(item.address, 32)}</td>
      <td>${item.owner}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem;">${item.docId}</td>
      <td class="number-cell">${item.frente.toFixed(1)}m × ${item.fondo.toFixed(1)}m</td>
      <td class="number-cell" style="font-weight: 700;">${areaM2.toLocaleString('es-ES', { minimumFractionDigits: 2 })} m²</td>
      <td class="number-cell">${areaHa.toFixed(4)} Ha</td>
      <td>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.coords)}" target="_blank" class="map-link" title="Ver mapa">
          📍 ${item.coords}
        </a>
      </td>
      <td><span class="usage-tag">${item.usage}</span></td>
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
      <td class="number-cell" style="color: #4ade80; font-weight: 700;">$${item.value.toLocaleString('es-ES')}</td>
      <td class="number-cell">$${tax.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
      <td><small style="color: var(--text-muted); font-family: var(--font-mono);">${item.user}</small></td>
      <td>
        <button class="btn-icon" onclick="editRecord(${index})" title="Editar Terreno">✏️</button>
        <button class="btn-icon" onclick="deleteRecord(${index})" title="Eliminar Terreno">🗑️</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableCounter.textContent = `Mostrando ${filtered.length} de ${landRecords.length} terrenos`;

  // Actualizar KPIs globales
  updateKPIs();
}

function updateKPIs() {
  const totalM2 = landRecords.reduce((acc, curr) => acc + (curr.frente * curr.fondo), 0);
  const totalHa = totalM2 / 10000;
  const totalVal = landRecords.reduce((acc, curr) => acc + curr.value, 0);
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

// OPERACIONES CRUD EN MODAL
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
    user: currentUser.id
  };

  if (editIdx !== '') {
    landRecords[parseInt(editIdx)] = newRecord;
  } else {
    landRecords.unshift(newRecord);
  }

  localStorage.setItem('landRecords', JSON.stringify(landRecords));
  recordModal.classList.add('hidden');
  renderTable();
}

window.editRecord = function(index) {
  openRecordModal(index);
};

window.deleteRecord = function(index) {
  if (confirm(`¿Está seguro de eliminar el terreno ${landRecords[index].code}?`)) {
    landRecords.splice(index, 1);
    localStorage.setItem('landRecords', JSON.stringify(landRecords));
    renderTable();
  }
};
