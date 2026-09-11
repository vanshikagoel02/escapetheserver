/**
 * THE EPOCH - Final Investigation / restore_engine
 * Phases: locked -> accuse -> envelope -> warning -> ramlogin -> wipecontrol -> solved
 * Once solved, this window always shows the final "recovering" screen and
 * never reopens the accusation form, even after a refresh.
 */

import { gameState } from '../state.js';
import { sound } from '../audio.js';

export class RestoreViewerComponent {
  constructor(container) {
    this.container = container;
    this.phase = 'accuse';
    this.wipeTickInterval = null;
    this.init();
  }

  init() {
    this.syncPhaseFromState();
    this.render();
    this.bindEvents();

    gameState.subscribe((event) => {
      if (['SUSPECT_FINALIZED', 'FINAL_ACCUSATION_SUBMITTED', 'RAM_PC_LOGIN_SUCCESS', 'WIPE_STOPPED', 'GAME_RESET'].includes(event)) {
        this.syncPhaseFromState();
        this.render();
        this.bindEvents();
      }
    });
  }

  syncPhaseFromState() {
    const s = gameState.data;
    if (s.wipeStopped) this.phase = 'solved';
    else if (s.ramLoginSuccess) this.phase = 'wipecontrol';
    else if (s.finalSubmissionTimestamp) this.phase = 'warning';
    else this.phase = 'accuse';
  }

  render() {
    if (gameState.isFinalStageLocked()) {
      this.container.innerHTML = `
        <div class="app-locked-overlay">
          <div class="lock-icon">🔒</div>
          <h3>FINAL INVESTIGATION LOCKED</h3>
          <p>Finalize all 3 suspects in suspects_db before the Final Investigation console decrypts.</p>
        </div>
      `;
      return;
    }

    if (this.phase === 'accuse') return this.renderAccuse();
    if (this.phase === 'envelope') return this.renderEnvelope();
    if (this.phase === 'warning') return this.renderWarning();
    if (this.phase === 'ramlogin') return this.renderRamLogin();
    if (this.phase === 'wipecontrol') return this.renderWipeControl();
    if (this.phase === 'solved') return this.renderSolved();
  }

