namespace LaptopGuard.Web;

public static class Html
{
    public static string Page => """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Laptop Guard</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a1220; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; }

  /* Login */
  #login-screen {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh;
  }
  .login-card {
    background: #111e33; border: 1px solid #1e4976;
    border-radius: 12px; padding: 40px; width: 340px; text-align: center;
  }
  .lock-icon { font-size: 48px; margin-bottom: 16px; }
  .login-card h1 { font-size: 20px; font-weight: 700; letter-spacing: 2px; }
  .login-card p  { font-size: 11px; color: #2563eb; margin: 4px 0 24px; }
  .otp-input {
    width: 100%; background: #0a1220; border: 1px solid #1e4976;
    color: #3b82f6; font-size: 32px; font-family: monospace;
    text-align: center; padding: 12px; border-radius: 8px;
    letter-spacing: 8px; outline: none; margin-bottom: 8px;
  }
  .error { color: #ef4444; font-size: 11px; min-height: 18px; margin-bottom: 12px; }
  .login-btn {
    width: 100%; background: #2563eb; color: white; border: none;
    padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 700;
    cursor: pointer; letter-spacing: 1px;
  }
  .hint { font-size: 10px; color: #1e3a5f; margin-top: 12px; }

  /* Dashboard */
  #dashboard { display: none; }
  .topbar {
    background: #0d1526; border-bottom: 1px solid #1e3a5f;
    padding: 0 20px; height: 52px; display: flex;
    align-items: center; justify-content: space-between;
  }
  .brand { font-size: 15px; font-weight: 700; letter-spacing: 2px; }
  .brand span { color: #2563eb; font-size: 10px; margin-left: 10px; }
  .accent-line { height: 2px; background: #2563eb; opacity: 0.6; }

  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; padding: 16px; 
  }
  .stat-card {
    background: #162032; border-radius: 6px;
    border-bottom: 3px solid #1e4976; padding: 16px;
  }
  .stat-label { font-size: 8px; color: #4a7ab5; font-weight: 600; letter-spacing: 1px; }
  .stat-value { font-size: 36px; font-weight: 700; line-height: 1.1; }
  .stat-sub   { font-size: 8px; color: #2a3f5a; }

  .body { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 0 16px 16px; }
  .panel {
    background: #111e33; border: 1px solid #1e3a5f; border-radius: 6px; overflow: hidden;
  }
  .panel-header {
    background: #0d1520; border-bottom: 1px solid #1e3a5f;
    padding: 12px 16px; display: flex; align-items: center; gap: 8px;
  }
  .panel-accent { width: 2px; height: 16px; background: #2563eb; border-radius: 1px; }
  .panel-title  { font-size: 11px; font-weight: 600; color: #7fb3e8; letter-spacing: 1px; }
  .live-dot { margin-left: auto; font-size: 9px; color: #10b981; font-weight: 700; }

  .photo-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 8px; padding: 12px; max-height: 420px; overflow-y: auto;
  }
  .photo-card {
    background: #1a2235; border: 1px solid #1e3a5f; border-radius: 6px;
    overflow: hidden; cursor: pointer; transition: border-color 0.2s;
  }
  .photo-card:hover { border-color: #2563eb; }
  .photo-card img   { width: 100%; height: 80px; object-fit: cover; display: block; }
  .photo-time { font-size: 8px; color: #4a7ab5; padding: 4px 6px; text-align: center; }

  .preview-area {
    background: #080f1a; min-height: 200px; display: flex;
    align-items: center; justify-content: center; padding: 12px;
  }
  .preview-area img    { max-width: 100%; max-height: 340px; border-radius: 4px; }
  .preview-placeholder { color: #1e3a5f; font-size: 12px; }

  .log-area {
    padding: 10px; max-height: 200px; overflow-y: auto;
    background: #060c18; font-family: monospace; font-size: 10px;
  }
  .log-entry { color: #ef4444; padding: 2px 0; }
  .log-dim   { color: #2a3f5a; }

  @media (max-width: 768px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .body  { grid-template-columns: 1fr; }
    .photo-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>

<!-- Login -->
<div id="login-screen">
  <div class="login-card">
    <div class="lock-icon">🔒</div>
    <h1>LAPTOP GUARD</h1>
    <p>SECURITY MONITOR</p>
    <input class="otp-input" id="otp-input" type="tel"
           maxlength="6" placeholder="000000" autocomplete="off"/>
    <div class="error" id="error-text"></div>
    <button class="login-btn" onclick="verify()">VERIFY &amp; ENTER</button>
    <p class="hint">Enter code from Google Authenticator</p>
  </div>
</div>

<!-- Dashboard -->
<div id="dashboard">
  <div class="topbar">
    <div class="brand">LAPTOP GUARD <span>SECURITY MONITOR</span></div>
    <div id="svc-status" style="font-size:10px;font-weight:700;color:#f59e0b;">● LOADING</div>
  </div>
  <div class="accent-line"></div>

  <div class="stats">
    <div class="stat-card" style="border-color:#c0392b">
      <div class="stat-label">TOTAL ATTEMPTS</div>
      <div class="stat-value" id="s-total" style="color:#e74c3c">—</div>
      <div class="stat-sub">all time</div>
    </div>
    <div class="stat-card" style="border-color:#e67e22">
      <div class="stat-label">TODAY</div>
      <div class="stat-value" id="s-today" style="color:#e67e22">—</div>
      <div class="stat-sub">incidents</div>
    </div>
    <div class="stat-card" style="border-color:#2563eb">
      <div class="stat-label">LIVE OTP</div>
      <div class="stat-value" id="s-otp" style="color:#3b82f6;font-family:monospace">——</div>
      <div class="stat-sub" id="s-otp-timer">—s remaining</div>
    </div>
    <div class="stat-card" style="border-color:#1e4976">
      <div class="stat-label">EVIDENCE FILES</div>
      <div class="stat-value" id="s-photos" style="color:#7fb3e8">—</div>
      <div class="stat-sub">photos saved</div>
    </div>
  </div>

  <div class="body">
    <!-- Evidence Gallery -->
    <div class="panel">
      <div class="panel-header">
        <div class="panel-accent"></div>
        <div class="panel-title">EVIDENCE GALLERY</div>
      </div>
      <div class="photo-grid" id="photo-grid">
        <div style="color:#1e3a5f;font-size:11px;padding:20px;grid-column:span 3;text-align:center">
          Loading...
        </div>
      </div>
    </div>

    <!-- Right: Preview + Log -->
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="panel">
        <div class="panel-header">
          <div class="panel-accent"></div>
          <div class="panel-title">INCIDENT PREVIEW</div>
        </div>
        <div class="preview-area" id="preview-area">
          <div class="preview-placeholder">← Select evidence from gallery</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <div class="panel-accent"></div>
          <div class="panel-title">INCIDENT LOG</div>
          <div class="live-dot">● LIVE</div>
        </div>
        <div class="log-area" id="log-area">
          <div class="log-dim">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
let token = '';

// ── OTP input: auto-verify on 6 digits ───────────────────────────────────────
document.getElementById('otp-input').addEventListener('input', e => {
  if (e.target.value.length === 6) verify();
});
document.getElementById('otp-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') verify();
});

async function verify() {
  const code = document.getElementById('otp-input').value.trim();
  if (code.length !== 6) return;
  const res  = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json();
  if (data.success) {
    token = code;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display    = 'block';
    loadDashboard();
    setInterval(loadDashboard, 15000);
    setInterval(tickOtp, 1000);
  } else {
    document.getElementById('error-text').textContent = 'Invalid OTP. Try again.';
    document.getElementById('otp-input').value = '';
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
async function loadDashboard() {
  await loadStats();
  await loadIncidents();
}

async function loadStats() {
  try {
    const res  = await fetch(`/api/stats?token=${token}`);
    const data = await res.json();
    document.getElementById('s-total').textContent  = data.total;
    document.getElementById('s-today').textContent  = data.today;
    document.getElementById('s-photos').textContent = data.photos;
  } catch {}
}

async function loadIncidents() {
  try {
    const res       = await fetch(`/api/incidents?token=${token}`);
    const incidents = await res.json();
    renderGallery(incidents);
    renderLog(incidents);
  } catch {}
}

function renderGallery(incidents) {
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';
  const photos = incidents.flatMap(i => i.photos.map(p => ({ url: p, time: i.timestamp })));
  if (photos.length === 0) {
    grid.innerHTML = '<div style="color:#1e3a5f;padding:20px;grid-column:span 3;text-align:center">No photos yet</div>';
    return;
  }
  photos.slice(0, 30).forEach(p => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    const dt = new Date(p.time);
    card.innerHTML = `
      <img src="${p.url}" loading="lazy" onerror="this.style.display='none'">
      <div class="photo-time">${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}</div>`;
    card.onclick = () => {
      document.getElementById('preview-area').innerHTML =
        `<img src="${p.url}">`;
    };
    grid.appendChild(card);
  });
}

function renderLog(incidents) {
  const log = document.getElementById('log-area');
  log.innerHTML = '<div class="log-dim">─── Intrusion History ───</div>';
  incidents.forEach(i => {
    const dt  = new Date(i.timestamp);
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.textContent = `[!] Failed login at ${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}  |  User: ${i.username}`;
    log.appendChild(div);
  });
  log.scrollTop = log.scrollHeight;
}

// ── Live OTP ticker ───────────────────────────────────────────────────────────
function tickOtp() {
  const now       = Math.floor(Date.now() / 1000);
  const remaining = 30 - (now % 30);
  document.getElementById('s-otp-timer').textContent = `${remaining}s remaining`;
  document.getElementById('s-otp').style.color =
    remaining > 10 ? '#3b82f6' : '#f59e0b';
}
</script>
</body>
</html>
""";
}