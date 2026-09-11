/**
 * THE EPOCH - recovery_code
 * Embeds the exact provided multi-language ("SAGE permission rollback")
 * debugging console as an iframe — restyled to our color scheme and font
 * (see assets/recovery_code_console.html), with all original puzzle logic
 * left completely untouched. The embedded console posts a message back to
 * this component the moment all 5 faults are corrected (in ANY one of the
 * four languages) and the replay completes, which is what actually
 * advances game state.
 *
 * IMPORTANT (bug fix): once the iframe has been created for this window
 * session, later re-renders (e.g. triggered by the very
 * 'RECOVERY_CODE_SOLVED' event this component itself causes) must NOT
 * recreate the <iframe> element. Replacing container.innerHTML rebuilds a
 * brand-new iframe, which forces a full reload of the embedded document —
 * wiping out the participant's just-completed fix and making the puzzle
 * look like it "reset" until they solve it a second time. We now build the
 * iframe once per unlock and only patch the small banner above it in place.
 */

import { gameState } from '../state.js';

export class CodeEditorComponent {
  constructor(container) {
    this.container = container;
    this.iframeBuilt = false;
    this._onMessage = (e) => {
      if (e && e.data && e.data.type === 'RECOVERY_CODE_SOLVED') {
        gameState.markRecoveryCodeSolved();
      }
    };
    this.init();
  }

  init() {
    this.render();
    window.addEventListener('message', this._onMessage);

    gameState.subscribe((event) => {
      if (event === 'GAME_RESET') {
        // A real reset should give a fresh puzzle — rebuild from scratch.
        this.iframeBuilt = false;
        this.render();
        return;
      }
      if (event === 'SUSPECT_FINALIZED' || event === 'RECOVERY_CODE_SOLVED') {
        this.render();
      }
    });
  }

  render() {
    const isUnlocked = !gameState.isRecoveryCodeLocked();
    const isSolved = gameState.isRecoveryCodeSolved();

    if (!isUnlocked) {
      this.iframeBuilt = false;
      this.container.innerHTML = `
        <div class="app-locked-overlay">
          <div class="lock-icon">🔒</div>
          <h3>MODULE ENCRYPTED: recovery_code</h3>
          <p>Finalize any 1 suspect in suspects_db to decrypt this recovery script.</p>
        </div>
      `;
      return;
    }

    if (!this.iframeBuilt) {
      // Build the wrapper + iframe exactly once per unlock. The banner gets
      // its own dedicated element so later updates never touch the iframe.
      this.container.innerHTML = `
        <div class="recovery-code-frame-wrap">
          <div id="recovery-code-banner"></div>
          <iframe
            src="/assets/recovery_code_console.html"
            class="recovery-code-iframe"
            title="recovery_code debugging console"
            referrerpolicy="no-referrer">
          </iframe>
        </div>
      `;
      this.iframeBuilt = true;
    }

    this.updateBanner(isSolved);
  }

  updateBanner(isSolved) {
    const banner = this.container.querySelector('#recovery-code-banner');
    if (!banner) return;
    banner.innerHTML = isSolved
      ? `<div class="solved-banner" style="margin: 0;">✔ recovery_code SOLVED — return to suspects_db to finalize your next suspect.</div>`
      : '';
  }
}
