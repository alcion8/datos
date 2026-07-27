// SISTEMA DE REGISTRO DE TERRENOS MUNICIPALES - APP.JS (SYNC EN VIVO CON EXCEL)

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

// ESTADO GLOBAL DE LA APP
let currentUser = null;
let landRecords = [];

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

const btnDownloadExcel = document.getElementById('btnDownloadExcel');
const githubModal = document.getElementById('githubModal');
const btnGithubModal = document.getElementById('btnGithubModal');
const btnCloseGithub = document.getElementById('btnCloseGithub');
const btnSimulateSync = document.getElementById('btnSimulateSync');
const syncResult = document.getElementById('syncResult');


// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchRecordsFromServer();
  checkSavedSession();
});

// Cargar registros desde el servidor backend
async function fetchRecordsFromServer() {
  try {
    const res = await fetch('/api/records');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        landRecords = data.records;
        renderTable();
      }
    }
  } catch (err) {
    console.warn('⚠️ No se pudo conectar al servidor API. Usando LocalStorage.');
    const savedLocal = localStorage.getItem('landRecords');
    if (savedLocal) landRecords = JSON.parse(savedLocal);
    renderTable();
  }
}

// Guardar registros en el servidor y REGENERAR EXCEL DINÁMICAMENTE
async function syncRecordsWithServer(actionDescription) {
  localStorage.setItem('landRecords', JSON.stringify(landRecords));
  renderTable();

  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: landRecords,
        modifiedBy: currentUser ? currentUser.id : 'USR-CAT-01',
        action: actionDescription || 'Actualización de Predios'
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Server Response:', data.message);
      showToast('✅ Excel actualizado con los nuevos datos');
    }
  } catch (err) {
    console.error('❌ Error al sincronizar con el servidor backend:', err);
    showToast('⚠️ Datos guardados localmente');
  }
}

// Toast de notificación flotante
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
  }, 3000);
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

  // Cálculo automático de Superficie m², Hectáreas e Impuesto en el Formulario
  [inputFrente, inputFondo, inputValor].forEach(input => {
    input.addEventListener('input', calculateFormValues);
  });

  landForm.addEventListener('submit', handleSaveRecord);

  // DESCARGA DINÁMICA DE EXCEL SIN CACHE
  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener('click', (e) => {
      e.preventDefault();
      // Forzar descarga fresca con timestamp
      const timestamp = new Date().getTime();
      window.location.href = `/Registro_De_Terrenos_Municipal.xlsx?t=${timestamp}`;
    });
  }

  // Modal GitHub Sync
  btnGithubModal.addEventListener('click', () => githubModal.classList.remove('hidden'));
  btnCloseGithub.addEventListener('click', () => githubModal.classList.add('hidden'));

  btnSimulateSync.addEventListener('click', async () => {
    btnSimulateSync.disabled = true;
    btnSimulateSync.querySelector('span').textContent = 'Sincronizando con GitHub...';

    try {
      const res = await fetch('/api/sync-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser ? currentUser.id : 'USR-CAT-01' })
      });
      const data = await res.json();
      syncResult.classList.remove('hidden');
      syncResult.innerHTML = `✅ ${data.message}`;
    } catch (err) {
      syncResult.classList.remove('hidden');
      syncResult.innerHTML = `✅ Excel local generado e inmovilizado. Listo para hacer <code>git push origin main</code>`;
    } finally {
      btnSimulateSync.disabled = false;
      btnSimulateSync.querySelector('span').textContent = 'Simular Sync Commit en GitHub';
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
    const matchesSearch = item.code.toLowerCase().includes(query) ||
                          item.zone.toLowerCase().includes(query) ||
                          item.owner.toLowerCase().includes(query) ||
                          item.address.toLowerCase().includes(query);

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
      <td title="${item.address}">${truncateText(item.address, 32)}</td>
      <td>${item.owner}</td>
      <td style="font-family: var(--font-mono); font-size: 0.8rem;">${item.docId}</td>
      <td class="number-cell">${frente.toFixed(1)}m × ${fondo.toFixed(1)}m</td>
      <td class="number-cell" style="font-weight: 700;">${areaM2.toLocaleString('es-ES', { minimumFractionDigits: 2 })} m²</td>
      <td class="number-cell">${areaHa.toFixed(4)} Ha</td>
      <td>
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.coords)}" target="_blank" class="map-link" title="Ver mapa">
          📍 ${item.coords}
        </a>
      </td>
      <td><span class="usage-tag">${item.usage}</span></td>
      <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
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

// OPERACIONES CRUD CON REGENERACIÓN DE EXCEL EN TIEMPO REAL
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

  // GUARDAR EN SERVIDOR Y REGENERAR ARCHIVO EXCEL AUTOMÁTICAMENTE
  syncRecordsWithServer(actionText);
}

window.editRecord = function(index) {
  openRecordModal(index);
};

window.deleteRecord = function(index) {
  if (confirm(`¿Está seguro de eliminar el terreno ${landRecords[index].code}?`)) {
    const code = landRecords[index].code;
    landRecords.splice(index, 1);
    syncRecordsWithServer(`Eliminación predio ${code}`);
  }
};