  renderAccuse() {
    const alreadyFinalizedIds = gameState.data.finalizations.map(f => f.id);
    const suspects = gameState.getAllSuspects().filter(s => !alreadyFinalizedIds.includes(s.id));
    this.container.innerHTML = `
      <div class="restore-console-layout">
        <div class="restore-header">
          <div class="restore-shield">🔐</div>
          <div>
            <h2>FINAL INVESTIGATION — IDENTIFY THE RESPONSIBLE PARTY</h2>
            <p>All 3 clearance slots are finalized. Based on everything recovered, name the person responsible and give 3 reasons why.</p>
          </div>
        </div>

        <div class="restore-form-box">
          <div class="form-group">
            <label>WHO IS RESPONSIBLE:</label>
            <select id="final-accused-select" class="cyber-select">
              <option value="">-- SELECT THE RESPONSIBLE PARTY --</option>
              ${suspects.map(s => `<option value="${s.name}">${s.name} (${s.role})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>REASON 1:</label>
            <textarea id="final-reason-1" class="cyber-textarea small" placeholder="Your first reason..."></textarea>
          </div>
          <div class="form-group">
            <label>REASON 2:</label>
            <textarea id="final-reason-2" class="cyber-textarea small" placeholder="Your second reason..."></textarea>
          </div>
          <div class="form-group">
            <label>REASON 3:</label>
            <textarea id="final-reason-3" class="cyber-textarea small" placeholder="Your third reason..."></textarea>
          </div>

          <div id="final-submit-feedback" class="feedback-msg"></div>

          <div class="form-actions">
            <button id="final-submit-btn" class="cyber-submit-btn">📨 SUBMIT INVESTIGATION REPORT</button>
          </div>
        </div>

        <div class="envelope-dock" id="envelope-dock"></div>
      </div>
    `;
  }

  renderEnvelope() {
    this.container.innerHTML = `
      <div class="restore-console-layout envelope-phase">
        <div class="envelope-anim-stage">
          <div class="envelope-graphic flying">
            <div class="envelope-flap"></div>
            <div class="envelope-body">✉</div>
          </div>
          <p class="envelope-caption">Packaging your investigation report and transmitting to Game Control...</p>
        </div>
      </div>
    `;
    setTimeout(() => {
      this.phase = 'warning';
      this.render();
      this.bindEvents();
    }, 1800);
  }

  renderWarning() {
    const s = gameState.data;
    this.container.innerHTML = `
      <div class="restore-console-layout">
        <div class="wipe-warning-banner">
          <div class="warning-icon">⚠</div>
          <div>
            <div class="warning-title">92% DATA WIPED OUT ALREADY</div>
            <div class="warning-sub">LOGIN FROM HOST'S ACCOUNT TO STOP THE WIPE</div>
          </div>
        </div>

        <div class="restore-header">
          <div class="restore-shield">📨</div>
          <div>
            <h2>REPORT TRANSMITTED</h2>
            <p>Accused: <strong>${s.finalMurderer}</strong> — filed at ${s.finalSubmissionTimestamp}</p>
          </div>
        </div>

        <div class="key-observation-box error" style="margin: 10px 24px;">
          The remote wipe process has now destroyed 92% of the database. To stop the wipe, log in to host's account using credentials you recovered earlier
        </div>

        <div class="form-actions" style="padding: 0 24px 20px;">
          <button id="go-ramlogin-btn" class="cyber-submit-btn">🔑 LOGIN TO WS-14</button>
        </div>
      </div>
    `;
  }

  renderRamLogin() {
    this.container.innerHTML = `
      <div class="restore-console-layout">
        <div class="ramlogin-card">
          <div class="ramlogin-header">
            <div class="ramlogin-avatar">WS</div>
            <div>
              <h2>WS-14 — WORKSTATION LOGIN</h2>
              <div class="lock-userrole">EPOCHCORP-INTRANET-SECURE</div>
            </div>
          </div>
          <div class="lock-input-group" style="margin-top: 18px;">
            <input type="text" id="ram-username-input" class="lock-input" placeholder="USERNAME" autocomplete="off">
            <input type="password" id="ram-password-input" class="lock-input" placeholder="PASSWORD" autocomplete="off">
            <button id="ram-login-btn" class="lock-submit-btn">LOG IN</button>
          </div>
          <div id="ram-login-error" class="lock-error hidden"></div>
        </div>
      </div>
    `;
  }

  renderWipeControl() {
    this.container.innerHTML = `
      <div class="restore-console-layout">
        <div class="server-wipe-dashboard" style="padding: 24px;">
          <div class="wipe-status-heading">GRANT LEDGER — FINANCIAL DATA WIPE</div>
          <div class="wipe-big-percent-box live" style="max-width: 420px;">
            <div class="huge-digital-percent live-pulse" id="final-wipe-percent">92.0%</div>
            <div class="live-wipe-bar-track"><div class="live-wipe-bar-fill" id="final-wipe-bar" style="width:92%;"></div></div>
            <div class="percent-subtext">of the Grant Ledger destroyed — climbing</div>
          </div>
          <div class="form-actions" style="margin-top: 24px;">
            <button id="stop-wipe-btn" class="cyber-submit-btn danger-pulse">⏹ STOP WIPE</button>
          </div>
        </div>
      </div>
    `;
    this.startFinalWipeTick();
  }

  startFinalWipeTick() {
    if (this.wipeTickInterval) clearInterval(this.wipeTickInterval);
    let pct = 92;
    this.wipeTickInterval = setInterval(() => {
      if (gameState.data.wipeStopped) { clearInterval(this.wipeTickInterval); return; }
      pct = Math.min(99.9, pct + 0.3);
      const el = this.container.querySelector('#final-wipe-percent');
      const bar = this.container.querySelector('#final-wipe-bar');
      if (el) el.textContent = `${pct.toFixed(1)}%`;
      if (bar) bar.style.width = `${pct}%`;
    }, 500);
  }

  renderSolved() {
    if (this.wipeTickInterval) clearInterval(this.wipeTickInterval);
    this.container.innerHTML = `
      <div class="case-solved-card">
        <div class="case-solved-crest">💾 DATA RECOVERY IN PROGRESS</div>
        <h2>92% OF WIPED DATA IS NOW RECOVERING…</h2>
        <div class="key-observation-box" style="margin: 16px 24px;">
          Financial records show funds were being routed through a phantom department: <strong>NULLDEPT</strong>.
        </div>
        <div class="restored-status-action">
          <div class="status-badge-green">✔ REMOTE WIPE TERMINATED</div>
          <div class="status-badge-green">✔ DATA RECOVERING</div>
          <div class="status-badge-green">✔ SYSTEM SECURED</div>
        </div>
        <h1 class="finished-thankyou">GAME FINISHED. DONE. THANK YOU.</h1>
      </div>
    `;
  }

  bindEvents() {
    const submitBtn = this.container.querySelector('#final-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const sel = this.container.querySelector('#final-accused-select');
        const r1 = this.container.querySelector('#final-reason-1');
        const r2 = this.container.querySelector('#final-reason-2');
        const r3 = this.container.querySelector('#final-reason-3');
        const feedback = this.container.querySelector('#final-submit-feedback');

        const reasons = [r1, r2, r3].map(el => (el ? el.value.trim() : ''));
        if (reasons.some(r => r.length < 5)) {
          if (feedback) {
            feedback.className = 'feedback-msg error';
            feedback.textContent = 'Please fill in all 3 reasons with a bit more detail.';
          }
          return;
        }
        const combined = `1) ${reasons[0]}\n2) ${reasons[1]}\n3) ${reasons[2]}`;
        const res = gameState.submitFinalAccusation(sel ? sel.value : '', combined);
        if (res.success) {
          this.phase = 'envelope';
          this.render();
          this.bindEvents();
        } else if (feedback) {
          feedback.className = 'feedback-msg error';
          feedback.textContent = res.message;
        }
      });
    }

    const goRamLoginBtn = this.container.querySelector('#go-ramlogin-btn');
    if (goRamLoginBtn) {
      goRamLoginBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.phase = 'ramlogin';
        this.render();
        this.bindEvents();
      });
    }

    const ramLoginBtn = this.container.querySelector('#ram-login-btn');
    if (ramLoginBtn) {
      const doLogin = () => {
        const u = this.container.querySelector('#ram-username-input');
        const p = this.container.querySelector('#ram-password-input');
        const err = this.container.querySelector('#ram-login-error');
        const res = gameState.submitRamPcLogin(u ? u.value : '', p ? p.value : '');
        if (res.success) {
          this.phase = 'wipecontrol';
          this.render();
          this.bindEvents();
        } else if (err) {
          err.textContent = res.message;
          err.classList.remove('hidden');
        }
      };
      ramLoginBtn.addEventListener('click', doLogin);
      const pwInput = this.container.querySelector('#ram-password-input');
      if (pwInput) pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
    }

    const stopWipeBtn = this.container.querySelector('#stop-wipe-btn');
    if (stopWipeBtn) {
      stopWipeBtn.addEventListener('click', () => {
        gameState.stopDataWipe();
        this.phase = 'solved';
        this.render();
        this.bindEvents();
      });
    }
  }
}
