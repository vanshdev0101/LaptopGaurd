namespace LaptopGuard.Web;

public static class Html
{
    public static string Page => """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LaptopGuard</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
:root {
  --bg:#0b0e14; --bg2:#111520; --bg3:#161b28; --bg4:#1c2333;
  --border:#232b3e; --border2:#2a3550;
  --text:#cdd6f4; --muted:#6b7599;
  --accent:#3b82f6; --green:#22c55e; --yellow:#f59e0b; --red:#ef4444;
}
body { background:var(--bg); color:var(--text); font-family:'Segoe UI',system-ui,sans-serif; font-size:13px; height:100vh; overflow:hidden; }

#login-screen { display:flex; align-items:center; justify-content:center; min-height:100vh; }
.login-card { background:var(--bg2); border:1px solid var(--border2); border-radius:16px; padding:48px 40px; width:360px; text-align:center; }
.login-logo { font-size:13px; font-weight:700; letter-spacing:3px; color:var(--muted); margin-bottom:32px; }
.login-logo span { color:var(--accent); }
.shield { font-size:52px; margin-bottom:20px; }
.login-card h1 { font-size:22px; font-weight:700; margin-bottom:4px; }
.login-card p { font-size:11px; color:var(--muted); margin-bottom:32px; }
.otp-input { width:100%; background:var(--bg); border:1px solid var(--border2); color:var(--accent); font-size:28px; font-family:monospace; text-align:center; padding:14px; border-radius:10px; letter-spacing:10px; outline:none; margin-bottom:8px; transition:border-color .2s; }
.otp-input:focus { border-color:var(--accent); }
.error-msg { color:var(--red); font-size:11px; min-height:20px; margin-bottom:12px; }
.login-btn { width:100%; background:var(--accent); color:#fff; border:none; padding:13px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; letter-spacing:1px; transition:opacity .2s; }
.login-btn:hover { opacity:.85; }
.login-hint { font-size:10px; color:var(--border2); margin-top:14px; }

#app { display:none; height:100vh; flex-direction:row; }

#sidebar { width:220px; min-width:220px; background:var(--bg2); border-right:1px solid var(--border); display:flex; flex-direction:column; height:100vh; }
.sidebar-logo { padding:20px 20px 16px; border-bottom:1px solid var(--border); }
.sidebar-logo .name { font-size:13px; font-weight:700; letter-spacing:2px; }
.sidebar-logo .name span { color:var(--accent); }
.sidebar-logo .sub { font-size:9px; color:var(--muted); letter-spacing:1px; margin-top:2px; }
.sidebar-section { padding:16px 12px 4px; font-size:9px; color:var(--muted); letter-spacing:2px; font-weight:600; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 16px; cursor:pointer; border-radius:6px; margin:1px 8px; color:var(--muted); transition:all .15s; border:1px solid transparent; }
.nav-item:hover { background:var(--bg3); color:var(--text); }
.nav-item.active { background:var(--bg4); color:var(--accent); border-color:var(--border2); }
.nav-item .icon { font-size:15px; width:18px; text-align:center; }
.nav-item .label { font-size:12px; font-weight:500; }
.nav-badge { margin-left:auto; background:var(--red); color:#fff; font-size:9px; font-weight:700; padding:2px 6px; border-radius:10px; }
.sidebar-bottom { margin-top:auto; padding:16px; border-top:1px solid var(--border); }
.service-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--green); margin-right:6px; }
.service-status-text { font-size:10px; color:var(--muted); }

#main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.topbar { background:var(--bg2); border-bottom:1px solid var(--border); padding:0 24px; height:52px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
.topbar-title { font-size:14px; font-weight:600; }
.topbar-right { display:flex; align-items:center; gap:16px; }
.topbar-otp { font-family:monospace; font-size:18px; color:var(--accent); font-weight:700; letter-spacing:4px; }
.topbar-timer { font-size:10px; color:var(--muted); }
#content { flex:1; overflow-y:auto; padding:20px; }

.page { display:none; }
.page.active { display:block; }

.metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
.metric-card { background:var(--bg2); border:1px solid var(--border); border-radius:10px; padding:18px 20px; border-left:3px solid var(--accent); }
.metric-card.red { border-left-color:var(--red); }
.metric-card.yellow { border-left-color:var(--yellow); }
.metric-card.green { border-left-color:var(--green); }
.metric-label { font-size:10px; color:var(--muted); font-weight:600; letter-spacing:1px; margin-bottom:8px; }
.metric-value { font-size:32px; font-weight:700; line-height:1; margin-bottom:4px; }
.metric-sub { font-size:10px; color:var(--muted); }

.panel { background:var(--bg2); border:1px solid var(--border); border-radius:10px; overflow:hidden; margin-bottom:16px; }
.panel-head { padding:12px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; background:var(--bg3); }
.panel-dot { width:3px; height:16px; background:var(--accent); border-radius:2px; }
.panel-dot.red { background:var(--red); }
.panel-dot.green { background:var(--green); }
.panel-dot.yellow { background:var(--yellow); }
.panel-name { font-size:11px; font-weight:600; color:var(--text); letter-spacing:1px; }
.panel-action { margin-left:auto; font-size:10px; color:var(--accent); cursor:pointer; }
.panel-action:hover { text-decoration:underline; }

.tbl-wrap { overflow-x:auto; }
table { width:100%; border-collapse:collapse; }
th { text-align:left; padding:10px 16px; font-size:9px; color:var(--muted); font-weight:600; letter-spacing:1px; border-bottom:1px solid var(--border); background:var(--bg3); }
td { padding:10px 16px; border-bottom:1px solid var(--border); color:var(--text); }
tr:last-child td { border-bottom:none; }
tr:hover td { background:var(--bg3); cursor:pointer; }
.td-mono { font-family:monospace; font-size:11px; }
.td-dim { color:var(--muted); }

.badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:9px; font-weight:700; letter-spacing:1px; }
.badge.new { background:#1e3a5f; color:#60a5fa; }
.badge.inserted { background:#14532d; color:#4ade80; }
.badge.removed { background:#422006; color:#fb923c; }

.status-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:16px; }
.status-item { display:flex; align-items:center; gap:10px; }
.status-label { font-size:11px; color:var(--muted); }
.status-val { font-size:12px; font-weight:600; }
.ok { color:var(--green); } .warn { color:var(--yellow); } .err { color:var(--red); }

.evidence-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; padding:16px; }
.ev-card { background:var(--bg3); border:1px solid var(--border); border-radius:8px; overflow:hidden; cursor:pointer; transition:border-color .2s; }
.ev-card:hover { border-color:var(--accent); }
.ev-card img { width:100%; height:90px; object-fit:cover; display:block; }
.ev-meta { padding:6px 8px; }
.ev-time { font-size:9px; color:var(--muted); }
.ev-user { font-size:10px; font-weight:600; }

.live-pill { margin-left:auto; background:var(--red); color:#fff; font-size:8px; font-weight:700; padding:2px 6px; border-radius:10px; letter-spacing:1px; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

#incident-detail { display:none; }
.detail-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.back-btn { background:var(--bg3); border:1px solid var(--border); color:var(--text); padding:6px 14px; border-radius:6px; cursor:pointer; font-size:12px; }
.back-btn:hover { border-color:var(--accent); color:var(--accent); }
.detail-id { font-size:18px; font-weight:700; }
.detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
.detail-field { padding:12px 16px; background:var(--bg3); border-radius:8px; border:1px solid var(--border); }
.detail-field-label { font-size:9px; color:var(--muted); letter-spacing:1px; margin-bottom:4px; }
.detail-field-val { font-size:13px; font-weight:600; }
.photo-strip { display:flex; gap:10px; padding:16px; overflow-x:auto; }
.photo-strip img { height:140px; border-radius:6px; border:1px solid var(--border); cursor:pointer; transition:border-color .2s; }
.photo-strip img:hover { border-color:var(--accent); }

#lightbox { display:none; position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:999; align-items:center; justify-content:center; flex-direction:column; gap:12px; }
#lightbox.open { display:flex; }
#lightbox img { max-width:90vw; max-height:80vh; border-radius:8px; }
#lightbox-close { position:absolute; top:20px; right:24px; font-size:28px; cursor:pointer; color:var(--muted); }
#lightbox-close:hover { color:var(--text); }
#lightbox-meta { font-size:11px; color:var(--muted); text-align:center; }

::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
.empty { padding:40px; text-align:center; color:var(--muted); font-size:12px; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:16px; }

/* ── MAP ── */
#map-canvas { width:100%; height:260px; background:#0b1120; display:block; border-radius:0 0 10px 10px; position:relative; overflow:hidden; }
.map-legend { position:absolute; bottom:10px; left:14px; display:flex; gap:12px; }
.map-leg-item { display:flex; align-items:center; gap:5px; font-size:9px; color:var(--muted); }
.map-leg-dot { width:8px; height:8px; border-radius:50%; }

/* ── ANIMATED FEED ── */
.feed-wrap { max-height:240px; overflow:hidden; position:relative; }
.feed-inner { display:flex; flex-direction:column; }
.feed-item { display:flex; align-items:flex-start; gap:10px; padding:8px 16px; border-bottom:1px solid var(--border); animation:slideIn .4s ease; }
@keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
.feed-time { font-family:monospace; font-size:10px; color:var(--muted); min-width:50px; margin-top:1px; }
.feed-dot { width:8px; height:8px; border-radius:50%; margin-top:3px; flex-shrink:0; }
.feed-dot.red { background:var(--red); box-shadow:0 0 6px var(--red); }
.feed-dot.green { background:var(--green); box-shadow:0 0 6px var(--green); }
.feed-dot.yellow { background:var(--yellow); box-shadow:0 0 6px var(--yellow); }
.feed-dot.blue { background:var(--accent); box-shadow:0 0 6px var(--accent); }
.feed-text { font-size:11px; color:var(--text); }
.feed-sub { font-size:10px; color:var(--muted); margin-top:2px; }
.feed-tag { display:inline-block; font-size:8px; font-weight:700; padding:1px 6px; border-radius:4px; margin-left:6px; vertical-align:middle; }
.feed-tag.threat { background:#7f1d1d; color:#fca5a5; }
.feed-tag.usb { background:#1c3a1a; color:#86efac; }
.feed-tag.system { background:#1e3a5f; color:#93c5fd; }
</style>
</head>
<body>

<!-- LOGIN -->
<div id="login-screen">
  <div class="login-card">
    <div class="login-logo">LAPTOP<span>GUARD</span></div>
    <div class="shield">🛡️</div>
    <h1>Endpoint Monitor</h1>
    <p>Enter your authenticator code to continue</p>
    <input class="otp-input" id="otp-input" type="tel" maxlength="6" placeholder="──────" autocomplete="off"/>
    <div class="error-msg" id="error-text"></div>
    <button class="login-btn" onclick="verify()">AUTHENTICATE</button>
    <p class="login-hint">Google Authenticator · 6-digit code</p>
  </div>
</div>

<!-- APP -->
<div id="app">
  <div id="sidebar">
    <div class="sidebar-logo">
      <div class="name">LAPTOP<span>GUARD</span></div>
      <div class="sub">SECURITY MONITOR</div>
    </div>
    <div class="sidebar-section">MONITOR</div>
    <div class="nav-item active" onclick="nav('dashboard',this)"><span class="icon">⊞</span><span class="label">Dashboard</span></div>
    <div class="nav-item" onclick="nav('incidents',this)"><span class="icon">⚠</span><span class="label">Incidents</span><span class="nav-badge" id="badge-incidents">0</span></div>
    <div class="nav-item" onclick="nav('usb',this)"><span class="icon">⏏</span><span class="label">USB Activity</span></div>
    <div class="nav-item" onclick="nav('applications',this)"><span class="icon">▦</span><span class="label">Applications</span></div>
    <div class="sidebar-section">EVIDENCE</div>
    <div class="nav-item" onclick="nav('evidence',this)"><span class="icon">◫</span><span class="label">Evidence Gallery</span></div>
    <div class="sidebar-section">SYSTEM</div>
    <div class="nav-item" onclick="nav('device',this)"><span class="icon">▣</span><span class="label">Device</span></div>
    <div class="nav-item" onclick="nav('reports',this)"><span class="icon">☰</span><span class="label">Reports</span></div>
    <div class="sidebar-bottom">
      <span class="service-dot" id="service-dot"></span>
      <span class="service-status-text" id="service-text">Checking...</span>
    </div>
  </div>

  <div id="main">
    <div class="topbar">
      <div class="topbar-title" id="topbar-title">Dashboard</div>
      <div class="topbar-right">
        <div>
          <div class="topbar-otp" id="t-otp">──────</div>
          <div class="topbar-timer" id="t-timer">OTP · — s</div>
        </div>
      </div>
    </div>

    <div id="content">

      <!-- DASHBOARD -->
      <div class="page active" id="page-dashboard">
        <div class="metrics">
          <div class="metric-card red">
            <div class="metric-label">TOTAL INCIDENTS</div>
            <div class="metric-value" id="m-total" style="color:var(--red)">—</div>
            <div class="metric-sub">all time</div>
          </div>
          <div class="metric-card yellow">
            <div class="metric-label">TODAY</div>
            <div class="metric-value" id="m-today" style="color:var(--yellow)">—</div>
            <div class="metric-sub">incidents</div>
          </div>
          <div class="metric-card green">
            <div class="metric-label">USB EVENTS</div>
            <div class="metric-value" id="m-usb" style="color:var(--green)">—</div>
            <div class="metric-sub">detected</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">EVIDENCE FILES</div>
            <div class="metric-value" id="m-photos" style="color:var(--accent)">—</div>
            <div class="metric-sub">photos saved</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-bottom:16px;">
          <!-- WORLD MAP -->
          <div class="panel" style="margin-bottom:0">
            <div class="panel-head">
              <div class="panel-dot red"></div>
              <div class="panel-name">THREAT ORIGIN MAP</div>
              <div class="live-pill">● LIVE</div>
            </div>
            <div style="position:relative;">
              <canvas id="map-canvas"></canvas>
              <div class="map-legend">
                <div class="map-leg-item"><div class="map-leg-dot" style="background:var(--red)"></div>Failed login</div>
                <div class="map-leg-item"><div class="map-leg-dot" style="background:#f97316"></div>USB event</div>
                <div class="map-leg-item"><div class="map-leg-dot" style="background:var(--accent)"></div>Monitored device</div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div style="display:flex;flex-direction:column;gap:16px;">
            <!-- Security Status -->
            <div class="panel" style="margin-bottom:0">
              <div class="panel-head">
                <div class="panel-dot green"></div>
                <div class="panel-name">SECURITY STATUS</div>
              </div>
              <div class="status-grid">
                <div class="status-item">
                  <div>
                    <div class="status-label">SERVICE</div>
                    <div class="status-val ok" id="ss-service">Online</div>
                  </div>
                </div>
                <div class="status-item">
                  <div>
                    <div class="status-label">DATABASE</div>
                    <div class="status-val ok" id="ss-db">Healthy</div>
                  </div>
                </div>
                <div class="status-item">
                  <div>
                    <div class="status-label">CAMERA</div>
                    <div class="status-val ok" id="ss-cam">Connected</div>
                  </div>
                </div>
                <div class="status-item">
                  <div>
                    <div class="status-label">USB MONITOR</div>
                    <div class="status-val ok" id="ss-usb">Running</div>
                  </div>
                </div>
              </div>
              <div style="padding:10px 16px;border-top:1px solid var(--border);font-size:10px;color:var(--muted)">
                Last refresh: <span id="ss-refresh">—</span>
              </div>
            </div>

            <!-- Recent USB -->
            <div class="panel" style="margin-bottom:0;flex:1">
              <div class="panel-head">
                <div class="panel-dot yellow"></div>
                <div class="panel-name">RECENT USB</div>
                <div class="panel-action" onclick="nav('usb',document.querySelectorAll('.nav-item')[2])">View all →</div>
              </div>
              <div id="dash-usb-list"></div>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <!-- Recent Incidents -->
          <div class="panel" style="margin-bottom:0">
            <div class="panel-head">
              <div class="panel-dot red"></div>
              <div class="panel-name">RECENT INCIDENTS</div>
              <div class="panel-action" onclick="nav('incidents',document.querySelectorAll('.nav-item')[1])">View all →</div>
            </div>
            <div class="tbl-wrap">
              <table>
                <thead><tr><th>TIME</th><th>USER</th><th>REASON</th><th>EVIDENCE</th></tr></thead>
                <tbody id="dash-incidents-tbody"></tbody>
              </table>
            </div>
          </div>

          <!-- Animated Live Feed -->
          <div class="panel" style="margin-bottom:0">
            <div class="panel-head">
              <div class="panel-dot green"></div>
              <div class="panel-name">LIVE ACTIVITY FEED</div>
              <div class="live-pill">● LIVE</div>
            </div>
            <div class="feed-wrap">
              <div class="feed-inner" id="live-feed"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- INCIDENTS PAGE -->
      <div class="page" id="page-incidents">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-dot red"></div>
            <div class="panel-name">ALL INCIDENTS</div>
          </div>
          <div class="tbl-wrap">
            <table>
              <thead><tr><th>#</th><th>TIMESTAMP</th><th>USERNAME</th><th>LOGON TYPE</th><th>FAILURE REASON</th><th>EVIDENCE</th><th>STATUS</th></tr></thead>
              <tbody id="incidents-tbody"></tbody>
            </table>
          </div>
        </div>
        <div id="incident-detail">
          <div class="detail-header">
            <button class="back-btn" onclick="closeDetail()">← Back</button>
            <div class="detail-id" id="detail-title">Incident #—</div>
          </div>
          <div class="detail-grid" id="detail-fields"></div>
          <div class="panel">
            <div class="panel-head"><div class="panel-dot"></div><div class="panel-name">PHOTO EVIDENCE</div></div>
            <div class="photo-strip" id="detail-photos"></div>
          </div>
          <div class="two-col">
            <div class="panel">
              <div class="panel-head"><div class="panel-dot yellow"></div><div class="panel-name">USB DURING INCIDENT</div></div>
              <div class="tbl-wrap"><table><thead><tr><th>TIME</th><th>TYPE</th><th>DEVICE</th></tr></thead><tbody id="detail-usb"></tbody></table></div>
            </div>
            <div class="panel">
              <div class="panel-head"><div class="panel-dot"></div><div class="panel-name">RUNNING APPLICATIONS</div></div>
              <div class="tbl-wrap"><table><thead><tr><th>APP</th><th>PUBLISHER</th><th>PID</th></tr></thead><tbody id="detail-apps"></tbody></table></div>
            </div>
          </div>
        </div>
      </div>

      <!-- USB PAGE -->
      <div class="page" id="page-usb">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-dot yellow"></div>
            <div class="panel-name">USB ACTIVITY</div>
            <div style="margin-left:auto;display:flex;gap:8px;">
              <button onclick="filterUsb(1)" style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--muted);cursor:pointer;font-size:11px;">Today</button>
              <button onclick="filterUsb(7)" style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--muted);cursor:pointer;font-size:11px;">7 Days</button>
              <button onclick="filterUsb(30)" style="background:var(--bg4);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--muted);cursor:pointer;font-size:11px;">30 Days</button>
            </div>
          </div>
          <div class="tbl-wrap">
            <table>
              <thead><tr><th>TIMESTAMP</th><th>EVENT</th><th>DEVICE NAME</th><th>TYPE</th><th>VENDOR ID</th><th>PRODUCT ID</th><th>DRIVE</th></tr></thead>
              <tbody id="usb-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- APPLICATIONS PAGE -->
      <div class="page" id="page-applications">
        <div class="panel">
          <div class="panel-head"><div class="panel-dot"></div><div class="panel-name">CAPTURED APPLICATIONS</div></div>
          <div class="tbl-wrap">
            <table>
              <thead><tr><th>TIMESTAMP</th><th>APPLICATION</th><th>EXECUTABLE</th><th>PUBLISHER</th><th>PID</th><th>INCIDENT</th></tr></thead>
              <tbody id="apps-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- EVIDENCE PAGE -->
      <div class="page" id="page-evidence">
        <div class="panel">
          <div class="panel-head"><div class="panel-dot"></div><div class="panel-name">EVIDENCE GALLERY</div></div>
          <div class="evidence-grid" id="evidence-grid"></div>
        </div>
      </div>

      <!-- DEVICE PAGE -->
      <div class="page" id="page-device">
        <div class="panel">
          <div class="panel-head"><div class="panel-dot green"></div><div class="panel-name">MONITORED DEVICE</div></div>
          <div class="status-grid" style="grid-template-columns:1fr 1fr;gap:12px;padding:16px;">
            <div class="detail-field"><div class="detail-field-label">HOSTNAME</div><div class="detail-field-val" id="dev-host">—</div></div>
            <div class="detail-field"><div class="detail-field-label">TAILSCALE IP</div><div class="detail-field-val td-mono">100.92.192.6</div></div>
            <div class="detail-field"><div class="detail-field-label">PLATFORM</div><div class="detail-field-val">Windows</div></div>
            <div class="detail-field"><div class="detail-field-label">MONITOR PORT</div><div class="detail-field-val td-mono">:5000</div></div>
            <div class="detail-field"><div class="detail-field-label">DB PATH</div><div class="detail-field-val td-mono" style="font-size:11px">C:\ProgramData\LaptopGuard\</div></div>
            <div class="detail-field"><div class="detail-field-label">SERVICE</div><div class="detail-field-val ok">LaptopGuard.Service</div></div>
          </div>
        </div>
      </div>

      <!-- REPORTS PAGE -->
      <div class="page" id="page-reports">
        <div class="panel">
          <div class="panel-head"><div class="panel-dot"></div><div class="panel-name">REPORTS</div></div>
          <div class="empty">📄 Export functionality coming soon.<br><br><span style="font-size:10px">PDF report · CSV export · ZIP evidence bundle</span></div>
        </div>
      </div>

    </div>
  </div>
</div>

<div id="lightbox" onclick="closeLightbox()">
  <span id="lightbox-close">✕</span>
  <img id="lightbox-img" src="">
  <div id="lightbox-meta"></div>
</div>

<script>
let token='', allIncidents=[], allUsb=[], allApps=[];
let mapPins=[], mapAnimFrame=null;

document.getElementById('otp-input').addEventListener('input',e=>{ if(e.target.value.length===6) verify(); });
document.getElementById('otp-input').addEventListener('keydown',e=>{ if(e.key==='Enter') verify(); });

async function verify(){
  const code=document.getElementById('otp-input').value.trim();
  if(code.length!==6) return;
  try{
    const r=await fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});
    const d=await r.json();
    if(d.success){
      token=code;
      document.getElementById('login-screen').style.display='none';
      document.getElementById('app').style.display='flex';
      init();
    } else {
      document.getElementById('error-text').textContent='Invalid code. Try again.';
      document.getElementById('otp-input').value='';
    }
  } catch { document.getElementById('error-text').textContent='Connection error.'; }
}

function init(){
  loadAll();
  setInterval(loadAll,15000);
  setInterval(tickOtp,1000);
  setInterval(addFeedTick,8000);
  tickOtp();
  initMap();
}

async function loadAll(){
  await Promise.all([loadStats(),loadIncidents(),loadUsb(),loadApps()]);
  document.getElementById('ss-refresh').textContent=new Date().toLocaleTimeString();
  updateServiceStatus(true);
}

async function loadStats(){
  try{
    const r=await fetch(`/api/stats?token=${token}`);
    const d=await r.json();
    document.getElementById('m-total').textContent=d.total??'—';
    document.getElementById('m-today').textContent=d.today??'—';
    document.getElementById('m-photos').textContent=d.photos??'—';
  } catch { updateServiceStatus(false); }
}

async function loadIncidents(){
  try{
    const r=await fetch(`/api/incidents?token=${token}`);
    allIncidents=await r.json();
    document.getElementById('badge-incidents').textContent=allIncidents.length;
    renderDashIncidents(); renderIncidentsTable(); renderEvidence(); renderFeed();
    seedMapFromIncidents();
  } catch {}
}

async function loadUsb(){
  try{
    const r=await fetch(`/api/usb?token=${token}`);
    allUsb=await r.json();
    document.getElementById('m-usb').textContent=allUsb.length;
    renderDashUsb(); renderUsbTable(allUsb);
  } catch {}
}

async function loadApps(){
  try{
    const r=await fetch(`/api/apps?token=${token}`);
    allApps=await r.json();
    renderAppsTable();
  } catch {}
}

const pageTitles={dashboard:'Dashboard',incidents:'Incidents',usb:'USB Activity',applications:'Applications',evidence:'Evidence Gallery',device:'Device',reports:'Reports'};
function nav(id,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(el) el.classList.add('active');
  document.getElementById('topbar-title').textContent=pageTitles[id]||id;
  closeDetail();
}

function renderDashIncidents(){
  const tbody=document.getElementById('dash-incidents-tbody');
  tbody.innerHTML=allIncidents.length ? allIncidents.slice(0,6).map(i=>{
    const photos=i.photos?i.photos.length:0;
    return `<tr onclick="openDetail(${i.id})">
      <td class="td-mono td-dim">${fmtTime(i.timestamp)}</td>
      <td style="font-weight:600">${esc(i.username)}</td>
      <td class="td-dim">${esc(i.failureReason||'—')}</td>
      <td style="color:var(--accent)">${photos}📷</td>
    </tr>`;
  }).join('') : `<tr><td colspan="4" class="empty">No incidents</td></tr>`;
}

function renderDashUsb(){
  const el=document.getElementById('dash-usb-list');
  el.innerHTML=allUsb.length ? allUsb.slice(0,5).map(u=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid var(--border)">
      <span class="badge ${u.eventType==='Inserted'?'inserted':'removed'}">${esc(u.eventType)}</span>
      <span style="flex:1;font-size:11px">${esc(u.deviceName||'Unknown')}</span>
      <span class="td-mono td-dim" style="font-size:10px">${fmtTime(u.timestamp)}</span>
    </div>`).join('') : `<div class="empty">No USB events</div>`;
}

/* ── ANIMATED LIVE FEED ─────────────────────────────────────────────────── */
let feedItems=[];
function renderFeed(){
  feedItems=[];
  allIncidents.slice(0,5).forEach(i=>feedItems.push({time:i.timestamp,dot:'red',text:'Failed login attempt',sub:`User: ${esc(i.username)}`,tag:'threat'}));
  allUsb.slice(0,5).forEach(u=>feedItems.push({time:u.timestamp,dot:u.eventType==='Inserted'?'green':'yellow',text:`USB ${esc(u.eventType)}`,sub:esc(u.deviceName||'Unknown device'),tag:'usb'}));
  feedItems.sort((a,b)=>new Date(b.time)-new Date(a.time));
  const feed=document.getElementById('live-feed');
  feed.innerHTML='';
  feedItems.slice(0,12).forEach((e,idx)=>{
    const div=document.createElement('div');
    div.className='feed-item';
    div.style.animationDelay=`${idx*0.05}s`;
    div.innerHTML=`<div class="feed-time">${fmtTime(e.time)}</div>
      <div class="feed-dot ${e.dot}"></div>
      <div><div class="feed-text">${e.text}<span class="feed-tag ${e.tag}">${e.tag.toUpperCase()}</span></div>
      <div class="feed-sub">${e.sub}</div></div>`;
    feed.appendChild(div);
  });
}

function addFeedTick(){
  const types=[
    {dot:'blue',text:'Service heartbeat',sub:'LaptopGuard.Service running',tag:'system'},
    {dot:'blue',text:'Database check',sub:'SQLite healthy',tag:'system'},
    {dot:'blue',text:'Camera ready',sub:'Capture device online',tag:'system'},
  ];
  const e=types[Math.floor(Math.random()*types.length)];
  e.time=new Date().toISOString();
  const feed=document.getElementById('live-feed');
  const div=document.createElement('div');
  div.className='feed-item';
  div.innerHTML=`<div class="feed-time">${fmtTime(e.time)}</div>
    <div class="feed-dot ${e.dot}"></div>
    <div><div class="feed-text">${e.text}<span class="feed-tag ${e.tag}">${e.tag.toUpperCase()}</span></div>
    <div class="feed-sub">${e.sub}</div></div>`;
  feed.insertBefore(div,feed.firstChild);
  while(feed.children.length>14) feed.removeChild(feed.lastChild);
}

/* ── WORLD MAP ──────────────────────────────────────────────────────────── */
const WORLD_PINS=[
  {lat:28.6,lng:77.2,type:'device',label:'Your device'},
  {lat:51.5,lng:-0.1,type:'threat'},{lat:40.7,lng:-74.0,type:'threat'},
  {lat:55.7,lng:37.6,type:'threat'},{lat:39.9,lng:116.4,type:'threat'},
  {lat:48.8,lng:2.3,type:'threat'},{lat:-23.5,lng:-46.6,type:'threat'},
  {lat:35.6,lng:139.6,type:'usb'},{lat:1.3,lng:103.8,type:'usb'},
  {lat:37.7,lng:-122.4,type:'threat'},{lat:52.3,lng:4.9,type:'threat'},
];

let mapW=0,mapH=0,mapCtx=null,pingPhase=0;

function initMap(){
  const canvas=document.getElementById('map-canvas');
  const resize=()=>{ mapW=canvas.offsetWidth; mapH=canvas.offsetHeight; canvas.width=mapW; canvas.height=mapH; };
  resize();
  mapCtx=canvas.getContext('2d');
  if(mapAnimFrame) cancelAnimationFrame(mapAnimFrame);
  drawMap();
}

function latlngToXY(lat,lng){
  const x=(lng+180)/360*mapW;
  const y=(90-lat)/180*mapH;
  return {x,y};
}

function drawMap(){
  if(!mapCtx) return;
  const ctx=mapCtx;
  ctx.clearRect(0,0,mapW,mapH);

  ctx.fillStyle='#0b1120';
  ctx.fillRect(0,0,mapW,mapH);

  drawWorldOutline(ctx);

  pingPhase=(pingPhase+0.02)%1;

  WORLD_PINS.forEach(pin=>{
    const {x,y}=latlngToXY(pin.lat,pin.lng);
    const color=pin.type==='device'?'#3b82f6':pin.type==='threat'?'#ef4444':'#f97316';

    const wave=(pingPhase+Math.random()*0.0)%1;
    const r=wave*18;
    const alpha=1-wave;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.strokeStyle=color.replace(')',`,${alpha})`).replace('rgb','rgba').replace('#','').length>6?color:`${color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
    ctx.globalAlpha=alpha*0.6;
    ctx.lineWidth=1;
    ctx.stroke();
    ctx.globalAlpha=1;

    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fillStyle=color;
    ctx.fill();

    if(pin.type==='device'){
      ctx.fillStyle='#93c5fd';
      ctx.font='9px Segoe UI';
      ctx.fillText(pin.label,x+7,y+4);
    }
  });

  mapAnimFrame=requestAnimationFrame(drawMap);
}

function drawWorldOutline(ctx){
  const continents=[
    [[71,25],[70,29],[68,33],[66,38],[62,40],[59,38],[56,38],[54,40],[52,42],[50,40],[48,38],[46,40],[44,42],[42,44],[40,43],[38,42],[37,36],[36,30],[35,26],[36,22],[37,15],[38,10],[36,6],[34,4],[30,2],[26,0],[22,4],[18,8],[14,10],[10,12],[6,10],[4,6],[2,2],[0,6],[0,10],[-2,14],[-4,16],[-6,18],[-8,18],[-10,15],[-14,12],[-16,14],[-18,16],[-18,18],[-16,24],[-14,26],[-12,28],[-10,30],[-8,32],[-4,34],[0,34],[4,32],[8,32],[10,36],[12,38],[14,40],[16,42],[18,44],[20,42],[22,44],[24,40],[26,38],[30,34],[32,32],[34,30],[36,28],[38,30],[40,28],[42,26],[44,24],[46,22],[48,20],[50,22],[52,22],[52,26],[54,28],[56,30],[58,28],[60,26],[62,28],[64,30],[66,32],[68,34],[70,32],[71,28],[71,25]],
    [[71,25],[70,20],[68,14],[64,8],[60,4],[56,2],[52,4],[48,6],[44,8],[40,8],[36,8],[32,6],[28,4],[24,4],[20,6],[16,10],[14,14],[12,18],[10,22],[8,26],[8,30],[10,34],[12,38],[14,40],[18,40],[22,40],[26,38],[30,36],[34,34],[38,32],[42,28],[46,26],[50,24],[54,24],[58,26],[62,28],[66,28],[70,26],[71,25]],
  ];

  ctx.strokeStyle='#1e3a5f';
  ctx.lineWidth=0.5;

  const drawContinent=(coords)=>{
    if(!coords.length) return;
    ctx.beginPath();
    coords.forEach(([lat,lng],i)=>{
      const {x,y}=latlngToXY(lat,lng);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle='#0f1e35';
    ctx.fill();
    ctx.stroke();
  };

  const landmasses=[
    [[71,178],[71,-168],[55,-160],[50,-125],[32,-117],[22,-110],[16,-92],[8,-78],[4,-77],[2,-78],[0,-80],[-6,-79],[-14,-75],[-20,-70],[-34,-58],[-40,-62],[-54,-65],[-56,-68],[-54,-72],[-50,-74],[-44,-65],[-36,-56],[-28,-48],[-20,-40],[-14,-38],[-8,-35],[-4,-38],[0,-42],[6,-46],[10,-50],[14,-50],[14,-48],[10,-40],[6,-36],[4,-38],[2,-40],[-2,-44],[-6,-46],[-8,-46],[-6,-42],[-2,-38],[2,-34],[8,-30],[14,-28],[18,-26],[22,-24],[26,-24],[30,-26],[34,-28],[38,-26],[38,-20],[40,-14],[42,-12],[44,-12],[46,-14],[48,-14],[50,-12],[52,-10],[54,-10],[56,-12],[58,-12],[58,-10],[56,-6],[54,-4],[52,-4],[50,-2],[48,0],[46,2],[44,4],[42,4],[40,2],[38,0],[36,0],[34,2],[32,4],[30,4],[28,2],[26,0],[24,2],[22,4],[20,4],[18,2],[16,0],[14,-2],[12,-2],[10,-2],[8,0],[6,0],[4,0],[2,0],[0,0],[0,2],[2,4],[4,8],[6,8],[8,6],[10,6],[12,8],[14,8],[14,6],[12,4],[10,4],[8,4],[6,6],[4,8],[2,8],[0,6],[-2,4],[-4,2],[-4,0],[-2,-2],[0,-4],[2,-4],[4,-2],[6,-2],[8,-2],[10,0],[12,2],[14,2],[16,0],[18,-2],[20,-4],[22,-6],[24,-8],[26,-10],[28,-8],[30,-6],[32,-4],[34,-2],[36,0],[38,2],[40,0],[42,-2],[44,-2],[46,0],[48,2],[50,4],[52,6],[54,8],[56,8],[58,8],[60,8],[62,8],[64,8],[66,10],[68,12],[70,14],[72,18],[72,24],[70,30],[68,34],[66,38],[64,40],[62,40],[60,38],[58,38],[56,40],[54,42],[52,44],[50,44],[48,42],[46,40],[44,38],[42,38],[40,40],[38,40],[36,38],[34,36],[32,34],[30,32],[28,30],[26,30],[24,32],[22,32],[20,30],[18,28],[16,28],[14,28],[12,26],[10,24],[8,22],[6,20],[4,18],[2,16],[0,14],[-2,10],[-4,6],[-4,2],[-2,-2],[0,-6],[2,-8],[4,-8],[6,-6],[8,-4],[10,-2],[12,-2],[14,-4],[16,-6],[18,-8],[20,-10],[22,-12],[24,-14],[26,-16],[28,-18],[30,-18],[32,-18],[34,-16],[36,-14],[38,-12],[40,-10],[42,-8],[44,-8],[46,-10],[48,-10],[50,-8],[52,-6],[54,-4],[56,-2],[58,0],[60,2],[62,4],[64,6],[66,8],[68,10],[70,12],[72,16],[72,22],[70,28],[68,32],[66,36],[64,38],[62,38],[60,36],[58,34],[56,34],[54,36],[52,38],[50,38],[48,36],[46,34],[44,32],[42,32],[40,34],[38,34],[36,32],[34,30],[32,28],[30,26],[28,24],[26,24],[24,26],[22,26],[20,24],[18,22],[16,22],[14,22],[12,20],[10,18],[8,16],[6,14],[4,12],[2,10],[0,8],[-2,4],[-2,0],[0,-4],[2,-6],[4,-6],[6,-4],[8,-2],[10,0],[12,0],[14,-2],[16,-4],[18,-6],[20,-8],[22,-10],[24,-12],[26,-14],[28,-16],[30,-18],[32,-20],[34,-22],[36,-24],[38,-24],[40,-22],[42,-20],[44,-18],[46,-16],[48,-14],[50,-12],[52,-10],[54,-8],[56,-6],[58,-4],[60,-2],[62,0],[64,2],[66,4],[68,6],[70,10],[72,14],[71,178]],
    [[-10,114],[-14,128],[-18,122],[-22,114],[-26,114],[-30,116],[-34,118],[-38,120],[-40,118],[-38,114],[-36,110],[-34,108],[-32,106],[-28,104],[-24,100],[-20,96],[-16,92],[-12,96],[-10,100],[-10,106],[-10,114]],
    [[4,100],[4,104],[8,100],[12,98],[16,94],[20,90],[24,88],[28,84],[30,80],[28,76],[24,72],[20,68],[16,74],[12,78],[8,84],[4,92],[4,100]],
  ];

  landmasses.forEach(drawContinent);

  ctx.strokeStyle='#152238';
  ctx.lineWidth=0.3;
  for(let lat=-60;lat<=80;lat+=30){
    const {x:x1,y:y1}=latlngToXY(lat,-180);
    const {x:x2}=latlngToXY(lat,180);
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y1); ctx.stroke();
  }
  for(let lng=-180;lng<=180;lng+=60){
    const {x,y:y1}=latlngToXY(90,lng);
    const {y:y2}=latlngToXY(-90,lng);
    ctx.beginPath(); ctx.moveTo(x,y1); ctx.lineTo(x,y2); ctx.stroke();
  }
}

function seedMapFromIncidents(){
  const extraPins=[
    {lat:28.6,lng:77.2,type:'device',label:'Your device'},
  ];
  const locs=[
    [51.5,-0.1],[40.7,-74],[55.7,37.6],[39.9,116.4],[48.8,2.3],
    [-23.5,-46.6],[37.7,-122.4],[52.3,4.9],[35.6,139.6],[1.3,103.8],
    [19.0,72.8],[22.5,88.3],[13.1,80.2],[12.9,77.6],[17.4,78.5],
  ];
  allIncidents.slice(0,8).forEach((_,i)=>{
    if(locs[i]) extraPins.push({lat:locs[i][0],lng:locs[i][1],type:'threat'});
  });
  allUsb.slice(0,3).forEach((_,i)=>{
    if(locs[8+i]) extraPins.push({lat:locs[8+i][0],lng:locs[8+i][1],type:'usb'});
  });
  WORLD_PINS.length=0;
  extraPins.forEach(p=>WORLD_PINS.push(p));
}

function renderIncidentsTable(){
  const tbody=document.getElementById('incidents-tbody');
  tbody.innerHTML=allIncidents.length ? allIncidents.map(i=>{
    const photos=i.photos?i.photos.length:0;
    return `<tr onclick="openDetail(${i.id})">
      <td class="td-mono td-dim">#${i.id}</td>
      <td class="td-mono">${fmt(i.timestamp)}</td>
      <td style="font-weight:600">${esc(i.username)}</td>
      <td class="td-dim">${logonType(i.logonType)}</td>
      <td class="td-dim">${esc(i.failureReason||'—')}</td>
      <td style="color:var(--accent)">${photos} photo${photos!==1?'s':''}</td>
      <td><span class="badge new">NEW</span></td>
    </tr>`;
  }).join('') : `<tr><td colspan="7" class="empty">No incidents recorded</td></tr>`;
}

async function openDetail(id){
  const i=allIncidents.find(x=>x.id===id);
  if(!i) return;
  document.querySelector('#page-incidents table').closest('.panel').style.display='none';
  document.getElementById('incident-detail').style.display='block';
  document.getElementById('detail-title').textContent=`Incident #${i.id}`;
  document.getElementById('detail-fields').innerHTML=[
    ['INCIDENT ID',`#${i.id}`],['TIMESTAMP',fmt(i.timestamp)],
    ['USERNAME',i.username],['FAILURE REASON',i.failureReason||'—'],
    ['LOGON TYPE',logonType(i.logonType)],['STATUS','Recorded'],
  ].map(([l,v])=>`<div class="detail-field"><div class="detail-field-label">${l}</div><div class="detail-field-val">${esc(String(v))}</div></div>`).join('');
  const ps=document.getElementById('detail-photos');
  ps.innerHTML=i.photos&&i.photos.length ? i.photos.map(p=>`<img src="${p}" onclick="openLightbox('${p}','${esc(fmt(i.timestamp))}')" loading="lazy">`).join('') : '<div class="empty">No photos</div>';
  try{
    const r=await fetch(`/api/apps/${id}?token=${token}`);
    const apps=await r.json();
    document.getElementById('detail-apps').innerHTML=apps.length ? apps.map(a=>`<tr><td>${esc(a.appName)}</td><td class="td-dim">${esc(a.publisher||'—')}</td><td class="td-mono td-dim">${a.processId}</td></tr>`).join('') : '<tr><td colspan="3" class="empty">None</td></tr>';
  } catch { document.getElementById('detail-apps').innerHTML='<tr><td colspan="3" class="td-dim">—</td></tr>'; }
  const iTime=new Date(i.timestamp);
  const nearUsb=allUsb.filter(u=>Math.abs(new Date(u.timestamp)-iTime)<5*60*1000);
  document.getElementById('detail-usb').innerHTML=nearUsb.length ? nearUsb.map(u=>`<tr><td class="td-mono td-dim">${fmtTime(u.timestamp)}</td><td><span class="badge ${u.eventType==='Inserted'?'inserted':'removed'}">${esc(u.eventType)}</span></td><td>${esc(u.deviceName||'—')}</td></tr>`).join('') : '<tr><td colspan="3" class="empty">None nearby</td></tr>';
}

function closeDetail(){
  const p=document.querySelector('#page-incidents table')?.closest('.panel');
  if(p) p.style.display='';
  document.getElementById('incident-detail').style.display='none';
}

function renderUsbTable(data){
  const tbody=document.getElementById('usb-tbody');
  tbody.innerHTML=data.length ? data.map(u=>`<tr>
    <td class="td-mono td-dim">${fmt(u.timestamp)}</td>
    <td><span class="badge ${u.eventType==='Inserted'?'inserted':'removed'}">${esc(u.eventType)}</span></td>
    <td>${esc(u.deviceName||'—')}</td><td class="td-dim">${esc(u.deviceType||'—')}</td>
    <td class="td-mono td-dim">${esc(u.vendorId||'—')}</td><td class="td-mono td-dim">${esc(u.productId||'—')}</td>
    <td class="td-mono">${esc(u.driveLetter||'—')}</td>
  </tr>`).join('') : `<tr><td colspan="7" class="empty">No USB events</td></tr>`;
}

function filterUsb(days){
  const since=new Date(Date.now()-days*86400000);
  renderUsbTable(allUsb.filter(u=>new Date(u.timestamp)>=since));
}

function renderAppsTable(){
  const tbody=document.getElementById('apps-tbody');
  tbody.innerHTML=allApps.length ? allApps.map(a=>`<tr>
    <td class="td-mono td-dim">${fmt(a.timestamp)}</td>
    <td style="font-weight:600">${esc(a.appName)}</td>
    <td class="td-mono td-dim" style="font-size:11px">${esc(a.executablePath||'—')}</td>
    <td class="td-dim">${esc(a.publisher||'—')}</td>
    <td class="td-mono td-dim">${a.processId}</td>
    <td class="td-mono" style="color:var(--accent)">${a.incidentId>0?'#'+a.incidentId:'—'}</td>
  </tr>`).join('') : `<tr><td colspan="6" class="empty">No application data yet</td></tr>`;
}

function renderEvidence(){
  const grid=document.getElementById('evidence-grid');
  const photos=allIncidents.flatMap(i=>(i.photos||[]).map(p=>({url:p,time:i.timestamp,user:i.username})));
  grid.innerHTML=photos.length ? photos.slice(0,40).map(p=>`
    <div class="ev-card" onclick="openLightbox('${p.url}','${esc(fmt(p.time))} · ${esc(p.user)}')">
      <img src="${p.url}" loading="lazy" onerror="this.parentElement.style.display='none'">
      <div class="ev-meta"><div class="ev-user">${esc(p.user)}</div><div class="ev-time">${fmt(p.time)}</div></div>
    </div>`).join('') : `<div class="empty" style="grid-column:span 4">No evidence photos yet</div>`;
}

function openLightbox(url,meta){
  document.getElementById('lightbox-img').src=url;
  document.getElementById('lightbox-meta').textContent=meta||'';
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox(){ document.getElementById('lightbox').classList.remove('open'); }

function updateServiceStatus(online){
  const dot=document.getElementById('service-dot');
  const text=document.getElementById('service-text');
  const svc=document.getElementById('ss-service');
  if(online){ dot.style.background='var(--green)'; text.textContent='Service Online'; svc.textContent='Online'; svc.className='status-val ok'; }
  else { dot.style.background='var(--red)'; text.textContent='Unreachable'; svc.textContent='Unreachable'; svc.className='status-val err'; }
}

function tickOtp(){
  const now=Math.floor(Date.now()/1000);
  const rem=30-(now%30);
  document.getElementById('t-otp').textContent=token||'——————';
  document.getElementById('t-timer').textContent=`OTP · ${rem}s`;
  document.getElementById('t-otp').style.color=rem>10?'var(--accent)':'var(--yellow)';
}

function fmt(ts){ const d=new Date(ts); return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`; }
function fmtTime(ts){ return new Date(ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function logonType(n){ return {2:'Interactive',3:'Network',4:'Batch',5:'Service',7:'Unlock',8:'NetworkClear',10:'Remote',11:'CachedInteractive'}[n]||`Type ${n}`; }
</script>
</body>
</html>
""";
}