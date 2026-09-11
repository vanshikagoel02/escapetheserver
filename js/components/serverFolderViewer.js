/**
 * THE EPOCH - SERVER Folder
 * /SERVER/ROOT houses: the live data-wipe dashboard + P10 evidence (default view),
 * recovery_code (locked until slot 1 is finalized in suspects_db), and
 * nettrace (locked until slot 2 is finalized). Plus a few supplementary log files.
 */

import { gameState } from '../state.js';
import { sound } from '../audio.js';
import { PROPS } from '../data/props.js';

export class ServerFolderViewerComponent {
  constructor(container, onOpenFile) {
    this.container = container;
    this.onOpenFile = onOpenFile; // Callback to open other windows (e.g. code / network)
    this.activeFileId = "WIPE";
    this.displayedPercent = 0; // strictly non-decreasing display value
    this.jitterAccum = 0;
    this.tickInterval = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.startLiveTick();

    gameState.subscribe((event) => {
      if (['LEVEL_CHANGED', 'GAME_RESET', 'SUSPECT_FINALIZED',
           'RECOVERY_CODE_SOLVED', 'NETTRACE_SOLVED', 'WIPE_STOPPED', 'FINAL_ACCUSATION_SUBMITTED'].includes(event)) {
        this.render();
        this.bindEvents();
      }
    });
  }

  // Live-ticking percentage display that only ever climbs (never appears to
  // decrease), even between real progress jumps.
  startLiveTick() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      if (this.activeFileId !== 'WIPE') return;
      const el = this.container.querySelector('#live-wipe-percent');
      const barEl = this.container.querySelector('#live-wipe-bar-fill');
      if (!el) return;

      if (gameState.data.wipeStopped) {
        this.displayedPercent = 0;
        this.jitterAccum = 0;
        el.textContent = `0.0%`;
        if (barEl) barEl.style.width = `0%`;
        return;
      }

      const base = gameState.getWipePercent();
      this.jitterAccum = Math.min(0.9, this.jitterAccum + Math.random() * 0.15);
      const target = Math.min(99.4, base + this.jitterAccum);
      // Never let the on-screen number go down — only ever climb.
      this.displayedPercent = Math.max(this.displayedPercent, target);

