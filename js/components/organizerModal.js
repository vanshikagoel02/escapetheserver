/**
 * THE EPOCH - Organizer & GM Control Panel
 * Secure Password-Protected Panel for Game Masters.
 * Provides per-team game status, tab-switch violation monitoring,
 * single-team GM Resume controls, final suspect & reasoning inspection,
 * and complete event audit logs.
 */

import { gameState, getISTTimestamp } from '../state.js';
import { sound } from '../audio.js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export class OrganizerModalComponent {
  constructor(modalContainer) {
    this.modal = modalContainer;
    this.unlocked = false;
    this.pwError = '';
    this.activeTab = 'allteams'; // default to multi-team dashboard for GMs
    this.allTeamsData = null;
    this.refreshInterval = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    gameState.subscribe((event) => {
      if (['LEVEL_CHANGED', 'TIMER_CHANGED', 'GAME_RESET', 'EVENT_LOGGED', 'TAB_SWITCH_VIOLATION', 'VIOLATION_CLEARED'].includes(event)) {
        if (!this.modal.classList.contains('hidden')) {
          this.render();
          this.bindEvents();
        }
      }
    });
  }

  show() {
    this.render();
    this.bindEvents();
    this.modal.classList.remove('hidden');
    this.startAutoRefresh();
  }

  hide() {
    this.modal.classList.add('hidden');
    this.stopAutoRefresh();
    // AUTO-LOCK: require the GM password again next time this panel opens.
    this.unlocked = false;
    this.pwError = '';
  }

  startAutoRefresh() {
    this.stopAutoRefresh();
    this.refreshInterval = setInterval(() => {
      if (this.unlocked && !this.modal.classList.contains('hidden')) {
        this.fetchAllTeams(true);
      }
    }, 3000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  render() {
    if (!this.unlocked) {
      this.modal.innerHTML = `
        <div class="organizer-drawer-card gm-gate-card">
          <div class="org-header">
            <div class="org-title"><span class="org-badge">GM CONTROL</span><h2>ORGANIZER ACCESS ONLY</h2></div>
            <button class="org-close-btn" id="close-org-modal">✕</button>
          </div>
          <div class="org-section" style="padding: 24px; text-align: center;">
            <p class="org-sub" style="margin-bottom: 16px;">This panel is restricted strictly to Game Masters and Event Organizers.</p>
            <div class="lock-input-group" style="max-width: 380px; margin: 0 auto 12px;">
              <input type="password" id="gm-password-input" class="lock-input" placeholder="ENTER GM PASSWORD" autocomplete="off" autofocus>
              <button id="gm-password-submit" class="lock-submit-btn">UNLOCK</button>
            </div>
            ${this.pwError ? `<div class="lock-error" style="max-width: 380px; margin: 8px auto;">${this.pwError}</div>` : ''}
          </div>
        </div>
      `;
      return;
    }

    const s = gameState.data;
    const mins = Math.floor(s.timerSeconds / 60);
    const secs = s.timerSeconds % 60;
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    this.modal.innerHTML = `
      <div class="organizer-drawer-card">
        <div class="org-header">
          <div class="org-title">
            <span class="org-badge">GM CONTROL</span>
            <h2>ORGANIZER & EVENT MASTER PANEL — LIVE COMMAND CENTER</h2>
          </div>
          <button class="org-close-btn" id="close-org-modal">✕</button>
        </div>

        <div class="org-tab-row">
          <button class="org-tab-btn ${this.activeTab === 'allteams' ? 'active' : ''}" data-tab="allteams">👥 All Teams Dashboard</button>
          <button class="org-tab-btn ${this.activeTab === 'submissions' ? 'active' : ''}" data-tab="submissions">📑 Final Submissions & Reasoning</button>
          <button class="org-tab-btn ${this.activeTab === 'stage' ? 'active' : ''}" data-tab="stage">⚙ Station & Timer Control</button>
          <button class="org-tab-btn ${this.activeTab === 'log' ? 'active' : ''}" data-tab="log">🧾 Complete Audit Log</button>
        </div>

        <div class="org-body-tabs">
          ${this.activeTab === 'allteams' ? this.renderAllTeamsTab() : ''}
          ${this.activeTab === 'submissions' ? this.renderSubmissionsTab() : ''}
          ${this.activeTab === 'stage' ? this.renderStageTab(s, timeFormatted) : ''}
          ${this.activeTab === 'log' ? this.renderLogTab() : ''}
        </div>
      </div>
    `;

    if (this.activeTab === 'allteams' && this.allTeamsData === null) {
      this.fetchAllTeams();
    }
  }

  renderAllTeamsTab() {
    if (this.allTeamsData === null) {
      return `<div class="org-section"><p class="org-sub">Connecting to host server for live team status…</p></div>`;
    }

    const teams = this.allTeamsData || {};
    const teamEntries = Object.entries(teams);

    return `
      <div class="org-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3>🌐 LIVE TEAMS MONITORING & HALT RESUME CONTROL (${teamEntries.length} Active Station Sessions)</h3>
          <button class="org-ctrl-btn" id="refresh-teams-btn">🔄 Refresh Data</button>
        </div>
        
        <div class="gm-event-log-scroll" style="max-height: 520px;">
          <table class="cyber-table small-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Status</th>
                <th>Current Stage</th>
                <th>Halt Details</th>
                <th>Final Suspect</th>
                <th>Last Activity</th>
                <th>GM Action</th>
              </tr>
            </thead>
            <tbody>
              ${teamEntries.length === 0 ? `
                <tr><td colspan="7" style="text-align: center; padding: 20px;">No team sessions recorded yet. Launch participant browsers with <code>?team=TEAM01</code>.</td></tr>
              ` : teamEntries.map(([id, t]) => {
                const isHalted = t.gameHalted || (t.lastEvent && t.lastEvent.type === 'TAB_SWITCH_VIOLATION');
                const statusBadge = isHalted
                  ? `<span class="gm-status-badge halted">🚨 GAME HALTED</span>`
                  : (t.stage === 6 || t.wipeStopped ? `<span class="gm-status-badge completed">✔ COMPLETED</span>` : `<span class="gm-status-badge active">🟢 ACTIVE</span>`);
                
                const stageName = this.formatStageName(t.stage);
                const haltInfo = isHalted
                  ? `<div class="halt-reason-text"><strong>${t.haltReason || 'TAB / WINDOW SWITCH'}</strong><br><small>Halted at: ${t.haltTimestamp || (t.lastEvent ? t.lastEvent.clock : '—')}</small></div>`
                  : `<span style="color:var(--text-muted);">None</span>`;

                const suspectInfo = t.finalMurderer
                  ? `<strong style="color:var(--accent-amber);">${escapeHtml(t.finalMurderer)}</strong><br><small style="color:var(--text-muted);">${t.finalSubmissionTimestamp || 'Submitted'}</small>`
                  : `<span style="color:var(--text-muted);">NOT SUBMITTED</span>`;

                return `
                  <tr class="${isHalted ? 'row-halted' : ''}">
                    <td><strong style="font-size: 14px; color: #fff;">${escapeHtml(id)}</strong></td>
                    <td>${statusBadge}</td>
                    <td><code>${stageName}</code></td>
                    <td>${haltInfo}</td>
                    <td>${suspectInfo}</td>
                    <td><code>${t.lastUpdate || (t.lastEvent ? t.lastEvent.clock : '—')}</code></td>
                    <td>
                      ${isHalted ? `
                        <button class="org-ctrl-btn gm-resume-team-btn" data-teamid="${escapeHtml(id)}">▶ RESUME GAME</button>
                      ` : `
                        <span style="color: var(--accent-green); font-size: 11px;">Running normally</span>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderSubmissionsTab() {
    const teams = this.allTeamsData || {};
    const teamEntries = Object.entries(teams);

    return `
      <div class="org-section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3>📑 FINAL INVESTIGATION SUBMISSIONS & PARTICIPANT REASONING</h3>
          <button class="org-ctrl-btn" id="refresh-teams-btn">🔄 Refresh Data</button>
        </div>
        <p class="org-sub" style="margin-bottom: 14px;">Displays the exact suspect choice, full participant-written explanation, and submission timestamp for each team.</p>

        <div class="gm-event-log-scroll" style="max-height: 520px;">
          ${teamEntries.length === 0 ? `
            <div class="org-sub" style="text-align: center; padding: 20px;">No team submissions recorded yet.</div>
          ` : teamEntries.map(([id, t]) => {
            const hasSubmitted = !!t.finalMurderer;
            return `
              <div class="gm-submission-card" style="background: rgba(15, 23, 42, 0.9); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 10px;">
                  <div>
                    <span class="org-badge">TEAM ID: ${escapeHtml(id)}</span>
                    <strong style="margin-left: 10px; font-size: 15px; color: #fff;">${hasSubmitted ? `Final Suspect: <span style="color: var(--accent-amber);">${escapeHtml(t.finalMurderer)}</span>` : '<span style="color: var(--text-muted);">NOT SUBMITTED YET</span>'}</strong>
                  </div>
                  <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
                    ${hasSubmitted ? `Submitted at: <strong style="color:var(--accent-cyan);">${escapeHtml(t.finalSubmissionTimestamp)}</strong>` : 'Status: In Progress'}
                  </div>
                </div>

                ${hasSubmitted ? `
                  <div class="gm-reasoning-full" style="background: #060b11; border: 1px solid #1e2e42; border-radius: 6px; padding: 12px; font-family: var(--font-sans); font-size: 13px; color: #e2e8f0; line-height: 1.5; white-space: pre-wrap;">
                    <div style="font-family: var(--font-mono); font-size: 10px; color: var(--accent-cyan); font-weight: 700; margin-bottom: 6px;">PARTICIPANT WRITTEN REASONING:</div>
                    ${escapeHtml(t.finalReasoning)}
                  </div>
                ` : `
                  <div style="font-style: italic; font-size: 12px; color: var(--text-muted);">Participant team has not completed their final accusation report.</div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderStageTab(s, timeFormatted) {
    return `
      <div class="org-section">
        <h3>🏷 CURRENT STATION TEAM IDENTITY</h3>
        <div class="timer-control-bar">
          <input type="text" id="team-id-input" class="cyber-input" style="max-width:220px;" placeholder="e.g. TEAM01" value="${escapeHtml(gameState.teamId || '')}">
          <button class="org-ctrl-btn" id="set-team-id-btn">SET TEAM ID</button>
        </div>
      </div>

      ${s.disqualified ? `
      <div class="org-section violation-section" style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); padding: 16px; border-radius: 8px;">
        <h3 style="color: #fca5a5;">🚨 TAB-SWITCH VIOLATION ACTIVE FOR THIS STATION</h3>
        <p class="org-sub">This team's game was halted at <strong>${s.disqualifiedTimestamp || 'recently'}</strong> for: <strong>${s.disqualifiedReason || 'TAB / WINDOW SWITCH'}</strong>.</p>
        <button id="clear-violation-btn" class="danger-reset-btn" style="margin-top: 10px;">✅ CLEAR VIOLATION & RESUME GAME</button>
      </div>
      ` : ''}

      <div class="org-section">
        <h3>⏱ REMOTE WIPE TIMER (60 MIN, SERVER-ANCHORED)</h3>
        <div class="timer-control-bar">
          <div class="org-timer-display">${timeFormatted}</div>
          <button class="org-ctrl-btn" id="org-pause-btn">${s.timerRunning ? '⏸ Pause Timer' : '▶ Resume Timer'}</button>
          <button class="org-ctrl-btn" id="org-add5-btn">+5 Minutes</button>
          <button class="org-ctrl-btn" id="org-sub5-btn">-5 Minutes</button>
          <button class="org-ctrl-btn" id="org-set60-btn">Reset to 60m</button>
        </div>
        <p class="org-sub">Timer is anchored to a start timestamp — refreshing the browser will NOT reset it.</p>
      </div>

      <div class="org-section">
        <h3>⚡ QUICK STAGE JUMP (FOR GM ASSISTANCE)</h3>
        <div class="stage-jump-grid">
          <button class="stage-btn" data-stage="RESET">RESET — Lock Screen</button>
          <button class="stage-btn" data-stage="SLOT1">Through: Slot 1 Finalized</button>
          <button class="stage-btn" data-stage="SLOT2">Through: Slot 2 Finalized</button>
          <button class="stage-btn" data-stage="NETTRACE_CCTV">Through: nettrace + CCTV</button>
          <button class="stage-btn" data-stage="SLOT3">Through: Slot 3 Finalized</button>
          <button class="stage-btn" data-stage="FINAL">Through: Final Unlocked</button>
          <button class="stage-btn" data-stage="SOLVED">Through: Case Solved</button>
        </div>
      </div>

      <div class="org-section">
        <h3>🔄 COMPLETE STATION RESET (FOR NEXT TEAM)</h3>
        <p class="org-sub">Clears all local progress and restarts from State 0 for this station.</p>
        <button id="org-full-reset-btn" class="danger-reset-btn">⚠ FULL GAME RESET FOR NEXT TEAM</button>
      </div>

      <div class="org-section">
        <h3>📑 SOLUTION KEY (ORGANIZER CONFIDENTIAL)</h3>
        <table class="cyber-table small-table">
          <thead><tr><th>Person</th><th>Verdict</th><th>Key Evidence</th></tr></thead>
          <tbody>
            <tr><td><strong>Ram Sharma</strong></td><td>Not culprit</td><td>WS-14 authenticated; CCTV shows operator struggling with machine they don't own.</td></tr>
            <tr><td><strong>Prof. Anand Rao</strong></td><td>Not culprit</td><td>Left lunch at 5:40 PM; no re-entry recorded that night.</td></tr>
            <tr><td><strong>Divya Mehta</strong></td><td>Not culprit</td><td>Exposed permissions earlier; wipe session traces to WS-14, not her login.</td></tr>
            <tr style="background: rgba(239,68,68,0.15);"><td><strong style="color:#ef4444;">K. Verma</strong></td><td><strong>CULPRIT</strong></td><td>Grant ledger funds routed to NULLDEPT; car parked in Slot B-14 during wipe window.</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  renderLogTab() {
    const events = [...gameState.data.eventLog].reverse();
    return `
      <div class="org-section">
        <h3>🧾 COMPLETE AUDIT LOG — STATION & GM ACTIONS</h3>
        <p class="org-sub">${events.length} event(s) recorded for Team ${escapeHtml(gameState.teamId || 'UNASSIGNED')}.</p>
        <div class="gm-event-log-scroll" style="max-height: 500px;">
          <table class="cyber-table small-table">
            <thead><tr><th>Time</th><th>Team ID</th><th>Type</th><th>Details</th></tr></thead>
            <tbody>
              ${events.length === 0 ? `<tr><td colspan="4">No events recorded yet.</td></tr>` : events.map(ev => `
                <tr>
                  <td><code>${ev.clock || getISTTimestamp(new Date(ev.ts))}</code></td>
                  <td><strong>${escapeHtml(ev.teamId || gameState.teamId)}</strong></td>
                  <td><code>${escapeHtml(ev.type)}</code></td>
                  <td>
                    ${escapeHtml(ev.message)}
                    ${ev.meta && ev.meta.reasoning ? `<div class="gm-reasoning-block" style="margin-top:4px; font-size:11px; color:#cbd5e1; background:rgba(0,0,0,0.4); padding:6px; border-radius:4px;">"${escapeHtml(ev.meta.reasoning)}"</div>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  formatStageName(stage) {
    if (stage === 0 || stage === null) return 'LOCK SCREEN';
    if (stage === 6) return 'CASE CLOSED';
    if (typeof stage === 'string') return stage;
    return `STAGE ${stage}`;
  }

  async fetchAllTeams(silent = false) {
    try {
      const res = await fetch('/api/teams');
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      this.allTeamsData = data;
    } catch (e) {
      this.allTeamsData = false;
    }
    if (!silent) {
      this.render();
      this.bindEvents();
    } else {
      // Refresh active tab views dynamically
      const activeTabContent = this.modal.querySelector('.org-body-tabs');
      if (activeTabContent && this.activeTab === 'allteams') {
        activeTabContent.innerHTML = this.renderAllTeamsTab();
        this.bindEvents();
      } else if (activeTabContent && this.activeTab === 'submissions') {
        activeTabContent.innerHTML = this.renderSubmissionsTab();
        this.bindEvents();
      }
    }
  }

  async resumeTeamOnServer(teamId) {
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamId)}/resume`, { method: 'POST' });
      if (res.ok) {
        sound.playSuccess();
        // If resuming current station team, also clear local state
        if (teamId.toUpperCase() === (gameState.teamId || '').toUpperCase()) {
          gameState.clearViolation();
        }
        await this.fetchAllTeams();
      } else {
        sound.playError();
      }
    } catch (e) {
      sound.playError();
    }
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('#close-org-modal');
    if (closeBtn) closeBtn.onclick = () => this.hide();

    const pwSubmit = this.modal.querySelector('#gm-password-submit');
    const pwInput = this.modal.querySelector('#gm-password-input');
    if (pwSubmit && pwInput) {
      const doUnlock = () => {
        if (gameState.verifyGmPassword(pwInput.value)) {
          this.unlocked = true;
          this.pwError = '';
          sound.playSuccess();
        } else {
          this.pwError = 'Incorrect GM password.';
          sound.playError();
        }
        this.render();
        this.bindEvents();
      };
      pwSubmit.onclick = doUnlock;
      pwInput.onkeydown = (e) => { if (e.key === 'Enter') doUnlock(); };
    }

    this.modal.querySelectorAll('.org-tab-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeTab = btn.getAttribute('data-tab');
        if (this.activeTab === 'allteams' || this.activeTab === 'submissions') this.allTeamsData = null;
        sound.playKeyClick();
        this.render();
        this.bindEvents();
      };
    });

    const refreshTeamsBtn = this.modal.querySelector('#refresh-teams-btn');
    if (refreshTeamsBtn) refreshTeamsBtn.onclick = () => { this.allTeamsData = null; this.fetchAllTeams(); };

    // Multi-team GM Resume handler
    this.modal.querySelectorAll('.gm-resume-team-btn').forEach(btn => {
      btn.onclick = () => {
        const teamId = btn.getAttribute('data-teamid');
        if (teamId) this.resumeTeamOnServer(teamId);
      };
    });

    const setTeamIdBtn = this.modal.querySelector('#set-team-id-btn');
    const teamIdInput = this.modal.querySelector('#team-id-input');
    if (setTeamIdBtn && teamIdInput) {
      setTeamIdBtn.onclick = () => {
        gameState.setTeamId(teamIdInput.value);
        sound.playSuccess();
        this.render();
        this.bindEvents();
      };
    }

    this.modal.querySelectorAll('.stage-btn').forEach(btn => {
      btn.onclick = () => {
        const stage = btn.getAttribute('data-stage');
        if (stage === 'RESET') {
          gameState.resetGame();
        } else {
          gameState.forceUnlockThrough(stage);
        }
        sound.playSuccess();
        this.render();
        this.bindEvents();
      };
    });

    const pauseBtn = this.modal.querySelector('#org-pause-btn');
    if (pauseBtn) pauseBtn.onclick = () => {
      if (gameState.data.timerRunning) gameState.pauseTimer(); else gameState.resumeTimer();
      this.render(); this.bindEvents();
    };

    const add5Btn = this.modal.querySelector('#org-add5-btn');
    if (add5Btn) add5Btn.onclick = () => { gameState.addTime(300); this.render(); this.bindEvents(); };
    const sub5Btn = this.modal.querySelector('#org-sub5-btn');
    if (sub5Btn) sub5Btn.onclick = () => { gameState.addTime(-300); this.render(); this.bindEvents(); };
    const set60Btn = this.modal.querySelector('#org-set60-btn');
    if (set60Btn) set60Btn.onclick = () => { gameState.setTimerMinutes(60); this.render(); this.bindEvents(); };

    const resetBtn = this.modal.querySelector('#org-full-reset-btn');
    if (resetBtn) resetBtn.onclick = () => {
      if (confirm("Reset the entire escape game station for the next team? All progress will be wiped.")) {
        gameState.resetGame();
        sound.playSuccess();
        this.hide();
      }
    };

    const clearViolationBtn = this.modal.querySelector('#clear-violation-btn');
    if (clearViolationBtn) clearViolationBtn.onclick = () => {
      gameState.clearViolation();
      sound.playSuccess();
      this.render();
      this.bindEvents();
    };
  }
}

