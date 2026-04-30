const API_BASE = 'https://TU_URL_DE_RENDER_BACKEND.onrender.com/api'; // Esto lo cambiarás después

const startScanBtn = document.getElementById('startScanBtn');
const readerDiv = document.getElementById('reader');
const statusDiv = document.getElementById('status');
const attendanceList = document.getElementById('attendanceList');

let html5QrCode;

document.addEventListener('DOMContentLoaded', loadTodayAttendances);

startScanBtn.addEventListener('click', () => {
  readerDiv.style.display = 'block';
  startScanBtn.style.display = 'none';
  
  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess,
    onScanFailure
  ).catch(err => {
    statusDiv.textContent = 'Error al acceder a la cámara: ' + err;
    resetScanner();
  });
});

function onScanSuccess(decodedText) {
  const userId = decodedText.trim();
  statusDiv.textContent = `QR leído: ${userId}. Registrando...`;
  html5QrCode.stop().then(() => {
    registerAttendance(userId);
  }).catch(err => console.error(err));
}

function onScanFailure(error) {}

async function registerAttendance(userId) {
  try {
    const response = await fetch(`${API_BASE}/attendance/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Error desconocido');
    statusDiv.textContent = `✅ ${data.message} - ${data.attendance.userName}`;
    loadTodayAttendances();
  } catch (err) {
    statusDiv.textContent = `❌ Error: ${err.message}`;
  } finally {
    resetScanner();
  }
}

function resetScanner() {
  startScanBtn.style.display = 'block';
  readerDiv.style.display = 'none';
  if (html5QrCode) {
    html5QrCode.stop().catch(() => {});
  }
}

async function loadTodayAttendances() {
  try {
    const res = await fetch(`${API_BASE}/attendance/today`);
    const attendances = await res.json();
    attendanceList.innerHTML = '';
    if (attendances.length === 0) {
      attendanceList.innerHTML = '<li>No hay registros hoy</li>';
      return;
    }
    attendances.forEach(a => {
      const li = document.createElement('li');
      const time = new Date(a.timestamp).toLocaleTimeString();
      li.textContent = `${a.userName} (${a.userId}) - ${time}`;
      attendanceList.appendChild(li);
    });
  } catch (e) {
    attendanceList.innerHTML = '<li>Error al cargar datos</li>';
  }
}