      el.textContent = `${this.displayedPercent.toFixed(1)}%`;
      if (barEl) barEl.style.width = `${this.displayedPercent}%`;
    }, 650);
  }

  files() {
    return [
      { id: "WIPE", name: "wipe_telemetry.sys", type: "SYSTEM", icon: "🔴", label: "Live Wipe Status + P10 Evidence", locked: false },
      { id: "RECOVERY", name: "recovery_code", type: "SCRIPT", icon: "🐍", label: "Recovery / Debug Script", locked: gameState.isRecoveryCodeLocked() },
      { id: "NETTRACE", name: "nettrace", type: "TOOL", icon: "🌐", label: "SAGE Perimeter Firewall", locked: gameState.isNettraceLocked() },
      { id: "S02", name: "entry_log_rao.txt", type: "LOG", icon: "📜", label: "Physical Entry Log", locked: false },
      { id: "S04", name: "internal_chat.log", type: "CHAT", icon: "💬", label: "Internal Chat Archive", locked: false }
    ];
  }

  render() {
    const files = this.files();
    const active = files.find(f => f.id === this.activeFileId) || files[0];

    this.container.innerHTML = `
      <div class="server-folder-layout">
        <!-- Sidebar Navigation -->
        <div class="server-folder-sidebar">
          <div class="server-folder-header">
            <span class="folder-title-tag">📁 /SERVER/ROOT</span>
          </div>
          <div class="server-file-list">
            ${files.map(f => `
              <div class="server-file-item ${f.id === this.activeFileId ? 'active' : ''} ${f.locked ? 'locked-file' : ''}" data-id="${f.id}">
                <span class="file-icon">${f.locked ? '🔒' : f.icon}</span>
                <div class="file-info">
                  <div class="file-name">${f.name}</div>
                  <div class="file-label">${f.locked ? 'LOCKED' : f.label}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Main Display Content Stage -->
        <div class="server-folder-stage">
          ${this.renderFileContent(active)}
        </div>
      </div>
    `;
  }

  renderFileContent(file) {
    if (file.locked) {
      const reason = file.id === 'RECOVERY'
        ? 'Finalize any 1 suspect in suspects_db to decrypt this file.'
        : 'Finalize 2 suspects in suspects_db to decrypt this file.';
      return `
        <div class="app-locked-overlay" style="height:100%;">
          <div class="lock-icon">🔒</div>
          <h3>FILE ENCRYPTED: ${file.name}</h3>
          <p>${reason}</p>
        </div>
      `;
    }

    if (file.id === 'WIPE') {
      const p10 = PROPS['P10'];
      const percent = gameState.getWipePercent();
      const stopped = gameState.data.wipeStopped;
      return `
        <div class="server-wipe-dashboard split-view">
          <div class="wipe-split-left">
            <div class="wipe-status-heading">${stopped ? 'WIPE TERMINATED' : 'DATA WIPE STATUS'}</div>
            <div class="wipe-big-percent-box live">
              <div class="huge-digital-percent ${stopped ? 'stopped' : 'live-pulse'}" id="live-wipe-percent">${percent.toFixed(1)}%</div>
              <div class="live-wipe-bar-track"><div class="live-wipe-bar-fill" id="live-wipe-bar-fill" style="width:${percent}%;"></div></div>
              <div class="percent-subtext">${stopped ? 'Remote wipe process terminated. System secured.' : 'of EPOCH-01 destroyed — process sage-integrity-monitor (PID 4412), no operator attached'}</div>
            </div>
          </div>
          <div class="wipe-split-right">
            <div class="doc-meta-bar">
              <h3>${p10.title}</h3>
            </div>
            <table class="cyber-table">
              <thead>
                <tr><th>Time</th><th>ID</th><th>Name</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${p10.content.records.map(r => `
                  <tr class="${r.direction.includes('UNKNOWN') || r.badgeId === 'UNKNOWN' ? 'highlight-row error' : ''}">
                    <td><strong>${r.time}</strong></td>
                    <td><code>${r.badgeId}</code></td>
                    <td><strong>${r.name}</strong></td>
                    <td>${r.gate}</td>
                    <td>${r.direction}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="key-observation-box" style="margin-top: 10px;">ℹ️ ${p10.content.keyObservation}</div>
          </div>
        </div>
      `;
    }

    if (file.id === 'RECOVERY') {
      return `
        <div class="server-document-view server-launch-view">
          <div class="doc-meta-bar">
            <h3>🐍 recovery_code — decrypted</h3>
            <span class="badge-verified">${gameState.isRecoveryCodeSolved() ? 'AUDIT VERIFIED' : 'READY TO DEBUG'}</span>
          </div>
          <p class="server-launch-desc">A damaged permission-rollback script recovered from the SAGE replay archive. Open it to inspect and correct the faults preventing it from running.</p>
          <button class="clickable-code-link" id="open-recovery-code-btn">🐍 <u>OPEN recovery_code</u></button>
        </div>
      `;
    }

    if (file.id === 'NETTRACE') {
      return `
        <div class="server-document-view server-launch-view">
          <div class="doc-meta-bar">
            <h3>🌐 nettrace — decrypted</h3>
            <span class="badge-verified">${gameState.isNettraceComplete() ? 'TRACE COMPLETE' : 'READY TO RUN'}</span>
          </div>
          <p class="server-launch-desc">The SAGE Perimeter Firewall capture buffer for the incident window. Filter, inspect packets, and resolve the source of the intrusion.</p>
          <button class="clickable-code-link" id="open-nettrace-btn">🌐 <u>OPEN nettrace</u></button>
        </div>
      `;
    }

    const prop = PROPS[file.id];
    if (file.id === "S02") {
      return `
        <div class="server-document-view">
          <div class="doc-meta-bar">
            <h3>FACILITY PHYSICAL ACCESS LOG</h3>
            <span class="badge-verified">SECURITY ARCHIVE VERIFIED</span>
          </div>
          <table class="cyber-table">
            <thead><tr><th>Timestamp</th><th>Sensor Location / Gate</th><th>Recorded Event Description</th></tr></thead>
            <tbody>
              ${prop.content.events.map(ev => `
                <tr class="${ev.time.includes('02:44') ? 'highlight-row' : ''}">
                  <td><code>${ev.time}</code></td><td><strong>${ev.gate}</strong></td><td>${ev.event}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="key-observation-box" style="margin-top: 14px;">ℹ️ <strong>Physical Alibi Record:</strong> ${prop.content.note}</div>
        </div>
      `;
    }

    if (file.id === "S04") {
      return `
        <div class="server-document-view">
          <div class="doc-meta-bar">
            <h3>INTERNAL COMMUNICATION THREAD</h3>
            <span class="badge-chat">SECURE ARCHIVE</span>
          </div>
          <div class="chat-thread-container">
            ${prop.content.messages.map(m => `
              <div class="chat-bubble-card ${m.sender.includes('Meera') ? 'meera-msg' : 'divya-msg'}">
                <div class="chat-bubble-header"><strong>${m.sender}</strong><span class="chat-time">${m.time}</span></div>
                <div class="chat-bubble-text">${m.text}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `<div class="server-document-view"><p>File not found.</p></div>`;
  }

  bindEvents() {
    this.container.querySelectorAll('.server-file-item').forEach(item => {
      item.addEventListener('click', () => {
        this.activeFileId = item.getAttribute('data-id');
        sound.playKeyClick();
        this.render();
        this.bindEvents();
      });
    });

    const openRecoveryBtn = this.container.querySelector('#open-recovery-code-btn');
    if (openRecoveryBtn && this.onOpenFile) {
      openRecoveryBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.onOpenFile('code');
      });
    }

    const openNettraceBtn = this.container.querySelector('#open-nettrace-btn');
    if (openNettraceBtn && this.onOpenFile) {
      openNettraceBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.onOpenFile('network');
      });
    }
  }
}

