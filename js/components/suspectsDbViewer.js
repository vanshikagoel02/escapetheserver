/**
 * THE EPOCH - suspects_db
 * 10 dossiers. Participants may check exactly ONE box at a time (single
 * select), then click FINALIZE. ANY suspect (main or witness) may be
 * finalized into any of the 3 open slots — there is no "wrong suspect"
 * block. Correctness is judged manually by the GM afterward; every
 * finalization is timestamped and logged. Once finalized, a suspect can
 * never be re-selected or changed.
 */

import { gameState } from '../state.js';
import { sound } from '../audio.js';

export class SuspectsDbViewerComponent {
  constructor(container) {
    this.container = container;
    this.pendingId = null; // single selected-but-not-finalized suspect id
    this.errorMsg = '';
    this.selectedForDetail = '02';
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    gameState.subscribe((event) => {
      if (['SUSPECT_FINALIZED', 'NETTRACE_SOLVED', 'CCTV_CAM_VIEWED', 'GAME_RESET'].includes(event)) {
        this.render();
        this.bindEvents();
      }
    });
  }

  render() {
    const all = gameState.getAllSuspects();
    const cleared = all.filter(s => s.finalization).sort((a, b) => a.finalization.slot - b.finalization.slot);
    const uncleared = all.filter(s => !s.finalization);
    const count = gameState.getFinalizedCount();
    const detail = gameState.getSuspect(this.selectedForDetail) || uncleared[0] || all[0];

    this.container.innerHTML = `
      <div class="sdb-layout">
        <!-- Left: dossier grid -->
        <div class="sdb-grid-column">
          <div class="sdb-header">
            <span class="folder-title-tag">🗂️ /suspects_db — 10 PERSONNEL RECORDS</span>
            <span class="sdb-stage-hint">${this.stageHintText(count)}</span>
          </div>

          <div class="sdb-cards-scroll">
            ${uncleared.length === 0 ? `<div class="sdb-empty">All 3 clearance slots are finalized. Continue to the Final Investigation console.</div>` : ''}
            ${uncleared.map(s => this.renderCard(s)).join('')}
          </div>

          <div class="sdb-finalize-bar ${!this.pendingId ? 'hidden' : ''}">
            <span>1 suspect selected — finalizing cannot be undone.</span>
            <button id="sdb-finalize-btn" class="sdb-finalize-btn">FINALIZE</button>
          </div>

          ${this.errorMsg ? `<div class="sdb-global-error">⚠ ${this.errorMsg}</div>` : ''}

          ${cleared.length > 0 ? `
            <div class="sdb-cleared-section">
              <div class="sdb-cleared-title">FINALIZED (${cleared.length}/3)</div>
              ${cleared.map(s => `
                <div class="sdb-cleared-row">
                  <span class="sdb-cleared-slot">Slot ${s.finalization.slot}</span>
                  <span class="sdb-cleared-name">${s.name}</span>
                  <span class="sdb-cleared-time">Finalized at: ${s.finalization.timestamp}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Right: dossier detail preview -->
        <div class="sdb-detail-column">
          ${detail ? this.renderDetail(detail) : ''}
        </div>
      </div>
    `;
  }

  stageHintText(count) {
    if (count >= 3) return 'ALL SLOTS FINALIZED — proceed to Final Investigation';
    if (count === 2) {
      return gameState.canFinalizeThirdSlot()
        ? 'SLOT 3 OF 3 — select any suspect to finalize'
        : 'SLOT 3 LOCKED — solve nettrace and watch both CCTV cameras first';
    }
    return `SLOT ${count + 1} OF 3 — select any suspect to finalize`;
  }

  renderCard(s) {
    const checked = this.pendingId === s.id;
    return `
      <label class="sdb-card ${checked ? 'checked' : ''}" data-id="${s.id}">
        <input type="checkbox" class="sdb-checkbox" data-id="${s.id}" ${checked ? 'checked' : ''}>
        <div class="sdb-card-body">
          <div class="sdb-card-top">
            <span class="sdb-code-tag">${s.code}</span>
            <span class="sdb-type-tag">${s.stamp}</span>
          </div>
          <div class="sdb-card-name">${s.name}</div>
          <div class="sdb-card-role">${s.role}</div>
        </div>
        <button class="sdb-view-btn" data-view="${s.id}" title="View dossier">VIEW ▸</button>
      </label>
    `;
  }

  renderDetail(s) {
    return `
      <div class="sdb-dossier-sheet">
        <div class="sdb-dossier-header">
          <span class="sdb-code-tag">${s.code}</span>
          <span class="sdb-type-tag">${s.stamp}</span>
        </div>
        <h2 class="sdb-dossier-name">${s.name}</h2>
        <div class="sdb-dossier-role">${s.role}</div>

        <div class="sdb-dossier-block"><strong>Last Seen:</strong> ${s.lastSeen}</div>
        <div class="sdb-dossier-block"><strong>Alibi:</strong> ${s.alibi}</div>
        <div class="sdb-dossier-block"><strong>Motive:</strong> ${s.motive}</div>
        ${s.notes ? `<div class="sdb-dossier-block lead"><strong>Investigator's Notes:</strong> ${s.notes}</div>` : ''}

        ${s.finalization ? `
          <div class="sdb-dossier-status cleared">
            FINALIZED (Slot ${s.finalization.slot}) — at ${s.finalization.timestamp}
          </div>
        ` : ''}
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.sdb-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.getAttribute('data-id');
        // Single-select: checking one box unchecks any other pending box.
        this.pendingId = cb.checked ? id : null;
        this.errorMsg = '';
        sound.playKeyClick();
        this.render();
        this.bindEvents();
      });
    });

    this.container.querySelectorAll('.sdb-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectedForDetail = btn.getAttribute('data-view');
        sound.playKeyClick();
        this.render();
        this.bindEvents();
      });
    });

    const finalizeBtn = this.container.querySelector('#sdb-finalize-btn');
    if (finalizeBtn) {
      finalizeBtn.addEventListener('click', () => {
        if (!this.pendingId) return;
        const res = gameState.finalizeSuspect(this.pendingId);
        if (res.success) {
          sound.playUnlockLevel();
          this.pendingId = null;
          this.errorMsg = '';
        } else if (!res.alreadyFinalized) {
          this.errorMsg = res.message;
          sound.playError();
        } else {
          this.pendingId = null;
        }
        this.render();
        this.bindEvents();
      });
    }
  }
}
