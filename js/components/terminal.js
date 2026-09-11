/**
 * THE EPOCH - recovery_cli
 * Flavor forensic shell: status log + a couple of narrative commands.
 * Status is reported generically by SLOT NUMBER, never by suspect name —
 * participants must work out who to finalize themselves.
 */

import { gameState } from '../state.js';
import { sound } from '../audio.js';

export class TerminalComponent {
  constructor(container) {
    this.container = container;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();

    gameState.subscribe((event, payload) => {
      if (event === 'LOG_ADDED') {
        this.appendOutput(payload.msg);
      } else if (['LEVEL_CHANGED', 'LOGIN_SUCCESS', 'GAME_RESET', 'SUSPECT_FINALIZED',
                  'NETTRACE_SOLVED', 'RECOVERY_CODE_SOLVED', 'CCTV_CAM_VIEWED'].includes(event)) {
        this.render();
        this.bindEvents();
      }
    });
  }

  statusPanel() {
    const count = gameState.getFinalizedCount();
    const nettrace = gameState.isNettraceComplete();
    const recovery = gameState.isRecoveryCodeSolved();
    const cctv = gameState.isCctvFullyViewed();

    let nextStep = 'Open suspects_db and finalize any 1 suspect (Slot 1 of 3).';
    if (count >= 1 && !recovery) nextStep = 'Open SERVER → recovery_code and correct the faults.';
    else if (count === 1 && recovery) nextStep = 'Return to suspects_db and finalize your 2nd suspect (Slot 2 of 3).';
    else if (count >= 2 && !nettrace) nextStep = 'Open SERVER → nettrace and trace the intrusion.';
    else if (count >= 2 && nettrace && !cctv) nextStep = 'Open CCTV and review both camera feeds.';
    else if (count >= 2 && nettrace && cctv) nextStep = 'Return to suspects_db and finalize your 3rd suspect (Slot 3 of 3).';
    else if (count >= 3) nextStep = 'Open the Final Investigation console.';

    return `
      <div class="terminal-step-box">
        <div class="step-badge">INVESTIGATION STATUS</div>
        <div class="step-form-row" style="display:block; font-family: var(--font-mono); font-size: 12.5px; line-height: 1.9;">
          SLOT 1 OF 3 ....... ${count >= 1 ? 'FINALIZED' : 'OPEN'}<br>
          RECOVERY_CODE ..... ${recovery ? 'SOLVED' : (count >= 1 ? 'PENDING' : 'LOCKED')}<br>
          SLOT 2 OF 3 ....... ${count >= 2 ? 'FINALIZED' : 'LOCKED'}<br>
          NETTRACE .......... ${nettrace ? 'RESOLVED (WS-14)' : (count >= 2 ? 'PENDING' : 'LOCKED')}<br>
          CCTV .............. ${cctv ? 'BOTH CAMERAS VIEWED' : (nettrace ? 'PENDING' : 'LOCKED')}<br>
          SLOT 3 OF 3 ....... ${count >= 3 ? 'FINALIZED' : 'LOCKED'}<br>
        </div>
        <p class="step-desc" style="margin-top:8px; color: var(--accent-cyan);">NEXT STEP: ${nextStep}</p>
      </div>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="terminal-window">
        <div class="terminal-header-bar">
          <span class="term-tag">EPOCHCORP-WS08 :: FORENSIC AUDIT SHELL [v5.0]</span>
          <span class="term-status-pill">ONLINE</span>
        </div>
        <div class="terminal-body" id="term-output-area">
          <div class="term-banner">
========================================================================
 EPOCHCORP — INCIDENT INVESTIGATION CONSOLE
 SUSPECT CLEARANCE IS HANDLED VIA suspects_db (checkbox + FINALIZE)
 TYPE 'help' FOR AVAILABLE SYSTEM COMMANDS
========================================================================
          </div>
          <div id="term-logs"></div>
        </div>
        ${this.statusPanel()}
        <div class="terminal-cmd-line">
          <span class="term-prompt">meera@epochcorp-ws08:~$</span>
          <input type="text" id="term-cli-input" class="term-cli-field" autofocus placeholder="Type command or 'help'...">
          <button id="term-cli-submit" class="term-btn-small">RUN</button>
        </div>
      </div>
    `;

    const logsContainer = this.container.querySelector('#term-logs');
    if (logsContainer) {
      gameState.data.terminalHistory.forEach(entry => {
        const line = document.createElement('div');
        line.className = 'term-line';
        line.textContent = entry;
        logsContainer.appendChild(line);
      });
      this.scrollToBottom();
    }
  }

  bindEvents() {
    const cliInput = this.container.querySelector('#term-cli-input');
    const cliSubmit = this.container.querySelector('#term-cli-submit');

    if (cliInput) {
      cliInput.addEventListener('keydown', (e) => {
        sound.playKeyClick();
        if (e.key === 'Enter') { this.handleCommand(cliInput.value); cliInput.value = ''; }
      });
    }
    if (cliSubmit) {
      cliSubmit.addEventListener('click', () => {
        if (cliInput) { this.handleCommand(cliInput.value); cliInput.value = ''; }
      });
    }
  }

  handleCommand(cmd) {
    const raw = (cmd || '').trim();
    if (!raw) return;
    this.appendOutput(`$ ${raw}`);
    const parts = raw.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    switch (command) {
      case 'help':
        this.appendOutput(`Available Commands:
  status               - Show current investigation status
  fragments            - Display recovered case tokens
  trace <ip>           - Perform endpoint diagnostic trace (flavor only)
  clear_screen / cls   - Clear terminal logs

NOTE: Suspect clearance is done in suspects_db (checkboxes + FINALIZE),
not from this terminal.`);
        break;

      case 'status':
        this.appendOutput(`SLOTS FINALIZED: ${gameState.getFinalizedCount()} / 3
RECOVERY_CODE: ${gameState.isRecoveryCodeSolved() ? 'SOLVED' : 'PENDING'}
NETTRACE: ${gameState.isNettraceComplete() ? 'RESOLVED' : 'PENDING'}
CCTV: ${gameState.isCctvFullyViewed() ? 'BOTH CAMERAS VIEWED' : 'PENDING'}
REMOTE WIPE TIMER: ${Math.floor(gameState.data.timerSeconds / 60)}m ${gameState.data.timerSeconds % 60}s`);
        break;

      case 'fragments':
        this.appendOutput(`RECOVERED FRAGMENTS:
  Network:     [ ${gameState.data.fragments[3] || '???'} ]
  Fraud dept:  [ ${gameState.data.fragments[4] || '???'} ]`);
        break;

      case 'trace':
        this.appendOutput(`Tracing endpoint ${arg || '192.168.14.18'}...
HOP 1: 192.168.14.1 (GATEWAY-ROUTER) [0.4ms]
HOP 2: ${arg || '192.168.14.18'} (WS-14) [1.1ms]
Session authenticated — no failed attempts logged.`);
        break;

      case 'clear_screen':
      case 'cls': {
        const logs = this.container.querySelector('#term-logs');
        if (logs) logs.innerHTML = '';
        break;
      }

      default:
        this.appendOutput(`Unknown command: '${command}'. Type 'help' for valid commands.`);
        break;
    }
  }

  appendOutput(text) {
    const logsContainer = this.container.querySelector('#term-logs');
    if (!logsContainer) return;
    const div = document.createElement('div');
    div.className = 'term-line';
    div.textContent = text;
    logsContainer.appendChild(div);
    this.scrollToBottom();
  }

  scrollToBottom() {
    const body = this.container.querySelector('#term-output-area');
    if (body) body.scrollTop = body.scrollHeight;
  }
}
